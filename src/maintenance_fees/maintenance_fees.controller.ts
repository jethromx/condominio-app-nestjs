import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { MaintenanceFeesService } from './maintenance_fees.service';
import { CreateMaintenanceFeeDto } from './dto/create-maintenance_fee.dto';
import { UpdateMaintenanceFeeDto } from './dto/update-maintenance_fee.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('condominiums/:condominiumId/maintenance-fees')
@Auth(ValidRoles.superUser, ValidRoles.admin)
export class MaintenanceFeesController {
  constructor(private readonly maintenanceFeesService: MaintenanceFeesService) {}

  @Post()
  create(
    @Param('condominiumId') condominiumId: string,
    @Body() createMaintenanceFeeDto: CreateMaintenanceFeeDto,
    @GetUser('id') userId: string,) {
    return this.maintenanceFeesService.create(condominiumId,createMaintenanceFeeDto, userId);
  }


  @Get()
  findAll(
    @Param('condominiumId') condominiumId: string,
    @Query() query: any,
  ) {
    return this.maintenanceFeesService.findAll(query,condominiumId);
  }


  @Get(':id')
  findOne(
    @Param('condominiumId') condominiumId: string,
    @Param('id') id: string) {
    return this.maintenanceFeesService.findOne(condominiumId,id);
  }



  @Patch(':id')
  update(
    @Param('condominiumId') condominiumId: string,
    @Param('id') id: string, 
    @Body() updateMaintenanceFeeDto: UpdateMaintenanceFeeDto,
    @GetUser('id') userId: string,) {
    return this.maintenanceFeesService.update(condominiumId,id, updateMaintenanceFeeDto, userId);
  }



  @Delete(':id')
  async remove(
    @Param('condominiumId') condominiumId: string,
    @Param('id') id: string,
    @Res() res: Response) {
    await  this.maintenanceFeesService.remove(condominiumId,id);
    return res.status(204).send();
  }
}
