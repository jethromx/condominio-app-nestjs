import { Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

export class AuditEntity {
  

  @Prop({ type: String, ref: 'User', required: true }) // Usuario que creó la entidad
  createdBy: string;

  @Prop({ type: String, ref: 'User' }) // Usuario que actualizó la entidad
  updatedBy: string;
}