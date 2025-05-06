import { forwardRef, Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Payment, PaymentSchema } from './entities/payment.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { CondominiumModule } from 'src/condominium/condominium.module';
import { PassportModule } from '@nestjs/passport';
import { ApartmentModule } from 'src/apartment/apartment.module';
import { MaintenanceFeesModule } from 'src/maintenance_fees/maintenance_fees.module';
import { Apartment, ApartmentSchema } from 'src/apartment/entities/apartment.entity';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [
    forwardRef(() => CondominiumModule),
    forwardRef(() => MaintenanceFeesModule),
    ApartmentModule,
    MongooseModule.forFeature([
      { name: Payment.name, schema: PaymentSchema },
      { name: Apartment.name, schema: ApartmentSchema }
    ]),
    CondominiumModule,
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
  ],
  exports: [PaymentsService], // Exportar el servicio si se necesita en otros módulos
})
export class PaymentsModule { }
