import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  Res, 
  HttpCode, 
  HttpStatus, 
  ValidationPipe,
  UseInterceptors,
  UseFilters
} from '@nestjs/common';
import { Response } from 'express';
import { ApartmentService } from './apartment.service';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { PaginationDTO } from 'src/common/dto/Pagination.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { ResponseTransformInterceptor } from 'src/common/interceptors/response-transform.interceptor';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';

/**
 * Controlador para la gestión de apartamentos
 * Maneja todas las operaciones CRUD relacionadas con apartamentos dentro de un condominio
 */
@Controller('condominiums/:condominiumId/apartments')
@Auth(ValidRoles.superUser, ValidRoles.admin)
@UseInterceptors(ResponseTransformInterceptor)
@UseFilters(AllExceptionsFilter)
export class ApartmentController {
  constructor(private readonly apartmentService: ApartmentService) {}

  /**
   * Crear un nuevo apartamento en el condominio especificado
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Body(ValidationPipe) createApartmentDto: CreateApartmentDto,
    @GetUser('id') userId: string,
  ) {
    return this.apartmentService.create(createApartmentDto, userId, condominiumId);
  }


  /**
   * Obtener todos los apartamentos del condominio con paginación
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    // Convertir PaginationQueryDto a PaginationDTO para compatibilidad con el servicio existente
    const paginationDto: PaginationDTO = {
      page: paginationQuery.page,
      limit: paginationQuery.limit,
    };
    return this.apartmentService.findAll(paginationDto, condominiumId);
  }

  /**
   * Obtener apartamentos específicos de un condominio con paginación
   */
  @Get('by-condominium')
  @HttpCode(HttpStatus.OK)
  findAllByCondominium(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    // Convertir PaginationQueryDto a PaginationDTO para compatibilidad con el servicio existente
    const paginationDto: PaginationDTO = {
      page: paginationQuery.page,
      limit: paginationQuery.limit,
    };
    return this.apartmentService.findAllApartmentsByCondominium(paginationDto, condominiumId);
  }


  /**
   * Obtener un apartamento específico por su ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.apartmentService.findOne(id, condominiumId);
  }

  /**
   * Actualizar un apartamento existente
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Body(ValidationPipe) updateApartmentDto: UpdateApartmentDto,
    @GetUser('id') userId: string,
  ) {
    return this.apartmentService.update(id, updateApartmentDto, userId, condominiumId);
  }

  /**
   * Eliminar un apartamento (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Res() res: Response,
  ) {
    await this.apartmentService.remove(id, condominiumId);
    return res.status(HttpStatus.NO_CONTENT).send();
  }
}
