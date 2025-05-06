
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { AuditEntity } from "src/common/entities/Audit.entity";
import { hideFields } from "src/common/helpers/hideFields.helper";

@Schema({ timestamps: true, toJSON:{ transform: hideFields }  } )
export class Payment extends AuditEntity {
    
    
    @Prop({ type: String, unique: true, sparse: true }) // Debe ser único   
    idempotencyKey: string; // Clave de idempotencia para evitar duplicados

    @Prop({ type: mongoose.Schema.Types.ObjectId, 
        ref: 'Apartment', 
        required: true 
    })
    apartmentId: mongoose.Types.ObjectId; // ID del departamento al que pertenece el pago


    @Prop({ type: mongoose.Schema.Types.ObjectId, 
        ref: 'MaintenanceFee', 
        required: false
     })
    maintenanceFeeId?: mongoose.Types.ObjectId; // ID de la cuota de mantenimiento a la que pertenece el pago

    @Prop({ type: mongoose.Schema.Types.ObjectId, 
        ref: 'CommonService', 
        required: false
     })
    commonServiceId?: mongoose.Types.ObjectId; // ID de la cuota de mantenimiento a la que pertenece el pago
    
  
    @Prop({
        type: Date,
        required: false,
        index: false
    })
    paymentDate: Date; // Fecha del pago

    @Prop({
        type: Number,
        required: true,
        index: false
    })
    amount: number; // Monto del pago

    @Prop({
        type: String,
        required: false,
        index: false
    })
    paymentMethod: string; // Método de pago (efectivo, transferencia, etc.)

    @Prop({
        type: String,
        required: false,
        index: false
    })
    transactionId: string; // ID de la transacción (si aplica)

    @Prop({
        type: String,
        required: false,
        default: 'CONFIRMED',
        enum: ['PENDING', 'CONFIRMED', 'CANCELED', 'REFUNDED'],
        index: false
    })
    paymentStatus: string; // Estado del pago (pendiente, confirmado, cancelado)

    @Prop({
        type: String,
        required: false,
        default: 'ACTIVE',
        enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'],
        index: false
    })
    status: string; // Estado del pago (pendiente, confirmado, cancelado)

    @Prop({
       
    })
    currency: string; // Moneda del pago    
    
    @Prop({
        type: String,
        required: false,
        index: false
    })
    paymentReference: string; // Referencia del pago (número de recibo, etc.)
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
