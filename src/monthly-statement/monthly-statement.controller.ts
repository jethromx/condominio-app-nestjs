import { Controller, Get, Param, Query } from '@nestjs/common';
import { MonthlyStatementService } from './monthly-statement.service';


@Controller('condominiums/:condominiumId/statements')
export class MonthlyStatementsController {
  constructor(private readonly statementsService: MonthlyStatementService) {}

  @Get('')
  async getMonthlyStatement(
    @Param('condominiumId') condominiumId: string,
    @Query('month') month: string,
  ) {
    const date = new Date(month); // Convertir el mes a un objeto Date
   // return this.statementsService.generateMonthlyStatement(condominiumId, date);
  }
}