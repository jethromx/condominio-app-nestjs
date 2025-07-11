import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { PAYMENT_LIMITS, SUPPORTED_CURRENCIES, PAYMENT_METHODS } from '../constants/payments.constants';

/**
 * Pipe personalizado para validar datos de pagos
 */
@Injectable()
export class PaymentValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (metadata.type !== 'body') {
      return value;
    }

    this.validatePaymentData(value);
    return value;
  }

  private validatePaymentData(paymentData: any) {
    // Validar monto
    if (paymentData.amount !== undefined) {
      this.validateAmount(paymentData.amount);
    }

    // Validar moneda
    if (paymentData.currency !== undefined) {
      this.validateCurrency(paymentData.currency);
    }

    // Validar método de pago
    if (paymentData.paymentMethod !== undefined) {
      this.validatePaymentMethod(paymentData.paymentMethod);
    }

    // Validar fecha de pago
    if (paymentData.paymentDate !== undefined) {
      this.validatePaymentDate(paymentData.paymentDate);
    }

    // Validar clave de idempotencia
    if (paymentData.idempotencyKey !== undefined) {
      this.validateIdempotencyKey(paymentData.idempotencyKey);
    }
  }

  private validateAmount(amount: number) {
   /* if (typeof amount !== 'number' || amount <= 0) {
      throw new BadRequestException('Amount must be a positive number');
    }*/

    if (amount < PAYMENT_LIMITS.MIN_AMOUNT || amount > PAYMENT_LIMITS.MAX_AMOUNT) {
      throw new BadRequestException(
        `Amount must be between ${PAYMENT_LIMITS.MIN_AMOUNT} and ${PAYMENT_LIMITS.MAX_AMOUNT}`
      );
    }
  }

  private validateCurrency(currency: string) {
    const validCurrencies = Object.values(SUPPORTED_CURRENCIES) as string[];
    if (!validCurrencies.includes(currency)) {
      throw new BadRequestException(
        `Invalid currency. Supported currencies: ${validCurrencies.join(', ')}`
      );
    }
  }

  private validatePaymentMethod(paymentMethod: string) {
    const validMethods = Object.values(PAYMENT_METHODS) as string[];
    if (!validMethods.includes(paymentMethod)) {
      throw new BadRequestException(
        `Invalid payment method. Supported methods: ${validMethods.join(', ')}`
      );
    }
  }

  private validatePaymentDate(paymentDate: string) {
    const date = new Date(paymentDate);
    if (isNaN(date.getTime())) {
      throw new BadRequestException('Invalid payment date format');
    }

    // No permitir fechas futuras muy lejanas (más de 1 año)
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    
    if (date > oneYearFromNow) {
      throw new BadRequestException('Payment date cannot be more than 1 year in the future');
    }
  }

  private validateIdempotencyKey(idempotencyKey: string) {
    if (typeof idempotencyKey !== 'string' || idempotencyKey.length < 8) {
      throw new BadRequestException('Idempotency key must be at least 8 characters long');
    }

    if (idempotencyKey.length > 64) {
      throw new BadRequestException('Idempotency key cannot exceed 64 characters');
    }

    // Validar que solo contenga caracteres alfanuméricos y algunos símbolos permitidos
    const validPattern = /^[a-zA-Z0-9\-_]+$/;
    if (!validPattern.test(idempotencyKey)) {
      throw new BadRequestException('Idempotency key can only contain alphanumeric characters, hyphens, and underscores');
    }
  }
}
