import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AuditEntity } from "src/common/entities/Audit.entity";
import { hideFields } from "src/common/helpers/hideFields.helper";
import { CommonServiceStatus } from "./common_service-status.enum";
import { CommonServiceFrecuencyStatus } from "./common_service-frecuency.enum";
import mongoose from "mongoose";

@Schema({ timestamps: true, toJSON: { transform: hideFields } })
export class CommonService extends AuditEntity {


    @Prop({
        type: String,
        required: true,
        index: false,
    })
    name: string; // Ej Cuota de Mantenimiento Abril 2205

    @Prop({
        type: mongoose.Schema.Types.ObjectId, // Cambiar a ObjectId
        ref: 'Condominium', // Referencia al modelo Condominium
        required: true,
        index: true,
    })
    condominiumId: mongoose.Types.ObjectId; // Monto de la cuota de mantenimiento

    @Prop({
        type: String,
        required: true,
        index: false
    })
    provider: string; // Monto de la cuota de mantenimiento

    @Prop({
        required: false,
        default: CommonServiceFrecuencyStatus.MONTHLY,
        enum: CommonServiceFrecuencyStatus,
        index: false
    })
    frequency: string; // Monto de la penalización por atraso


    @Prop({
        required: false,
        default: CommonServiceStatus.ACTIVE,
        enum: Object.values(CommonServiceStatus),
        index: false
    })
    status: string; // Estado de la cuota de mantenimiento (activa, inactiva)


    @Prop({
        type: Number,
        required: true,
        index: false
    })
    price: number; // Monto de la cuota de mantenimiento

}

export const CommonServiceSchema = SchemaFactory.createForClass(CommonService);