import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AuditEntity } from "src/common/entities/Audit.entity";
import { hideFields } from "src/common/helpers/hideFields.helper";
import { ApartmentStatus } from "./apartment-status.enum";
import mongoose from "mongoose";
import { User } from "src/auth/entities/user.entity";

@Schema({ timestamps: true, toJSON: { transform: hideFields } })
export class Apartment extends AuditEntity {
/*
    @Prop({ type: String, required: true }) // Cambiar ObjectId a String
    _id: string;

    
*/

    @Prop({
        type: String,        
        index: true
    })
    name: string;

    @Prop({
        type: String,
        required: false,
        index: false
    })
    description: string;
/*
    @Prop({
        type: String,
        required: true,
        index: false
    })
    condominiumId: string;*/

    @Prop({
        type: mongoose.Schema.Types.ObjectId, // Cambiar a ObjectId
        ref: 'Condominium', // Referencia al modelo Condominium
        required: true,
        index: true,
      })
      condominiumId: mongoose.Types.ObjectId; 

    

    @Prop({
        type: mongoose.Schema.Types.ObjectId, // Cambiar a ObjectId
        ref: 'Condominium', // Referencia al modelo Condominium
        required: false,
        index: false,
      })
    ownerId: User;

    @Prop({
        type: String,
        required: false,
        index: false
    })
    size: string;

    @Prop({
        type: String,
        required: false,
        index: false
    })
    floor: string;

    @Prop({
        type: String,
        required: false,
        index: false
    })
    numberOfRooms: string;

    @Prop({
        type: String,
        required: false,
        index: false
    })
    numberOfBathrooms: string;

    @Prop({
        type: String,
        required: false,
        index: false
    })
    numberOfParkingSpaces: string;

    @Prop({
        type: [String],
        required: false,
        index: false
    })
    amenities: string[];

    @Prop({
        type: String,
        required: false,
        default: ApartmentStatus.ACTIVE,
        enum: Object.values(ApartmentStatus),
        index: false
    })
    status: string;



}

export const ApartmentSchema = SchemaFactory.createForClass(Apartment);
