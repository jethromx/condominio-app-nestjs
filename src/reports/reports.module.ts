import { forwardRef, Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ApartmentModule } from 'src/apartment/apartment.module';
import { CondominiumModule } from 'src/condominium/condominium.module';
import { MaintenanceFeesModule } from 'src/maintenance_fees/maintenance_fees.module';
import { Payment, PaymentSchema } from 'src/payments/entities/payment.entity';
import { MaintenanceFee, MaintenanceFeeSchema } from 'src/maintenance_fees/entities/maintenance_fee.entity';
import { PaymentsModule } from 'src/payments/payments.module';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [
    forwardRef(() => CondominiumModule),
    forwardRef(() => MaintenanceFeesModule),
    forwardRef(() => PaymentsModule),
    ApartmentModule,
    MongooseModule.forFeature([
      {
        name: Payment.name,
        schema: PaymentSchema
      },
      {
        name: MaintenanceFee.name,
        schema: MaintenanceFeeSchema
      }
    ]),
    CondominiumModule,
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
  ],
})
export class ReportsModule { }
