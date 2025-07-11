import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  HttpCode,
  HttpStatus,
  ValidationPipe,
  UseInterceptors,
  UseFilters 
} from '@nestjs/common';
import { MaintenanceFeesService } from './maintenance_fees.service';
import { CreateMaintenanceFeeDto } from './dto/create-maintenance_fee.dto';
import { UpdateMaintenanceFeeDto } from './dto/update-maintenance_fee.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { PaginationDTO } from 'src/common/dto/Pagination.dto';
import { ParseObjectIdPipe } from 'src/common/pipes/parse-objectid.pipe';
import { ResponseTransformInterceptor } from 'src/common/interceptors/response-transform.interceptor';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';

/**
 * Controlador para gestión de cuotas de mantenimiento
 * Maneja todas las operaciones CRUD y consultas específicas para cuotas de mantenimiento
 */
@Controller('condominiums/:condominiumId/maintenance-fees')
@Auth(ValidRoles.superUser, ValidRoles.admin)
@UseInterceptors(ResponseTransformInterceptor)
@UseFilters(AllExceptionsFilter)
export class MaintenanceFeesController {
  constructor(private readonly maintenanceFeesService: MaintenanceFeesService) {}

  /**
   * Crear una nueva cuota de mantenimiento
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Body(ValidationPipe) createMaintenanceFeeDto: CreateMaintenanceFeeDto,
    @GetUser('id') userId: string,
  ) {
    return this.maintenanceFeesService.create(condominiumId, createMaintenanceFeeDto, userId);
  }


  /**
   * Obtener todas las cuotas de mantenimiento paginadas
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Query(ValidationPipe) paginationDto: PaginationDTO,
  ) {
    return this.maintenanceFeesService.findAll(paginationDto, condominiumId);
  }


  /**
   * Obtener una cuota de mantenimiento por ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.maintenanceFeesService.findOne(condominiumId, id);
  }



  /**
   * Actualizar una cuota de mantenimiento
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Param('id', ParseObjectIdPipe) id: string, 
    @Body(ValidationPipe) updateMaintenanceFeeDto: UpdateMaintenanceFeeDto,
    @GetUser('id') userId: string,
  ) {
    return this.maintenanceFeesService.update(condominiumId, id, updateMaintenanceFeeDto, userId);
  }



  /**
   * Eliminar una cuota de mantenimiento (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.maintenanceFeesService.remove(condominiumId, id);
  }

  /**
   * Obtener estadísticas de cuotas de mantenimiento
   */
  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  getStatistics(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
  ) {
    return this.maintenanceFeesService.getMaintenanceFeeStatistics(condominiumId);
  }

  /**
   * Buscar cuotas de mantenimiento por tipo
   */
  @Get('by-type/:feedType')
  @HttpCode(HttpStatus.OK)
  findByFeedType(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Param('feedType') feedType: string,
    @Query(ValidationPipe) paginationDto: PaginationDTO,
  ) {
    return this.maintenanceFeesService.findByFeedType(condominiumId, feedType, paginationDto);
  }

  /**
   * Buscar cuota de mantenimiento por rango de fechas
   */
  @Get('by-date-range')
  @HttpCode(HttpStatus.OK)
  findByDateRange(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    return this.maintenanceFeesService.getMaintenanceByStartDate(condominiumId, start, end);
  }
}
