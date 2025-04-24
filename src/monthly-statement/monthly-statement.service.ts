import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MaintenanceFee } from 'src/maintenance_fees/entities/maintenance_fee.entity';
import { Payment } from 'src/payments/entities/payment.entity';
import { MonthlyStatement } from './entities/monthly_statement';

@Injectable()
export class MonthlyStatementService {
    constructor(
        @InjectModel('MonthlyStatement') private readonly monthlyStatementModel: Model<MonthlyStatement>,
       // @InjectModel('MaintenanceFee') private readonly maintenanceFeeModel: Model<MaintenanceFee>,
       @InjectModel(Payment.name)
       private readonly paymentModel: Model<Payment>,
    ) {}


    async generateMonthlyStatement(condominiumId: string, apartmentId: string, month: Date) {
        // Obtener las cuotas de mantenimiento del mes
       /* const charges = await this.maintenanceFeeModel.find({
          condominiumId,
          apartmentId,
          startDate: { $gte: month, $lt: new Date(month.getFullYear(), month.getMonth() + 1, 1) },
        }); */
      
        // Obtener los pagos realizados durante el mes
        const payments = await this.paymentModel.find({
          condominiumId,
          apartmentId,
          paymentDate: { $gte: month, $lt: new Date(month.getFullYear(), month.getMonth() + 1, 1) },
        });
      
        // Calcular los totales
      //  const totalCharges = charges.reduce((sum, charge) => sum + charge.amount, 0);
        const totalPayments = payments.reduce((sum, payment) => sum + payment.amount, 0);
      
        // Obtener el saldo inicial del mes
        const previousStatement = await this.monthlyStatementModel.findOne({
          condominiumId,
          apartmentId,
          month: new Date(month.getFullYear(), month.getMonth() - 1, 1),
        });
        const openingBalance = previousStatement ? previousStatement.closingBalance : 0;
      
        // Calcular el saldo final
       // const closingBalance = openingBalance + totalCharges - totalPayments;
      
        // Crear el estado de cuenta
        const statement = new this.monthlyStatementModel({
          condominiumId,
          apartmentId,
          residentName: 'Nombre del residente', // Puedes obtenerlo desde el modelo de usuarios
          openingBalance,
         // totalCharges,
          totalPayments,
          //closingBalance,
          month,
          payments: payments.map(payment => ({
            paymentDate: payment.paymentDate,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
          })),
         /* charges: charges.map(charge => ({
            description: charge.detail,
            amount: charge.amount,
            dueDate: charge.paymentDeadline,
            //status: charge.isPaid ? 'PAID' : 'PENDING',
          })),*/
        });
      
        return statement.save();
      }
}
