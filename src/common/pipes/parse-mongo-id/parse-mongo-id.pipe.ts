import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId } from 'mongoose';
import { MONGOID_NOT_VALID } from 'src/common/messages.const';

@Injectable()
export class ParseMongoIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {

    if(!isValidObjectId(value)) throw new BadRequestException(MONGOID_NOT_VALID(value))
    
    return value;
  }
}
