import { Module } from '@nestjs/common';
import { MonthlyStatementService } from './monthly-statement.service';
import { MonthlyStatementsController } from './monthly-statement.controller';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { MonthlyStatement, MonthlyStatementSchema } from './entities/monthly_statement';
import { CondominiumModule } from 'src/condominium/condominium.module';
import { PassportModule } from '@nestjs/passport';
import { MaintenanceFeesModule } from 'src/maintenance_fees/maintenance_fees.module';
import { PaymentsModule } from 'src/payments/payments.module';
import { Payment, PaymentSchema } from 'src/payments/entities/payment.entity';

@Module({
  controllers: [MonthlyStatementsController],
  providers: [MonthlyStatementService],
  imports: [
    CondominiumModule,
   // MaintenanceFeesModule,
    PaymentsModule,
    // Aquí puedes importar otros módulos necesarios, como MongooseModule para la conexión a la base de datos
     MongooseModule.forFeature([
     // {name: 'MaintenanceFeeModel', schema: MaintenanceFeeSchema},
     {name: Payment.name,
             schema: PaymentSchema },
      { name: MonthlyStatement.name, schema: MonthlyStatementSchema }
    ]),
     PassportModule.register({
                        defaultStrategy: 'jwt'
                      }),
  ],
})
export class MonthlyStatementModule {}
