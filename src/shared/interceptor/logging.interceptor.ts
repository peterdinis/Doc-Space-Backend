import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const { method, originalUrl } = req;
    const now = Date.now();

    console.log(`[Request] ${method} ${originalUrl} - Incoming`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - now;
        console.log(`[Response] ${method} ${originalUrl} - ${duration}ms`);
      }),
    );
  }
}