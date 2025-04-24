import { PartialType } from "@nestjs/mapped-types";
import { CreateCommonServiceDto } from "./create-common_service.dto";


export class UpdateCommonServiceDto extends PartialType(CreateCommonServiceDto) {
  
}


