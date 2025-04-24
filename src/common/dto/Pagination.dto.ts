import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDTO{

    @IsOptional()
    @IsPositive()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    limit?: number = 10;

    @IsOptional()
    @IsNumber()
    @IsPositive()   
    @Type(() => Number) 
    page?:number = 1;

}