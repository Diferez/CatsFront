import nock from 'nock';
import type { CatApiConfig } from '../src/config/environment';

describe('ImagesService', () => {
  const baseUrl = 'https://api.test-cat.com';

  const loadImagesService = async (overrides?: Partial<CatApiConfig>) => {
    jest.resetModules();
    jest.doMock('../src/config/environment', () => ({
      appConfig: {
        port: 3000,
        catApi: {
          baseUrl,
          apiKey: 'test-key',
          ...overrides
        },
        database: { uri: 'mongodb://test' }
      }
    }));

    const module = await import('../src/services/images.service');
    return module.ImagesService;
  };

  const createService = async (overrides?: Partial<CatApiConfig>) => {
    const Service = await loadImagesService(overrides);
    return new Service();
  };

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterEach(() => {
    nock.cleanAll();
  });

  afterAll(() => {
    nock.enableNetConnect();
    jest.resetModules();
  });

  it('fetches images by breed id with the default limit and maps breeds', async () => {
    const service = await createService();
    const apiResponse = [
      {
        id: 'img-1',
        url: 'https://images.test/img-1.jpg',
        width: 800,
        height: 600,
        breeds: [
          { id: 'abys', name: 'Abyssinian', temperament: 'Active' }
        ],
        extra: 'ignored'
      }
    ];

    const scope = nock(baseUrl)
      .get('/images/search')
      .query({ breed_ids: 'abys', limit: 5 })
      .reply(200, apiResponse);

    const result = await service.getImagesByBreedId('abys');

    expect(scope.isDone()).toBe(true);
    expect(result).toEqual([
      {
        id: 'img-1',
        url: 'https://images.test/img-1.jpg',
        width: 800,
        height: 600,
        breeds: [{ id: 'abys', name: 'Abyssinian' }]
      }
    ]);
  });

  it('uses the provided limit when supplied', async () => {
    const service = await createService();

    const scope = nock(baseUrl)
      .get('/images/search')
      .query({ breed_ids: 'sava', limit: 10 })
      .reply(200, []);

    const result = await service.getImagesByBreedId('sava', 10);

    expect(scope.isDone()).toBe(true);
    expect(result).toEqual([]);
  });

  it('throws when the CAT_API_KEY configuration is missing', async () => {
    const Service = await loadImagesService({ apiKey: undefined });
    const { HttpError } = await import('../src/middleware/error-handler');
    const instantiate = () => new Service();

    expect(instantiate).toThrow(HttpError);
    expect(instantiate).toThrow('CAT_API_KEY environment variable is required');
  });
});
