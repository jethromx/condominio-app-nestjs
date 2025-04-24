import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AuditEntity } from "src/common/entities/Audit.entity";
import { hideFields } from "src/common/helpers/hideFields.helper";
import { ApartmentStatus } from "./apartment-status.enum";

@Schema({ timestamps: true, toJSON: { transform: hideFields } })
export class Apartment extends AuditEntity {

    @Prop({ type: String, required: true }) // Cambiar ObjectId a String
    _id: string;

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

    @Prop({
        type: String,
        required: true,
        index: false
    })
    condominiumId: string;

    @Prop({
        type: String,
        required: false,
        index: false
    })
    ownerId: string;

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
