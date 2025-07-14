import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ZodSchema, ZodError } from 'zod';

@Injectable()
export class ValidationInterceptor implements NestInterceptor {
  constructor(private readonly schema: ZodSchema<any>) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        try {
          return this.schema.parse(data);
        } catch (error) {
          if (error instanceof ZodError) {
            throw new BadRequestException({
              message: 'Response validation failed',
              issues: error.issues,
            });
          }
          throw error;
        }
      }),
    );
  }
}