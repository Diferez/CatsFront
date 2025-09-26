import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { NextFunction, Request, Response } from 'express';

type Constructor<T> = new () => T;

type RequestPart = 'body' | 'params' | 'query';

const formatErrors = (errors: any[]): Array<Record<string, unknown>> =>
  errors.map((error) => ({
    property: error.property,
    constraints: error.constraints,
    children: error.children?.length ? formatErrors(error.children) : undefined
  }));

const validateRequestPart = <T>(type: Constructor<T>, part: RequestPart) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const data = req[part];
    const dto = plainToInstance(type, data, {
      enableImplicitConversion: true,
      exposeDefaultValues: true
    });

    const errors = await validate(dto as object, {
      whitelist: true,
      forbidNonWhitelisted: true
    });

    if (errors.length > 0) {
      res.status(400).json({
        message: 'Validation failed',
        errors: formatErrors(errors)
      });
      return;
    }

    (req as any)[part] = dto;
    next();
  };
};

export const validateQuery = <T>(type: Constructor<T>) => validateRequestPart(type, 'query');
export const validateParams = <T>(type: Constructor<T>) => validateRequestPart(type, 'params');
export const validateBody = <T>(type: Constructor<T>) => validateRequestPart(type, 'body');
