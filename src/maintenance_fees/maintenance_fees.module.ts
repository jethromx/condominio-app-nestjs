import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

// Services
import { MaintenanceFeesService } from './maintenance_fees.service';
import { CommonServiceService } from './common_service.service';

// Controllers
import { MaintenanceFeesController } from './maintenance_fees.controller';
import { CommonServiceController } from './common_service.controller';

// Entities
import { MaintenanceFee, MaintenanceFeeSchema } from './entities/maintenance_fee.entity';
import { CommonService, CommonServiceSchema } from './entities/common_service.entity';

// Modules
import { CondominiumModule } from 'src/condominium/condominium.module';

// Common utilities
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';
import { ResponseTransformInterceptor } from 'src/common/interceptors/response-transform.interceptor';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';

/**
 * Módulo para gestión de cuotas de mantenimiento y servicios comunes
 * Incluye todos los servicios, controladores y utilidades necesarias
 */
@Module({
  controllers: [
    MaintenanceFeesController,
    CommonServiceController
  ],
  providers: [
    MaintenanceFeesService,
    CommonServiceService,
    ParseObjectIdPipe,
    ResponseTransformInterceptor,
    AllExceptionsFilter
  ],
  imports: [
    forwardRef(() => CondominiumModule),
    MongooseModule.forFeature([
      {
        name: MaintenanceFee.name,
        schema: MaintenanceFeeSchema
      },
      {
        name: CommonService.name,
        schema: CommonServiceSchema
      }
    ]),
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
  ],
  exports: [
    MaintenanceFeesService,
    CommonServiceService,
    ParseObjectIdPipe
  ], // Exportar servicios y utilidades si se necesitan en otros módulos
})
export class MaintenanceFeesModule {}
