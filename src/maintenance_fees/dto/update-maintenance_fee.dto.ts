import { PartialType } from '@nestjs/mapped-types';
import { CreateMaintenanceFeeDto } from './create-maintenance_fee.dto';

export class UpdateMaintenanceFeeDto extends PartialType(CreateMaintenanceFeeDto) {}
