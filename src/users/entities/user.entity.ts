import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { hideFields } from "src/common/helpers/hideFields.helper";
import { Document } from 'mongoose';


Schema({ timestamps: true, toJSON: { transform: hideFields }, collection: 'users' })
export class UserC extends Document{

    
    @Prop({
        unique: true,
        index: true
    })
    email:string

    @Prop({
      
      select :false,      
    })
    password:string;

    
    @Prop({
      
    })
    fullName:string
    
    @Prop({
      default:true      
    })
    isActive:boolean;

    @Prop({
      
      type: String,
    })
    phone:string;

    @Prop({
      default:['user'],      
    })
    roles:string[]



}

export const UserCSchema = SchemaFactory.createForClass(UserC);