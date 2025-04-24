import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MonthlyStatement extends Document {
  @Prop({ type: String, required: true })
  condominiumId: string;

  @Prop({ type: String, required: true })
  apartmentId: string;

  @Prop({ type: String, required: true })
  residentName: string;

  @Prop({ type: Number, required: true })
  openingBalance: number; // Saldo al inicio del mes

  @Prop({ type: Number, required: true })
  totalCharges: number; // Total de cuotas y penalizaciones del mes

  @Prop({ type: Number, required: true })
  totalPayments: number; // Total de pagos realizados durante el mes

  @Prop({ type: Number, required: true })
  closingBalance: number; // Saldo al final del mes

  @Prop({ type: Date, required: true })
  month: Date; // Mes del estado de cuenta

  @Prop({ type: Array, default: [] })
  payments: Array<{
    paymentDate: Date;
    amount: number;
    paymentMethod: string;
  }>; // Detalle de los pagos realizados

  @Prop({ type: Array, default: [] })
  charges: Array<{
    description: string;
    amount: number;
    dueDate: Date;
    status: string; // PAID, PENDING, OVERDUE
  }>; // Detalle de las cuotas y penalizaciones
}

export const MonthlyStatementSchema = SchemaFactory.createForClass(MonthlyStatement);