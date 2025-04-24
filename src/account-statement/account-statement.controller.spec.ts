import { Test, TestingModule } from '@nestjs/testing';
import { AccountStatementController } from './account-statement.controller';
import { AccountStatementService } from './account-statement.service';

describe('AccountStatementController', () => {
  let controller: AccountStatementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccountStatementController],
      providers: [AccountStatementService],
    }).compile();

    controller = module.get<AccountStatementController>(AccountStatementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
