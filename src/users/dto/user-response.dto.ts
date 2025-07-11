import { Exclude, Expose, Type } from 'class-transformer';

export class UserResponseDto {
  @Expose()
  _id: string;

  @Expose()
  email: string;

  @Expose()
  fullName: string;

  @Expose()
  phone?: string;

  @Expose()
  isActive: boolean;

  @Expose()
  isEmailVerified: boolean;

  @Expose()
  roles: string[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Expose()
  createdBy: string;

  @Expose()
  updatedBy: string;

  // Exclude sensitive fields
  @Exclude()
  password: string;

  @Exclude()
  refreshToken: string;

  @Exclude()
  accessToken: string;
}

export class UserListResponseDto {
  @Expose()
  @Type(() => UserResponseDto)
  data: UserResponseDto[];

  @Expose()
  total: number;

  @Expose()
  page: number;

  @Expose()
  limit: number;

  @Expose()
  totalPages: number;
}

export class UserCreatedResponseDto {
  @Expose()
  message: string;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}

export class UserUpdatedResponseDto {
  @Expose()
  message: string;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}

export class UserDeletedResponseDto {
  @Expose()
  message: string;

  @Expose()
  @Type(() => UserResponseDto)
  user: UserResponseDto;
}
