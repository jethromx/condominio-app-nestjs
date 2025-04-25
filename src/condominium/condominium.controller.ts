import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { CondominiumService } from './condominium.service';
import { CreateCondominiumDto } from './dto/create-condominium.dto';
import { UpdateCondominiumDto } from './dto/update-condominium.dto';
import { ValidRoles } from 'src/auth/interfaces';
import { Auth, GetUser } from 'src/auth/decorators';
import { ApartmentService } from 'src/apartment/apartment.service';
import { PaginationDTO } from 'src/common/dto/Pagination.dto';

@Controller('condominiums')
@Auth(ValidRoles.superUser, ValidRoles.admin)
export class CondominiumController {
  constructor(
    private readonly condominiumService: CondominiumService,
    private readonly apartmentService: ApartmentService,
  ) { }

  @Post() 
  create(
    @Body() createCondominiumDto: CreateCondominiumDto,
    @GetUser('id') userId: string,) {
    return this.condominiumService.create(createCondominiumDto, userId);
  }


  @Get()
  findAll(
    @Query() query: any,
  ) {
    return this.condominiumService.findAll(query);
  }



  @Get(':id')  
  findOne(@Param('id') id: string) {
    return this.condominiumService.findOne(id);
  }



  @Get(':id/apartments')  
  findApartments(
    @Query() paginationDto: PaginationDTO,
    @Param('id') idCondominium: string) {
    return this.apartmentService.findAllApartmentsByCondominium(paginationDto, idCondominium);
  }



  @Patch(':id')  
  update(
    @Param('id') id: string,
    @Body() updateCondominiumDto: UpdateCondominiumDto,
    @GetUser('id') userId: string,) {
    return this.condominiumService.update(id, updateCondominiumDto, userId);
  }



  @Delete(':id')  
  async remove(@
    Param('id') id: string,
    @Res() res: Response) {
    await this.condominiumService.remove(id);
    return res.status(204).send();
  }
}
