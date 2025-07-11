import { IsOptional, IsString, IsBoolean, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationDTO } from 'src/common/dto/Pagination.dto';

export class UserQueryDto extends PaginationDTO {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isEmailVerified?: boolean;

  @IsOptional()
  @IsString()
  role?: string;
}
