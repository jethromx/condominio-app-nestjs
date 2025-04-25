import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AuditEntity } from "src/common/entities/Audit.entity";
import { hideFields } from "src/common/helpers/hideFields.helper";


@Schema({ timestamps: true, toJSON:{ transform: hideFields }  } )
export class Event extends AuditEntity {
    @Prop({ type: String, required: true }) // Cambiar ObjectId a String
    _id: string; 
    @Prop({
        unique: true,
        index: true
    }) 
    name: string;
  
    @Prop({   
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
}
export const EventSchema = SchemaFactory.createForClass(Event);
