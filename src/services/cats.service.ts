import axios, { AxiosInstance } from 'axios';
import { appConfig } from '../config/environment';
import { HttpError } from '../middleware/error-handler';
import { CatBreed } from '../models/cat-breed';
import { CatSearchResult } from '../models/cat-search';

export class CatsService {
  private readonly http: AxiosInstance;

  constructor() {
    if (!appConfig.catApi.apiKey) {
      throw new HttpError(500, 'CAT_API_KEY environment variable is required');
    }

    this.http = axios.create({
      baseURL: appConfig.catApi.baseUrl,
      headers: {
        'x-api-key': appConfig.catApi.apiKey
      }
    });
  }

  async getBreeds(): Promise<CatBreed[]> {
    const response = await this.http.get<CatBreed[]>('/breeds');
    return response.data.map((breed) => this.mapBreed(breed));
  }

  async getBreedById(breedId: string): Promise<CatBreed> {
    try {
      const response = await this.http.get<CatBreed>(`/breeds/${breedId}`);
      return this.mapBreed(response.data);
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new HttpError(404, `Breed with id ${breedId} not found`);
      }
      throw error;
    }
  }

  async searchBreeds(query: string): Promise<CatSearchResult[]> {
    const response = await this.http.get<CatSearchResult[]>('/breeds/search', {
      params: { q: query }
    });

    return response.data.map((breed) => this.mapSearchResult(breed));
  }

  private mapBreed(breed: CatBreed | CatSearchResult): CatBreed {
    return {
      id: breed.id,
      name: breed.name,
      temperament: breed.temperament,
      origin: breed.origin,
      description: breed.description,
      life_span: breed.life_span,
      weight: breed.weight,
      adaptability: breed.adaptability,
      affection_level: breed.affection_level,
      intelligence: breed.intelligence,
      reference_image_id: breed.reference_image_id
    };
  }

  private mapSearchResult(breed: CatSearchResult): CatSearchResult {
    return {
      ...this.mapBreed(breed),
      score: breed.score
    };
  }
}
