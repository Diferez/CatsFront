import axios, { AxiosInstance } from 'axios';
import { appConfig } from '../config/environment';
import { HttpError } from '../middleware/error-handler';
import { CatImage } from '../models/cat-image';

export class ImagesService {
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

  async getImagesByBreedId(breedId: string, limit?: number): Promise<CatImage[]> {
    const response = await this.http.get<CatImage[]>('/images/search', {
      params: {
        breed_ids: breedId,
        limit: limit ?? 5
      }
    });

    return response.data.map((image) => ({
      id: image.id,
      url: image.url,
      width: image.width,
      height: image.height,
      breeds: image.breeds?.map((breed) => ({ id: breed.id, name: breed.name }))
    }));
  }
}
