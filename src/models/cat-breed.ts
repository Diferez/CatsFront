export interface CatWeight {
  imperial: string;
  metric: string;
}

export interface CatBreed {
  id: string;
  name: string;
  temperament?: string;
  origin?: string;
  description?: string;
  life_span?: string;
  weight?: CatWeight;
  adaptability?: number;
  affection_level?: number;
  intelligence?: number;
  reference_image_id?: string;
}
