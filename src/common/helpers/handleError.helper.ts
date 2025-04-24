import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { CANT_CREATE_ENTITY } from "../messages.const";

export const handleExceptions = (error: any)=>{
  
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map((err: any) => err.message);
    throw new BadRequestException(`Validation failed: ${messages.join(', ')}`);
  }
  if (error.name === 'CastError') {
    throw new BadRequestException(`Invalid ${error.path}: ${error.value}`);
  }

  if (error.code === 11000) {
    throw new BadRequestException(`Duplicate key error: ${JSON.stringify(error.keyValue)}`);
  }

  if (error.name === 'MongoNetworkError') {
    throw new InternalServerErrorException('Database connection error. Please try again later.');
  }
 
     if(error.code === 'E11000') {
      throw new BadRequestException( `record exists in ${JSON.stringify(error.keyValue)}`)
     }

     if (error.message?.includes('ConfigService.getOrThrow')) {
      throw new InternalServerErrorException('A required configuration is missing');
    }
    
    if(error.status == 500)
        throw new InternalServerErrorException(CANT_CREATE_ENTITY());

    throw error;
  }