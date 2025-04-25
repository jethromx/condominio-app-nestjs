import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

import { ValidRoles } from 'src/auth/interfaces';
import { Auth, GetUser } from 'src/auth/decorators';
import { PaginationDTO } from 'src/common/dto/Pagination.dto';

@Controller('condominiums/:condominiumId/apartments/:idApartment/payments')
@Auth(ValidRoles.superUser, ValidRoles.admin)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  create(
    @Param('condominiumId') condominiumId: string,
    @Param('idApartment') idApartment: string,
    @Body() createPaymentDto: CreatePaymentDto,
    @GetUser('id') userId: string,) {
    return this.paymentsService.create(createPaymentDto,userId,idApartment,condominiumId);
  }

  @Get()
  findAll(
    @Param('condominiumId') condominiumId: string,
    @Param('idApartment') idApartment: string,
    @Query() paginationDto: PaginationDTO,
  ) {
    return this.paymentsService.findAll(paginationDto,idApartment,condominiumId);
  }

  @Get(':id')
  findOne(
    @Param('condominiumId') condominiumId: string,
    @Param('idApartment') idApartment: string,
    @Param('id') id: string) {
    return this.paymentsService.findOne(id,idApartment,condominiumId);
  }

  @Patch(':id')
  update(
    @Param('condominiumId') condominiumId: string,
    @Param('idApartment') idApartment: string,
    @Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto,
  @GetUser('id') userId: string) {
    return this.paymentsService.update(id, updatePaymentDto,userId,idApartment,condominiumId);
  }

  @Delete(':id')
  remove(
    @Param('condominiumId') condominiumId: string,
    @Param('idApartment') idApartment: string,
    @Param('id') id: string) {
    return this.paymentsService.remove(id,idApartment,condominiumId);
  }
}


