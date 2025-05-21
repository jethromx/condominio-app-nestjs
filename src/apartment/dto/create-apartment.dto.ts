import { IsArray, IsEnum, IsMongoId, IsNumber, IsOptional, IsString, IsUUID } from "class-validator";
import { ApartmentStatus } from "../entities/apartment-status.enum";

export class CreateApartmentDto {
    @IsString()
    name: string; // Nombre del apartamento


    @IsString()
    @IsMongoId()
    ownerId: string; // ID del propietario del apartamento

    @IsString()
    @IsOptional()
    size?: string; // Tamaño del apartamento (opcional)

    @IsString()
    @IsOptional()
    @IsOptional()
    floor?: string; // Piso en el que se encuentra el apartamento (opcional)

    @IsString()
    @IsOptional()
    description?: string; // Descripción opcional del apartamento

    @IsNumber()
    @IsOptional()
    numberOfRooms?: number; // Número de habitaciones opcional

    @IsNumber()
    @IsOptional()
    numberOfBathrooms?: number; // Número de baños opcional

    @IsNumber()
    @IsOptional()
    numberOfParkingSpaces?: number; // Número de espacios de estacionamiento opcional

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    amenities: string[]; // Amenidades opcionales del apartamento

    @IsString()
    @IsEnum(ApartmentStatus, {
         message: `Status must be one of the following: ${Object.values(ApartmentStatus).join(', ')}`,
    })
    status?=ApartmentStatus.ACTIVE// Estado del condominio (activo, inactivo, etc.)



}
