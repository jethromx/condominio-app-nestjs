
import { IsArray, IsEmail, IsEnum, IsLatitude, IsLongitude, IsNumber, IsOptional, IsPhoneNumber, IsString, IsUrl, IsUUID } from "class-validator";
import { CondominiumStatus } from "../entities/condominium-status.enum";

export class CreateCondominiumDto {

    @IsString()    
    name: string; // Nombre del condominio
    
    @IsString()
    street: string; // Calle del condominio

    @IsString()
    streetNumber: string; // Número de la calle del condominio

    @IsString()
    neighborhood: string; // Colonia/barrio del condominio

    @IsString()
    city: string; // Ciudad del condominio

    @IsString()
    state: string; // Estado del condominio

    @IsString()
    country: string; // País del condominio

    @IsString()
    zipCode: string; // Código postal del condominio

    @IsLatitude()
    @IsOptional()
    latitude?: string; // Latitud del condominio

    @IsLongitude()
    @IsOptional()
    longitude?: string; // Longitud del condominio

    @IsString()
    @IsOptional()
     @IsUUID()
    adminId?: string; // ID del administrador del condominio

    @IsString()
    @IsOptional()
    description?: string; // Descripción opcional del condominio

    @IsOptional()
    @IsPhoneNumber('MX')
    phone?: string; // Teléfono opcional del condominio

    @IsString()
    @IsEmail()
    @IsOptional()
    email?: string; // Correo electrónico opcional del condominio

    @IsUrl()
    @IsOptional()
    website?: string; // Sitio web opcional del condominio

    @IsString()
    @IsOptional()
    logo?: string; // URL del logo opcional del condominio

    @IsOptional()
    @IsString()
    image?: string; // URL de la imagen opcional del condominio

    @IsNumber()
    @IsOptional()
    totalFloors?: number; // Número total de pisos del condominio

    @IsNumber()
    @IsOptional()
    totalApartments?: number; // Número total de apartamentos del condominio

    @IsNumber()
    @IsOptional()
    totalParkingSpaces?: number; // Número total de espacios de estacionamiento del condominio

    @IsNumber()
    @IsOptional()
    totalStorageSpaces?: number; // Número total de espacios de almacenamiento del condominio

    @IsNumber()
    @IsOptional()
    totalCommonAreas?: number; // Número total de áreas comunes del condominio

    @IsString()
    @IsEnum(CondominiumStatus, {
      message: `Status must be one of the following: ${Object.values(CondominiumStatus).join(', ')}`,
      })
    status?= CondominiumStatus.ACTIVE;  // Estado del condominio (activo, inactivo, etc.)

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    amenities: string[];

}

