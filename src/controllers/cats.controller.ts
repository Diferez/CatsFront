import { NextFunction, Request, Response, Router } from 'express';
import { BreedIdParamDto } from '../dto/breed-id-param.dto';
import { CatSearchQueryDto } from '../dto/cat-search-query.dto';
import { validateParams, validateQuery } from '../middleware/validation.middleware';
import { CatsService } from '../services/cats.service';

export class CatsController {
  constructor(private readonly catsService: CatsService) {}

  register(router: Router): void {
    router.get('/breeds', this.getBreeds);
    router.get('/breeds/:breed_id', validateParams(BreedIdParamDto), this.getBreedById);
    router.get('/breeds/search', validateQuery(CatSearchQueryDto), this.searchBreeds);
  }

  private getBreeds = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const breeds = await this.catsService.getBreeds();
      res.json(breeds);
    } catch (error) {
      next(error);
    }
  };

  private getBreedById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { breed_id } = req.params as Record<string, string>;
      const breed = await this.catsService.getBreedById(breed_id);
      res.json(breed);
    } catch (error) {
      next(error);
    }
  };

  private searchBreeds = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q } = req.query as Record<string, string>;
      const results = await this.catsService.searchBreeds(q);
      res.json(results);
    } catch (error) {
      next(error);
    }
  };
}
