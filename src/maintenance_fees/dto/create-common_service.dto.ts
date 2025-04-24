import { IsString, IsEnum, IsNumber } from "class-validator";
import { CommonServiceStatus } from "../entities/common_service-status.enum";
import { CommonServiceFrecuencyStatus } from "../entities/common_service-frecuency.enum";

export class CreateCommonServiceDto {
    @IsString()
    name: string;
    
    @IsString()
    provider: string;
    
    @IsString()
    @IsEnum(CommonServiceFrecuencyStatus,{
        message: `Frecuency must be one of the following: ${Object.values(CommonServiceFrecuencyStatus).join(', ')}`,
    })
    frecuency: string;
    
    @IsString()
    @IsEnum(CommonServiceStatus, {
        message: `Status must be one of the following: ${Object.values(CommonServiceStatus).join(', ')}`,
    })
    status: string;

    @IsNumber()
    price: number
    
    }

    
    
    