import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AccountStatementService } from './account-statement.service';
import { CreateAccountStatementDto } from './dto/create-account-statement.dto';
import { UpdateAccountStatementDto } from './dto/update-account-statement.dto';

@Controller('account-statement')
export class AccountStatementController {
  constructor(private readonly accountStatementService: AccountStatementService) {}

  @Post()
  create(@Body() createAccountStatementDto: CreateAccountStatementDto) {
    return this.accountStatementService.create(createAccountStatementDto);
  }

  @Get()
  findAll() {
    return this.accountStatementService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountStatementService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAccountStatementDto: UpdateAccountStatementDto) {
    return this.accountStatementService.update(+id, updateAccountStatementDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountStatementService.remove(+id);
  }
}
