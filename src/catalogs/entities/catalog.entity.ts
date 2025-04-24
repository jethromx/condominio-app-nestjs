import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { AuditEntity } from "src/common/entities/Audit.entity";
import { hideFields } from "src/common/helpers/hideFields.helper";

@Schema({ timestamps: true, toJSON:{ transform: hideFields }  } )
export class Catalog extends AuditEntity {
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
        type: [String],
        default: [],
    })
    items: string[]; // Array de ObjectIds que representan los ítems asociados



  
}


export const CatalogSchema = SchemaFactory.createForClass(Catalog);

CatalogSchema.pre('save', function (next) {
    console.log('Pre-save hook triggered');
    const userId = this.get('userId'); // Asegúrate de pasar el ID del usuario desde el contexto
    if (!this.createdBy) {
        console.log(userId);
      this.createdBy = userId; // Establecer `createdBy` al crear
    }
    this.updatedBy = userId; // Actualizar `updatedBy` en cada guardado
    next();
  });
