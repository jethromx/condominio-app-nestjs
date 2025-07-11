import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';

import { ApartmentService } from './apartment.service';
import { ApartmentController } from './apartment.controller';
import { Apartment, ApartmentSchema } from './entities/apartment.entity';

// Módulos relacionados
import { CondominiumModule } from 'src/condominium/condominium.module';
import { UsersModule } from 'src/users/users.module';

// Pipes, interceptors y filtros personalizados
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { ResponseTransformInterceptor } from 'src/common/interceptors/response-transform.interceptor';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';

/**
 * Módulo de Apartamentos
 * 
 * Gestiona todo lo relacionado con apartamentos dentro de condominios:
 * - CRUD de apartamentos
 * - Validación de datos
 * - Relaciones con condominios y usuarios
 * - Interceptores y filtros personalizados
 */
@Module({
  controllers: [ApartmentController],
  providers: [
    ApartmentService,
    // Pipes personalizados
    ParseObjectIdPipe,
    // Interceptores
    ResponseTransformInterceptor,
    // Filtros de excepciones
    AllExceptionsFilter,
  ],
  imports: [
    // Configuración de Mongoose para la entidad Apartment
    MongooseModule.forFeature([
      { name: Apartment.name, schema: ApartmentSchema },
    ]),
    
    // Módulos relacionados con referencia circular
    forwardRef(() => CondominiumModule),
    
    // Módulo de usuarios para validación de propietarios
    UsersModule,
    
    // Autenticación JWT
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
  ],
  exports: [
    ApartmentService,
    ParseObjectIdPipe, // Exportar para uso en otros módulos
  ],
})
export class ApartmentModule {}
