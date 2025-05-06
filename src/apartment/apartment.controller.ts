import { Controller, Get, Post, Body, Patch, Param, Delete, Query,Res } from '@nestjs/common';
import { Response } from 'express';
import { ApartmentService } from './apartment.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('condominiums/:condominiumId/apartments')
@Auth(ValidRoles.superUser, ValidRoles.admin)
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  @Post() 
  create(
    @Param('condominiumId') condominiumId: string,
    @Body() createApartmentDto: CreateApartmentDto,
    @GetUser('id') userId: string,) {
    return this.apartmentService.create(createApartmentDto,userId,condominiumId);
  }


  @Get()
  findAll(
    @Param('condominiumId') condominiumId: string,
    @Query() query: any,
  ) {
    return this.apartmentService.findAll(query,condominiumId);
  }


  @Get(':id')  
  findOne(
    @Param('condominiumId') condominiumId: string,
    @Param('id') id: string) {
    return this.apartmentService.findOne(id,condominiumId);
  }

 
  @Patch(':id')  
  update(
    @Param('id') id: string, 
    @Param('condominiumId') condominiumId: string,
    @Body() updateApartmentDto: UpdateApartmentDto,
    @GetUser('id') userId: string) {
    return this.apartmentService.update(id, updateApartmentDto,userId,condominiumId);
  }

  
  @Delete(':id')  
  async remove(    
    @Param('id') id: string,
    @Param('condominiumId') condominiumId: string,
    @Res() res: Response) {
    await this.apartmentService.remove(id,condominiumId);
    return res.status(204).send(); 
  }
}
