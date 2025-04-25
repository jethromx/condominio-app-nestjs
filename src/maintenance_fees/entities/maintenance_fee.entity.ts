import { Prop,Schema, SchemaFactory } from "@nestjs/mongoose";
import { AuditEntity } from "src/common/entities/Audit.entity";
import { hideFields } from "src/common/helpers/hideFields.helper";

@Schema({ timestamps: true, toJSON: { transform: hideFields } })
export class MaintenanceFee extends AuditEntity {
    
    @Prop({ type: String, required: true }) // Cambiar ObjectId a String
    _id: string; 

    @Prop({
        type: String,
        required: true,
        index: false,        
    }) 
    detail:string; // Ej Cuota de Mantenimiento Abril 2205

    @Prop({
        type: Number,
        required: true,
        index: false
    })
    amount: number; // Monto de la cuota de mantenimiento

    @Prop({
        type: Number,
        required: false,
        index: false
    })
    penaltyAmount: number; // Monto de la penalización por atraso

    @Prop({
        type: String,
        required: false,
        index: false
    })
    startDate: Date; // Fecha de inicio de la cuota de mantenimiento

    @Prop({
        type: String,
        required: false,
        index: false
    })
    paymentDeadline: Date; // Fecha de vencimiento de la cuota de mantenimiento

    @Prop({
        type: String,
        required: false,
        default: 'ACTIVE',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'],
        index: false
    })
    status: string; // Estado de la cuota de mantenimiento (activa, inactiva)

    @Prop({
        type: String,
        required: false,
        default: 'ACTIVE',
        enum: ['MANTENIMIENTO', 'EXTRAORDINARIA'],
        index: false
    })
    feedType: string; // Tipo de cuota de mantenimiento (fija, variable, extraordinaria)

    @Prop({
        type: String,
        required: true,
        index: false
    })
    condominiumId: string; // ID del condominio al que pertenece la cuota de mantenimiento

    @Prop({
        type: String,
        required: false,
        index: false
    })
    currency: string; // Moneda de la cuota de mantenimiento (USD, CRC, etc.)

    @Prop({
        type: String,
        required: false,
        default: 'MONTHLY',
        enum: ['MONTHLY', 'QUARTERLY', 'ANNUALLY','WEEKLY'],
        index: false
    })
    frecuency: string; // Frecuencia de la cuota de mantenimiento (mensual, trimestral, etc.)
    

    
}
export const MaintenanceFeeSchema = SchemaFactory.createForClass(MaintenanceFee);
