import { IsDateString, IsEnum, IsNumber, IsString } from "class-validator";

export class CreateMaintenanceFeeDto {


  @IsString()
  detail: string;
  @IsNumber()
  amount: number;
  @IsNumber()
  penaltyAmount
  @IsDateString()
  startDate: string;
  @IsDateString()
  paymentDeadline: string;
  @IsString()
  @IsEnum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'DELETED'], {
    message: 'Status must be one of the following: ACTIVE, INACTIVE, SUSPENDED, DELETED',
  })
  status: string;

  @IsString()
  @IsEnum(['MANTENIMIENTO', 'EXTRAORDINARIA','SERVICIOS'], {
    message: 'FeedType must be one of the following: MANTENIMIENTO, EXTRAORDINARIA',
  })
  feedType: string;

  @IsString()
  @IsEnum(['MONTHLY', 'QUARTERLY', 'WEEKLY', 'ANUAL'])
  frecuency: string;


  @IsString()
  currency: string;

}
