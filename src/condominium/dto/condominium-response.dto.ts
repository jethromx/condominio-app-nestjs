import { Exclude, Expose, Transform } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsNumber, IsMongoId, IsBoolean } from 'class-validator';
import { CondominiumStatus } from '../entities/condominium-status.enum';

/**
 * Condominium Response DTO
 * 
 * Defines the structure of condominium data returned by API endpoints.
 * Excludes sensitive internal fields and provides consistent data formatting.
 * 
 * @usage
 * - Used for serializing condominium data in HTTP responses
 * - Automatically excludes audit fields and sensitive data
 * - Provides consistent date formatting and field naming
 * 
 * @security
 * - Excludes internal audit fields (createdBy, updatedBy, deletedBy)
 * - Excludes soft delete timestamp
 * - Safe for public API consumption
 */
export class CondominiumResponseDto {
  @Expose()
  @IsMongoId()
  @Transform(({ obj }) => obj._id?.toString())
  id: string;

  @Expose()
  @IsString()
  name: string;

  @Expose()
  @IsString()
  description: string;

  @Expose()
  @IsString()
  street: string;

  @Expose()
  @IsString()
  streetNumber: string;

  @Expose()
  @IsString()
  neighborhood: string;

  @Expose()
  @IsString()
  city: string;

  @Expose()
  @IsString()
  state: string;

  @Expose()
  @IsString()
  country: string;

  @Expose()
  @IsOptional()
  @IsString()
  zipCode?: string;

  @Expose()
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @Expose()
  @IsOptional()
  @IsString()
  email?: string;

  @Expose()
  @IsEnum(CondominiumStatus)
  status: CondominiumStatus;

  @Expose()
  @IsNumber()
  totalUnits: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  totalFloors?: number;

  @Expose()
  @IsOptional()
  @IsNumber()
  parkingSpaces?: number;

  @Expose()
  @IsOptional()
  @IsString()
  amenities?: string;

  @Expose()
  @IsOptional()
  @IsMongoId()
  @Transform(({ obj }) => obj.adminId?.toString())
  adminId?: string;

  @Expose()
  @IsOptional()
  @Transform(({ obj }) => obj.admin?.fullName)
  adminName?: string;

  @Expose()
  @IsBoolean()
  isActive: boolean;

  @Expose()
  @Transform(({ obj }) => obj.createdAt?.toISOString())
  createdAt: string;

  @Expose()
  @Transform(({ obj }) => obj.updatedAt?.toISOString())
  updatedAt: string;

  // Exclude sensitive audit fields
  @Exclude()
  createdBy?: string;

  @Exclude()
  updatedBy?: string;

  @Exclude()
  deletedBy?: string;

  @Exclude()
  deletedAt?: Date;

  @Exclude()
  __v?: number;

  constructor(partial: Partial<CondominiumResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * Paginated Condominium Response DTO
 * 
 * Wraps condominium data with pagination metadata for list endpoints.
 */
export class PaginatedCondominiumResponseDto {
  @Expose()
  data: CondominiumResponseDto[];

  @Expose()
  @IsNumber()
  total: number;

  @Expose()
  @IsNumber()
  page: number;

  @Expose()
  @IsNumber()
  limit: number;

  @Expose()
  @IsNumber()
  totalPages: number;

  @Expose()
  @IsBoolean()
  hasNextPage: boolean;

  @Expose()
  @IsBoolean()
  hasPrevPage: boolean;

  constructor(partial: Partial<PaginatedCondominiumResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * Condominium Statistics Response DTO
 * 
 * Provides aggregated statistics about condominiums in the system.
 */
export class CondominiumStatsResponseDto {
  @Expose()
  @IsNumber()
  total: number;

  @Expose()
  @IsNumber()
  active: number;

  @Expose()
  @IsNumber()
  inactive: number;

  @Expose()
  @IsNumber()
  underConstruction: number;

  @Expose()
  @IsNumber()
  maintenance: number;

  @Expose()
  @IsNumber()
  totalUnits: number;

  @Expose()
  @IsNumber()
  averageUnitsPerCondominium: number;

  @Expose()
  byStatus: Record<CondominiumStatus, number>;

  @Expose()
  @Transform(({ obj }) => obj.lastUpdated?.toISOString())
  lastUpdated: string;

  constructor(partial: Partial<CondominiumStatsResponseDto>) {
    Object.assign(this, partial);
  }
}
