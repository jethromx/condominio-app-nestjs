import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { hideFields } from "src/common/helpers/hideFields.helper";
import { Document } from 'mongoose';

@Schema({ timestamps: true, toJSON: { transform: hideFields } })
export class User extends Document {


  @Prop({
    unique: true,
    index: true
  })
  email: string

  @Prop({

    type: String,
  })
  phone: string;

  @Prop({
    select: false,
  })
  password: string;


  @Prop({

  })
  fullName: string

  @Prop({
    default: false
  })
  isActive: boolean;

  @Prop({
    default: false
  })
  isEmailVerified: boolean;

  @Prop({
    default: ['user'],
  })
  roles: string[]

  @Prop({ select: false })
  refreshToken: string;

  @Prop({ select: false })
  accessToken: string;


}

export const UsuarioSchema = SchemaFactory.createForClass(User);
