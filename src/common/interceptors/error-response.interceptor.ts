import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ErrorResponseInterceptor implements NestInterceptor {
  private readonly logger = new Logger(ErrorResponseInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((error) => {
        const request = context.switchToHttp().getRequest();
        const response = context.switchToHttp().getResponse();

        // Log the error for debugging
        this.logger.error(
          `Error in ${request.method} ${request.url}:`,
          error.stack
        );

        // If it's already an HTTP exception, just pass it through
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        // Handle MongoDB duplicate key errors
        if (error.code === 11000) {
          const field = Object.keys(error.keyValue)[0];
          const value = error.keyValue[field];
          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: HttpStatus.CONFLICT,
                  message: `${field} '${value}' already exists`,
                  error: 'Conflict',
                },
                HttpStatus.CONFLICT
              )
          );
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
          const messages = Object.values(error.errors).map(
            (err: any) => err.message
          );
          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: messages,
                  error: 'Validation Error',
                },
                HttpStatus.BAD_REQUEST
              )
          );
        }

        // Handle cast errors (invalid ObjectId)
        if (error.name === 'CastError') {
          return throwError(
            () =>
              new HttpException(
                {
                  statusCode: HttpStatus.BAD_REQUEST,
                  message: `Invalid ${error.path}: ${error.value}`,
                  error: 'Bad Request',
                },
                HttpStatus.BAD_REQUEST
              )
          );
        }

        // Default internal server error
        return throwError(
          () =>
            new HttpException(
              {
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Internal server error',
                error: 'Internal Server Error',
              },
              HttpStatus.INTERNAL_SERVER_ERROR
            )
        );
      })
    );
  }
}
