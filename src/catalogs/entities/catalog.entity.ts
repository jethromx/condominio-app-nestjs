import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AuditEntity } from "src/common/entities/Audit.entity";
import { hideFields } from "src/common/helpers/hideFields.helper";

@Schema({ timestamps: true, toJSON:{ transform: hideFields }  } )
export class Catalog extends AuditEntity {
    

    @Prop({
        unique: true,
        index: true
    }) 
    name: string;

    @Prop({   
    })
    description: string;

    @Prop({
        type: [String],
        default: [],
    })
    items: string[]; // Array de ObjectIds que representan los ítems asociados
  
}


export const CatalogSchema = SchemaFactory.createForClass(Catalog);

