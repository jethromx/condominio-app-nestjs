import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { BadRequestException } from '@nestjs/common';

export const globalValidationPipe = new ValidationPipe({
  whitelist: true, // Solo permite propiedades definidas en el DTO
  forbidNonWhitelisted: true, // Lanza error si hay propiedades no permitidas
  transform: true, // Transforma automáticamente los tipos
  transformOptions: {
    enableImplicitConversion: true, // Convierte tipos implícitamente
  },
  validationError: {
    target: false, // No incluye el objeto target en el error
    value: false, // No incluye el valor en el error
  },
  exceptionFactory: (validationErrors: ValidationError[] = []) => {
    const errors = validationErrors.map(error => ({
      field: error.property,
      errors: Object.values(error.constraints || {}),
      value: error.value,
    }));
    
    return new BadRequestException({
      message: 'Validation failed',
      details: errors,
    });
  },
});
