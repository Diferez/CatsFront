import 'reflect-metadata';
import type { Request, Response, NextFunction } from 'express';
import { ImagesController } from '../src/controllers/images.controller';
import type { ImagesService } from '../src/services/images.service';

describe('ImagesController', () => {
  const createResponse = () => {
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    } as Partial<Response>;
    return res as Response;
  };

  const createNext = () => jest.fn() as unknown as NextFunction;

  const createController = (overrides: Partial<ImagesService> = {}) => {
    const service = {
      getImagesByBreedId: jest.fn(),
      ...overrides
    } as jest.Mocked<Pick<ImagesService, 'getImagesByBreedId'>>;

    return {
      controller: new ImagesController(service as unknown as ImagesService),
      service
    };
  };

  it('returns images from the service', async () => {
    const images = [{ id: 'img-1', url: 'http://test/img-1.jpg' }];
    const { controller, service } = createController({
      getImagesByBreedId: jest.fn().mockResolvedValue(images)
    });
    const res = createResponse();
    const next = createNext();

    await (controller as any).getImagesByBreedId(
      { query: { breed_id: 'abys', limit: 3 } } as unknown as Request,
      res,
      next
    );

    expect(service.getImagesByBreedId).toHaveBeenCalledWith('abys', 3);
    expect(res.json).toHaveBeenCalledWith(images);
    expect(next).not.toHaveBeenCalled();
  });

  it('uses default limit when not provided', async () => {
    const { controller, service } = createController({
      getImagesByBreedId: jest.fn().mockResolvedValue([])
    });
    const res = createResponse();
    const next = createNext();

    await (controller as any).getImagesByBreedId(
      { query: { breed_id: 'sava' } } as unknown as Request,
      res,
      next
    );

    expect(service.getImagesByBreedId).toHaveBeenCalledWith('sava', undefined);
    expect(res.json).toHaveBeenCalledWith([]);
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards errors to next handler', async () => {
    const error = new Error('boom');
    const { controller, service } = createController({
      getImagesByBreedId: jest.fn().mockRejectedValue(error)
    });
    const res = createResponse();
    const next = createNext();

    await (controller as any).getImagesByBreedId(
      { query: { breed_id: 'abys' } } as unknown as Request,
      res,
      next
    );

    expect(service.getImagesByBreedId).toHaveBeenCalledWith('abys', undefined);
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(error);
  });
});
