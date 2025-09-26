export interface CatImage {
  id: string;
  url: string;
  width?: number;
  height?: number;
  breeds?: Array<{
    id: string;
    name: string;
  }>;
}
