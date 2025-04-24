import { Optional } from "@nestjs/common";
import { IsArray, IsOptional, IsString, MaxLength, MinLength } from "class-validator";


export class CreateCatalogDto {

    @IsString()
    @MinLength(1)
    @MaxLength(50)        
    name: string;

    @IsString()
    @MinLength(1)
    @MaxLength(50)
    description: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    items: string[]; // Array de ObjectIds que representan los ítems asociados
   
}
