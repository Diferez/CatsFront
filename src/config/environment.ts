import dotenv from 'dotenv';

dotenv.config();

export interface CatApiConfig {
  readonly baseUrl: string;
  readonly apiKey?: string;
}

export interface AppConfig {
  readonly port: number;
  readonly catApi: CatApiConfig;
  readonly database: {
    readonly uri: string;
  };
}

const parseNumber = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const appConfig: AppConfig = {
  port: parseNumber(process.env.PORT, 3000),
  catApi: {
    baseUrl: process.env.CAT_API_BASE_URL ?? 'https://api.thecatapi.com/v1',
    apiKey: process.env.CAT_API_KEY
  },
  database: {
    uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/xpert'
  }
};
