import { Module } from '@nestjs/common';
import { AccountStatementService } from './account-statement.service';
import { AccountStatementController } from './account-statement.controller';

@Module({
  controllers: [AccountStatementController],
  providers: [AccountStatementService],
})
export class AccountStatementModule {}
