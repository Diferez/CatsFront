import { NextFunction, Request, Response, Router } from 'express';
import { ImagesByBreedQueryDto } from '../dto/images-by-breed-query.dto';
import { validateQuery } from '../middleware/validation.middleware';
import { ImagesService } from '../services/images.service';

export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  register(router: Router): void {
    router.get('/imagesbybreedid', validateQuery(ImagesByBreedQueryDto), this.getImagesByBreedId);
  }

  private getImagesByBreedId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { breed_id, limit } = req.query as unknown as ImagesByBreedQueryDto;
      const images = await this.imagesService.getImagesByBreedId(breed_id, limit);
      res.json(images);
    } catch (error) {
      next(error);
    }
  };
}
