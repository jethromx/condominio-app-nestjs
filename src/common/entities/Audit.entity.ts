import { Prop } from '@nestjs/mongoose';
import mongoose from 'mongoose';


export class AuditEntity {
  

  // Usuario que creó la entidad
  @Prop({ type: mongoose.Schema.Types.ObjectId, 
              ref: 'Users', 
              required: true
          })
  createdBy:  mongoose.Types.ObjectId;

   // Usuario que actualizó la entidad
  @Prop({ type: mongoose.Schema.Types.ObjectId, 
              ref: 'Users', 
              required: true
          })
  updatedBy:  mongoose.Types.ObjectId;
}