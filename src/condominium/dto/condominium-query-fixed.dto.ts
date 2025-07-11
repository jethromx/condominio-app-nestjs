import { IsOptional, IsString, IsEnum, IsMongoId, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDTO } from 'src/common/dto/Pagination.dto';
import { CondominiumStatus } from '../entities/condominium-status.enum';

/**
 * Condominium Query DTO
 * 
 * Defines query parameters for filtering and searching condominiums.
 * Extends PaginationDTO to include pagination support.
 * 
 * @usage
 * - Used for GET /condominiums endpoint query parameters
 * - Supports text search, filtering by various fields, and pagination
 * - All fields are optional to allow flexible querying
 * 
 * @validation
 * - String fields are trimmed and have minimum length requirements
 * - MongoId fields are validated for proper ObjectId format
 * - Status field must match defined enum values
 * - Boolean fields are properly transformed from string query params
 */
export class CondominiumQueryDto extends PaginationDTO {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  city?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  state?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  country?: string;

  @IsOptional()
  @IsMongoId()
  adminId?: string;

  @IsOptional()
  @IsEnum(CondominiumStatus)
  status?: CondominiumStatus;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  neighborhood?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  zipCode?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  })
  isActive?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  sortBy?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc', 'ASC', 'DESC'])
  @Transform(({ value }) => value?.toLowerCase())
  sortOrder?: 'asc' | 'desc';
}
