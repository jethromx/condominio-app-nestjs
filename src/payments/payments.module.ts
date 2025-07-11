import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment, PaymentSchema } from './entities/payment.entity';

// Módulos relacionados
import { ApartmentModule } from 'src/apartment/apartment.module';
import { MaintenanceFeesModule } from 'src/maintenance_fees/maintenance_fees.module';

// Pipes, interceptors y filtros personalizados
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { ResponseTransformInterceptor } from 'src/common/interceptors/response-transform.interceptor';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';
import { PaymentValidationPipe } from './pipes/payment-validation.pipe';

/**
 * Módulo de Pagos
 * 
 * Gestiona todo lo relacionado con pagos de apartamentos:
 * - CRUD de pagos
 * - Validación de datos
 * - Relaciones con apartamentos y cuotas de mantenimiento
 * - Interceptores y filtros personalizados
 * - Estadísticas y reportes de pagos
 */
@Module({
  controllers: [PaymentsController],
  providers: [
    PaymentsService,
    // Pipes personalizados
    ParseObjectIdPipe,
    PaymentValidationPipe,
    // Interceptores
    ResponseTransformInterceptor,
    // Filtros de excepciones
    AllExceptionsFilter,
  ],
  imports: [
    // Configuración de Mongoose para la entidad Payment
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
    ]),
    
    // Módulos relacionados (sin referencia circular)
    ApartmentModule,
    
    // Módulo de cuotas de mantenimiento con referencia circular
    forwardRef(() => MaintenanceFeesModule),
    
    // Autenticación JWT
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
  ],
  exports: [
    PaymentsService,
    ParseObjectIdPipe, // Exportar para uso en otros módulos
    PaymentValidationPipe, // Exportar pipe de validación específico
  ],
})
export class PaymentsModule {}
