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
  UseFilters,
  BadRequestException
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { PaginationDTO } from 'src/common/dto/Pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

// Pipes, interceptors y filtros personalizados
import { ParseObjectIdPipe } from 'src/common/pipes/parse-object-id.pipe';
import { PaymentValidationPipe } from './pipes/payment-validation.pipe';
import { ResponseTransformInterceptor } from 'src/common/interceptors/response-transform.interceptor';
import { AllExceptionsFilter } from 'src/common/filters/all-exceptions.filter';

/**
 * Controlador para la gestión de pagos
 * Maneja todas las operaciones CRUD relacionadas con pagos de apartamentos
 * Incluye validación automática, transformación de respuestas y manejo de errores
 */
@Controller('condominiums/:condominiumId/apartments/:idApartment/payments')
@Auth(ValidRoles.superUser, ValidRoles.admin)
@UseInterceptors(ResponseTransformInterceptor)
@UseFilters(AllExceptionsFilter)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * Crear un nuevo pago para un apartamento específico
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Param('idApartment', ParseObjectIdPipe) idApartment: string,
    @Body(ValidationPipe, PaymentValidationPipe) createPaymentDto: CreatePaymentDto,
    @GetUser('id') userId: string,
  ) {
    return this.paymentsService.create(createPaymentDto, userId, idApartment, condominiumId);
  }

  /**
   * Obtener todos los pagos de un apartamento con paginación
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Param('idApartment', ParseObjectIdPipe) idApartment: string,
    @Query(ValidationPipe) paginationDto: PaginationDTO,
  ) {
    return this.paymentsService.findAll(paginationDto, idApartment, condominiumId);
  }

  /**
   * Obtener un pago específico por su ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Param('idApartment', ParseObjectIdPipe) idApartment: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.paymentsService.findOne(id, idApartment, condominiumId);
  }

  /**
   * Actualizar un pago existente
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Param('idApartment', ParseObjectIdPipe) idApartment: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(ValidationPipe, PaymentValidationPipe) updatePaymentDto: UpdatePaymentDto,
    @GetUser('id') userId: string,
  ) {
    return this.paymentsService.update(id, updatePaymentDto, userId, idApartment, condominiumId);
  }

  /**
   * Eliminar un pago (soft delete)
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Param('idApartment', ParseObjectIdPipe) idApartment: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.paymentsService.remove(id, idApartment, condominiumId);
  }

  /**
   * Obtener estadísticas de pagos de un apartamento
   */
  @Get('statistics')
  @HttpCode(HttpStatus.OK)
  getStatistics(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Param('idApartment', ParseObjectIdPipe) idApartment: string,
  ) {
    return this.paymentsService.getPaymentStatistics(idApartment, condominiumId);
  }

  /**
   * Buscar pagos por rango de fechas
   */
  @Get('by-date-range')
  @HttpCode(HttpStatus.OK)
  findByDateRange(
    @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    @Param('idApartment', ParseObjectIdPipe) idApartment: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query(ValidationPipe) paginationDto: PaginationDTO,
  ) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
    }
    
    return this.paymentsService.findPaymentsByDateRange(
      idApartment, 
      condominiumId, 
      start, 
      end, 
      paginationDto
    );
  }
}


