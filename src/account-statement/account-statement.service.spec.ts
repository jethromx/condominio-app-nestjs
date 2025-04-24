import { Test, TestingModule } from '@nestjs/testing';
import { AccountStatementService } from './account-statement.service';

describe('AccountStatementService', () => {
  let service: AccountStatementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AccountStatementService],
    }).compile();

    service = module.get<AccountStatementService>(AccountStatementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
