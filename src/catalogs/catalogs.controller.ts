import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('catalogs')

export class CatalogsController {
  constructor(private readonly catalogsService: CatalogsService) {}

  @Post()
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  create(@Body() createCatalogDto: CreateCatalogDto,
  @GetUser('id') userId: string, ) {
    return this.catalogsService.create(createCatalogDto,userId);
  }

  @Get()
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.catalogsService.findAll(Number(page), Number(limit));
  }

  @Get(':id')
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  findOne(@Param('id') id: string) {
    return this.catalogsService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  update(@Param('id') id: string, @Body() updateCatalogDto: UpdateCatalogDto,@GetUser('id') userId: string) {
    return this.catalogsService.update(id, updateCatalogDto,userId);
  }

  @Delete(':id')
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  remove(@Param('id') id: string) {
    return this.catalogsService.remove(id);
  }
}
