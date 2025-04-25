import { forwardRef, Module } from '@nestjs/common';
import { CondominiumService } from './condominium.service';
import { CondominiumController } from './condominium.controller';
import { Condominium, CondominiumSchema } from './entities/condominium.entity';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { PassportModule } from '@nestjs/passport';
import { ApartmentModule } from 'src/apartment/apartment.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [CondominiumController],
  imports: [
    forwardRef(() => ApartmentModule),   
    UsersModule, 
     MongooseModule.forFeature([
       { name: Condominium.name, schema: CondominiumSchema }
     ]),
     PassportModule.register({ defaultStrategy: 'jwt' }),
    ],     
  providers: [CondominiumService],
  exports: [CondominiumService], // Exportar el servicio si se necesita en otros módulos
})
export class CondominiumModule {}
