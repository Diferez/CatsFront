import nock from 'nock';
import type { CatApiConfig } from '../src/config/environment';

describe('CatsService', () => {
  const baseUrl = 'https://api.test-cat.com';

  const loadCatsService = async (overrides?: Partial<CatApiConfig>) => {
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

    const module = await import('../src/services/cats.service');
    return module.CatsService;
  };

  const createService = async (overrides?: Partial<CatApiConfig>) => {
    const Service = await loadCatsService(overrides);
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

  it('fetches and maps cat breeds from the API', async () => {
    const service = await createService();
    const apiResponse = [
      {
        id: 'abys',
        name: 'Abyssinian',
        temperament: 'Active, Energetic',
        origin: 'Egypt',
        description: 'Friendly cat',
        life_span: '14-15',
        weight: { imperial: '7 - 10', metric: '3 - 4' },
        adaptability: 5,
        affection_level: 5,
        intelligence: 5,
        reference_image_id: '123',
        extra_field: 'ignored'
      }
    ];

    const scope = nock(baseUrl)
      .get('/breeds')
      .reply(200, apiResponse);

    const result = await service.getBreeds();

    expect(scope.isDone()).toBe(true);
    expect(result).toEqual([
      {
        id: 'abys',
        name: 'Abyssinian',
        temperament: 'Active, Energetic',
        origin: 'Egypt',
        description: 'Friendly cat',
        life_span: '14-15',
        weight: { imperial: '7 - 10', metric: '3 - 4' },
        adaptability: 5,
        affection_level: 5,
        intelligence: 5,
        reference_image_id: '123'
      }
    ]);
  });

  it('fetches a single breed by id and maps the response', async () => {
    const service = await createService();
    const apiResponse = {
      id: 'sava',
      name: 'Savannah',
      description: 'Dog-like cat',
      adaptability: 4
    };

    const scope = nock(baseUrl)
      .get('/breeds/sava')
      .reply(200, apiResponse);

    const result = await service.getBreedById('sava');

    expect(scope.isDone()).toBe(true);
    expect(result).toEqual({
      id: 'sava',
      name: 'Savannah',
      description: 'Dog-like cat',
      adaptability: 4
    });
  });

  it('throws an HttpError when a breed is not found', async () => {
    const service = await createService();

    const scope = nock(baseUrl)
      .get('/breeds/unknown')
      .reply(404, { message: 'Not Found' });

    await expect(service.getBreedById('unknown')).rejects.toMatchObject({
      status: 404,
      message: 'Breed with id unknown not found'
    });

    expect(scope.isDone()).toBe(true);
  });

  it('searches for breeds and maps the score field', async () => {
    const service = await createService();
    const apiResponse = [
      {
        id: 'norw',
        name: 'Norwegian Forest Cat',
        score: 0.87,
        temperament: 'Sweet'
      }
    ];

    const scope = nock(baseUrl)
      .get('/breeds/search')
      .query({ q: 'norwegian' })
      .reply(200, apiResponse);

    const result = await service.searchBreeds('norwegian');

    expect(scope.isDone()).toBe(true);
    expect(result).toEqual([
      {
        id: 'norw',
        name: 'Norwegian Forest Cat',
        score: 0.87,
        temperament: 'Sweet'
      }
    ]);
  });

  it('throws when the CAT_API_KEY configuration is missing', async () => {
    const Service = await loadCatsService({ apiKey: undefined });
    const { HttpError } = await import('../src/middleware/error-handler');
    const instantiate = () => new Service();

    expect(instantiate).toThrow(HttpError);
    expect(instantiate).toThrow('CAT_API_KEY environment variable is required');
  });
});
