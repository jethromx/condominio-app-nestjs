import { Injectable } from '@nestjs/common';
import { CreateAccountStatementDto } from './dto/create-account-statement.dto';
import { UpdateAccountStatementDto } from './dto/update-account-statement.dto';

@Injectable()
export class AccountStatementService {
  create(createAccountStatementDto: CreateAccountStatementDto) {
    return 'This action adds a new accountStatement';
  }

  findAll() {
    return `This action returns all accountStatement`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accountStatement`;
  }

  update(id: number, updateAccountStatementDto: UpdateAccountStatementDto) {
    return `This action updates a #${id} accountStatement`;
  }

  remove(id: number) {
    return `This action removes a #${id} accountStatement`;
  }
}
