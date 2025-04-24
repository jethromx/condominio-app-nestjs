import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountStatementDto } from './create-account-statement.dto';

export class UpdateAccountStatementDto extends PartialType(CreateAccountStatementDto) {}
