import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('generate')
  generatePdf(@Res() res: Response, @Query() query: { name: string; description: string }) {
    const data = {
      name: query.name || 'Condominio App',
      description: query.description || 'Reporte generado automáticamente.',
    };
    this.reportsService.generatePdf(res, data);
  }

  @Get('generate/:condominiumId')
  async generateAccountStatement(
    @Param('condominiumId') condominiumId: string,
    @Res() res: Response,
  ): Promise<void> {
    return this.reportsService.generateAccountStatement(res, condominiumId);
  }

  @Post()
  create(@Body() createReportDto: CreateReportDto) {
    return this.reportsService.create(createReportDto);
  }

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto) {
    return this.reportsService.update(+id, updateReportDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(+id);
  }
}
