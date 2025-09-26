import type { Request, Response, NextFunction } from 'express';
import { CatsController } from '../src/controllers/cats.controller';
import type { CatsService } from '../src/services/cats.service';

describe('CatsController', () => {
  const createResponse = () => {
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    } as Partial<Response>;
    return res as Response;
  };

  const createNext = () => jest.fn() as unknown as NextFunction;

  const createController = (overrides: Partial<CatsService>) => {
    const service = {
      getBreeds: jest.fn(),
      getBreedById: jest.fn(),
      searchBreeds: jest.fn(),
      ...overrides
    } as jest.Mocked<Pick<CatsService, 'getBreeds' | 'getBreedById' | 'searchBreeds'>>;

    return {
      controller: new CatsController(service as unknown as CatsService),
      service
    };
  };

  type HandlerKey = 'getBreeds' | 'getBreedById' | 'searchBreeds';
  const getHandler = (controller: CatsController, key: HandlerKey) => {
    const handlers = controller as unknown as Record<HandlerKey, (req: Request, res: Response, next: NextFunction) => Promise<void>>;
    return handlers[key];
  };

  it('returns all breeds on success', async () => {
    const breeds = [{ id: 'abys', name: 'Abyssinian' }];
    const { controller, service } = createController({
      getBreeds: jest.fn().mockResolvedValue(breeds)
    });
    const res = createResponse();
    const next = createNext();

    await getHandler(controller, 'getBreeds')({} as Request, res, next);

    expect(service.getBreeds).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith(breeds);
    expect(next).not.toHaveBeenCalled();
  });

  it('delegates breed lookup to the service', async () => {
    const breed = { id: 'sava', name: 'Savannah' };
    const { controller, service } = createController({
      getBreedById: jest.fn().mockResolvedValue(breed)
    });
    const res = createResponse();
    const next = createNext();

    await getHandler(controller, 'getBreedById')(
      { params: { breed_id: 'sava' } } as unknown as Request,
      res,
      next
    );

    expect(service.getBreedById).toHaveBeenCalledWith('sava');
    expect(res.json).toHaveBeenCalledWith(breed);
    expect(next).not.toHaveBeenCalled();
  });

  it('delegates breed search to the service', async () => {
    const results = [{ id: 'norw', name: 'Norwegian' }];
    const { controller, service } = createController({
      searchBreeds: jest.fn().mockResolvedValue(results)
    });
    const res = createResponse();
    const next = createNext();

    await getHandler(controller, 'searchBreeds')(
      { query: { q: 'nor' } } as unknown as Request,
      res,
      next
    );

    expect(service.searchBreeds).toHaveBeenCalledWith('nor');
    expect(res.json).toHaveBeenCalledWith(results);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards errors from the service to the next handler', async () => {
    const error = new Error('API failure');
    const { controller, service } = createController({
      getBreeds: jest.fn().mockRejectedValue(error)
    });
    const res = createResponse();
    const next = createNext();

    await getHandler(controller, 'getBreeds')({} as Request, res, next);

    expect(service.getBreeds).toHaveBeenCalledTimes(1);
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(error);
  });
});
