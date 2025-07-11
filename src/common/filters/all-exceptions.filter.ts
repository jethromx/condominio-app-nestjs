import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

export interface ErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  error?: string;
  details?: any;
  timestamp: string;
  path: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Unknown error';
    let details: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (typeof errorResponse === 'object' && errorResponse !== null) {
        message = (errorResponse as any).message || message;
        error = (errorResponse as any).error || error;
        details = (errorResponse as any).details || null;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    // Log del error
    this.logger.error(
      `HTTP Status: ${status} Error Message: ${message}`,
      exception instanceof Error ? exception.stack : 'No stack trace',
    );

    const errorResponseObject: ErrorResponse = {
      success: false,
      statusCode: status,
      message,
      error,
      ...(details && { details }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponseObject);
  }
}
