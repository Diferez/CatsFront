import { CatBreed } from './cat-breed';

export interface CatSearchResult extends CatBreed {
  score?: number;
}
