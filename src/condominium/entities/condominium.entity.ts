import { Prop,Schema, SchemaFactory } from "@nestjs/mongoose";
import { AuditEntity } from "src/common/entities/Audit.entity";
import { hideFields } from "src/common/helpers/hideFields.helper";
import { CondominiumStatus } from "./condominium-status.enum";

@Schema({ timestamps: true, toJSON: { transform: hideFields } , collection:'condominiums' })
export class Condominium extends AuditEntity {
    
    @Prop({ type: String, required: true }) // Cambiar ObjectId a String
    _id: string; 

    @Prop({
        type: String,
        required: true,
        index: false,        
    }) 
    name: string;
 
    @Prop({ 
        type: String,
        required: true,
        index: false  
    })
    description: string;

    @Prop({
        type: String,
        required: true,
        index: false
    })
    street: string;

    @Prop({
        type: String,
        required: true,
        index: false
    })
    streetNumber?: string; // Número de la calle del condominio

    @Prop({
        type: String,
        required: true,
        index: false
    })
    neighborhood: string; // Colonia/barrio

    @Prop({
        type: String,
        required: true,
        index: false
    })
    city: string; // Ciudad

    @Prop({
        type: String,
        required: true,
        index: false
    })
    state: string; // Estado
    
    @Prop({
        type: [String],
        required: false,
        index: false
    })
    amenities: string[]; // Amenidades del condominio

    @Prop({
        type: String,
        required: true,
        index: false
    })
    country: string; // País

    @Prop({
        type: String,
        required: true,
        index: false
    })
    zipCode: string; // Código postal

    @Prop({
        type: String,
        required: false,
        index: false
    })
    latitude: string; // Latitud

    @Prop({
        type: String,
        required: false,
        index: false
    })
    longitude: string; // Longitud

    @Prop({
        type: String,
        required: false,
        index: false
    })

    @Prop({
        required: false,
        default: CondominiumStatus.ACTIVE,
        enum: Object.values(CondominiumStatus),
        index: false
    })
    status: string; // Estatus del condominio
    
    @Prop({
        type: String,
        required: false,
        index: false
    })
    adminId: string;

    @Prop({
        type: String,
        required: false,
        index: false
    })    
    phone: string;

    @Prop({
        type: String,
        required: false,
        index: false
    })
    email: string;
    
    @Prop({
        type: String,
        required: false,
        index: false
    })
    website: string;
    @Prop({
        type: String,
        required: false,
        index: false
    })
    logo: string;

    @Prop({
        type: String,
        required: false,
        index: false
    })
    image: string;

    @Prop({
        type: Number,
        required: false,
        index: false
    })
    totalFloors: number;

    @Prop({
        type: Number,
        required: false,
        index: false
    })
    totalApartments: number;

    @Prop({
        type: Number,
        required: false,
        index: false
    })
    totalParkingSpaces: number;

    @Prop({
        type: Number,   
        required: false,
        index: false
    })
    totalStorageSpaces: number;

    @Prop({
        type: Number,
        required: false,
        index: false
    })
    totalCommonAreas: number;


}

export const CondominiumSchema = SchemaFactory.createForClass(Condominium);
