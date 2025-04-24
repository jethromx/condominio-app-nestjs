import { forwardRef, Module } from '@nestjs/common';
import { ApartmentService } from './apartment.service';
import { ApartmentController } from './apartment.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CondominiumModule } from 'src/condominium/condominium.module';
import { Apartment, ApartmentSchema } from './entities/apartment.entity';
import { PassportModule } from '@nestjs/passport';
import { User } from 'src/auth/entities/user.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [ApartmentController],
  providers: [ApartmentService],
  imports: [
    ApartmentModule,
    UsersModule,
    MongooseModule.forFeature([
      { name: Apartment.name, schema: ApartmentSchema },
    ]),
    forwardRef(() => CondominiumModule), // Importar el módulo Condominium si se necesita
    PassportModule.register({
                  defaultStrategy: 'jwt'
                }),
  ],
  exports: [ApartmentService], // Exportar el servicio si se necesita en otros módulos
  // Puedes agregar otros módulos aquí si es necesario
})
export class ApartmentModule {}
