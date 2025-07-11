import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Payment } from './entities/payment.entity';
import { PaginationDTO } from 'src/common/dto/Pagination.dto';
import { ApartmentService } from 'src/apartment/apartment.service';
import { MaintenanceFeesService } from 'src/maintenance_fees/maintenance_fees.service';
import { ACTIVE, DELETED, ID_NOT_VALID } from 'src/common/messages.const';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  // Constantes para logging
  private readonly CREATE_PAYMENT = 'CREATE_PAYMENT';
  private readonly UPDATE_PAYMENT = 'UPDATE_PAYMENT';
  private readonly DELETE_PAYMENT = 'DELETE_PAYMENT';
  private readonly FIND_ALL_PAYMENT = 'FIND_ALL_PAYMENT';
  private readonly FIND_PAYMENT_BY_ID = 'FIND_PAYMENT_BY_ID';
  private readonly FIND_PAYMENTS_BY_CONDOMINIUM_MAINTENANCE_FEE = 'FIND_PAYMENTS_BY_CONDOMINIUM_MAINTENANCE_FEE';

  // Constantes para mensajes de error
  private readonly PAYMENT_NOT_FOUND = 'Payment not found';
  private readonly FAILED_TO_UPDATE = 'Failed to update payment';
  private readonly FAILED_TO_DELETE = 'Failed to delete payment';

  constructor(
    @InjectModel(Payment.name)
    private readonly paymentModel: Model<Payment>,
    private readonly apartmentService: ApartmentService,
    private readonly maintenanceFeeService: MaintenanceFeesService
  ) { }


  async create(createPaymentDto: CreatePaymentDto, userId: string, idApartment: string, condominiumId: string) {
    this.logger.log(`${this.CREATE_PAYMENT} - IN`);

    // Validar IDs
    this.validateId(idApartment);
    this.validateId(condominiumId);
    if (userId) this.validateId(userId);

    // Verificar si el apartamento existe y pertenece al condominio
    this.logger.debug(`${this.CREATE_PAYMENT} - Verificando apartamento ${idApartment} en condominio ${condominiumId}`);
    await this.apartmentService.findOne(idApartment, condominiumId);

    // Verificar si la cuota de mantenimiento existe
    this.logger.debug(`${this.CREATE_PAYMENT} - Verificando cuota de mantenimiento ${createPaymentDto.maintenanceFeeId}`);
    await this.maintenanceFeeService.findOne(condominiumId, createPaymentDto.maintenanceFeeId);

    // Verificar idempotencia si se proporciona la clave
    if (createPaymentDto.idempotencyKey) {
      this.logger.debug(`${this.CREATE_PAYMENT} - Verificando idempotencia con clave: ${createPaymentDto.idempotencyKey}`);
      const existingPayment = await this.paymentModel.findOne({ 
        idempotencyKey: createPaymentDto.idempotencyKey 
      }).exec();
      
      if (existingPayment) {
        this.logger.log(`${this.CREATE_PAYMENT} - Solicitud idempotente, retornando pago existente`);
        return existingPayment;
      }
    }

    // Crear el pago
    this.logger.debug(`${this.CREATE_PAYMENT} - Creando pago para apartamento ${idApartment}`);
    const payment = await this.paymentModel.create({
      ...createPaymentDto,
      apartmentId: idApartment,
      userId,
      createdBy: userId,
      updatedBy: userId,
    });
    
    this.logger.log(`${this.CREATE_PAYMENT} - OUT`);
    return payment;
  }


  async findAllbyCondominiumMantenanceFee(condominiumId: string, maintenanceFeeId: string) {
    this.logger.log(`${this.FIND_PAYMENTS_BY_CONDOMINIUM_MAINTENANCE_FEE} - IN`);
    
    // Validar IDs
    this.validateId(condominiumId);
    this.validateId(maintenanceFeeId);

    // Verificar que la cuota de mantenimiento existe
    this.logger.debug(`${this.FIND_PAYMENTS_BY_CONDOMINIUM_MAINTENANCE_FEE} - Verificando cuota de mantenimiento`);
    await this.maintenanceFeeService.findOne(condominiumId, maintenanceFeeId);

    const rootFilter = {
      maintenanceFeeId: maintenanceFeeId,
      status: ACTIVE, 
    };

    this.logger.debug(`${this.FIND_PAYMENTS_BY_CONDOMINIUM_MAINTENANCE_FEE} - Filtro: ${JSON.stringify(rootFilter)}`);

    // Obtener los pagos con población de datos del apartamento
    const payments = await this.paymentModel
      .find(rootFilter)
      .populate({
        path: 'apartmentId',
        select: 'name description',
      })
      .sort({ createdAt: -1 })
      .lean()
      .exec();

    this.logger.log(`${this.FIND_PAYMENTS_BY_CONDOMINIUM_MAINTENANCE_FEE} - OUT`);
    return payments;
  }


  async findAll(paginationDto: PaginationDTO, idApartment: string, condominiumId: string) {
    this.logger.log(`${this.FIND_ALL_PAYMENT} - IN`);

    // Validar IDs
    this.validateId(idApartment);
    this.validateId(condominiumId);

    // Verificar que el apartamento existe y pertenece al condominio
    this.logger.debug(`${this.FIND_ALL_PAYMENT} - Verificando apartamento ${idApartment} en condominio ${condominiumId}`);
    await this.apartmentService.findOne(idApartment, condominiumId);

    // Validar y obtener parámetros de paginación
    const { page, limit, skip } = this.validatePagination(paginationDto);

    const rootFilter = {
      apartmentId: idApartment,
      status: { $ne: DELETED },
    };

    this.logger.debug(`${this.FIND_ALL_PAYMENT} - Filtro: ${JSON.stringify(rootFilter)}, paginación: página ${page}, límite ${limit}`);
    
    // Obtener los pagos con paginación
    const payments = await this.paymentModel
      .find(rootFilter)
      .populate({
        path: 'apartmentId',
        select: 'name description',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Contar el total de documentos
    this.logger.debug(`${this.FIND_ALL_PAYMENT} - Contando pagos encontrados`);
    const total = await this.paymentModel.countDocuments(rootFilter).exec();

    this.logger.log(`${this.FIND_ALL_PAYMENT} - OUT`);
    return this.createPaginatedResponse(payments, page, limit, total);
  }



  async findOne(id: string, idApartment: string, condominiumId: string) {
    this.logger.log(`${this.FIND_PAYMENT_BY_ID} - IN`);

    // Validar IDs
    this.validateId(id);
    this.validateId(idApartment);
    this.validateId(condominiumId);

    // Verificar que el apartamento existe y pertenece al condominio
    this.logger.debug(`${this.FIND_PAYMENT_BY_ID} - Verificando apartamento ${idApartment} en condominio ${condominiumId}`);
    await this.apartmentService.findOne(idApartment, condominiumId);

    // Buscar el pago que pertenezca al apartamento específico
    this.logger.debug(`${this.FIND_PAYMENT_BY_ID} - Buscando pago ${id} para apartamento ${idApartment}`);
    const payment = await this.paymentModel.findOne({
      _id: id,
      apartmentId: idApartment,
      status: { $ne: DELETED }
    }).populate({
      path: 'apartmentId',
      select: 'name description',
    }).exec();

    if (!payment) {
      this.logger.error(`${this.FIND_PAYMENT_BY_ID} - ${this.PAYMENT_NOT_FOUND} with ID "${id}" for apartment "${idApartment}"`);
      throw new NotFoundException(`${this.PAYMENT_NOT_FOUND} with ID ${id} for apartment ${idApartment}`);
    }

    this.logger.log(`${this.FIND_PAYMENT_BY_ID} - OUT`);
    return payment;
  }



  async update(id: string, updatePaymentDto: UpdatePaymentDto, userId: string, idApartment: string, condominiumId: string) {
    this.logger.log(`${this.UPDATE_PAYMENT} - IN`);

    // Validar IDs
    this.validateId(id);
    this.validateId(idApartment);
    this.validateId(condominiumId);
    if (userId) this.validateId(userId);

    // Verificar que el apartamento existe y pertenece al condominio
    this.logger.debug(`${this.UPDATE_PAYMENT} - Verificando apartamento ${idApartment} en condominio ${condominiumId}`);
    await this.apartmentService.findOne(idApartment, condominiumId);

    // Verificar que el pago existe y pertenece al apartamento
    this.logger.debug(`${this.UPDATE_PAYMENT} - Verificando que el pago ${id} existe para apartamento ${idApartment}`);
    await this.findOne(id, idApartment, condominiumId);

    // Verificar cuota de mantenimiento si se está actualizando
    if (updatePaymentDto.maintenanceFeeId) {
      this.logger.debug(`${this.UPDATE_PAYMENT} - Verificando nueva cuota de mantenimiento ${updatePaymentDto.maintenanceFeeId}`);
      await this.maintenanceFeeService.findOne(condominiumId, updatePaymentDto.maintenanceFeeId);
    }

    // Actualizar el pago
    this.logger.debug(`${this.UPDATE_PAYMENT} - Actualizando pago ${id}`);
    const payment = await this.paymentModel.findOneAndUpdate(
      { 
        _id: id, 
        apartmentId: idApartment,
        status: { $ne: DELETED }
      },
      {
        ...updatePaymentDto,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      { new: true }
    ).populate({
      path: 'apartmentId',
      select: 'name description',
    }).exec();

    if (!payment) {
      this.logger.error(`${this.UPDATE_PAYMENT} - ${this.FAILED_TO_UPDATE} with ID "${id}"`);
      throw new NotFoundException(`${this.FAILED_TO_UPDATE} with ID ${id}`);
    }
    
    this.logger.log(`${this.UPDATE_PAYMENT} - OUT`);
    return payment;
  }

  async remove(id: string, idApartment: string, condominiumId: string) {
    this.logger.log(`${this.DELETE_PAYMENT} - IN`);

    // Validar IDs
    this.validateId(id);
    this.validateId(idApartment);
    this.validateId(condominiumId);

    // Verificar que el apartamento existe y pertenece al condominio
    this.logger.debug(`${this.DELETE_PAYMENT} - Verificando apartamento ${idApartment} en condominio ${condominiumId}`);
    await this.apartmentService.findOne(idApartment, condominiumId);

    // Verificar que el pago existe y pertenece al apartamento
    this.logger.debug(`${this.DELETE_PAYMENT} - Verificando que el pago ${id} existe para apartamento ${idApartment}`);
    await this.findOne(id, idApartment, condominiumId);

    // Soft delete del pago
    this.logger.debug(`${this.DELETE_PAYMENT} - Realizando soft delete del pago ${id}`);
    const payment = await this.paymentModel.findOneAndUpdate(
      { 
        _id: id, 
        apartmentId: idApartment,
        status: { $ne: DELETED }
      },
      { 
        status: DELETED,
        updatedAt: new Date()
      },
      { new: true }
    ).exec();

    if (!payment) {
      this.logger.error(`${this.DELETE_PAYMENT} - ${this.FAILED_TO_DELETE} with ID "${id}"`);
      throw new NotFoundException(`${this.FAILED_TO_DELETE} with ID ${id}`);
    }

    this.logger.log(`${this.DELETE_PAYMENT} - OUT`);
    return payment;
  }


  /**
   * Valida que un ID de MongoDB sea válido
   * @param id - El ID a validar
   * @throws BadRequestException si el ID no es válido
   */
  private validateId(id: string): void {
    if (!isValidObjectId(id)) {
      this.logger.error(ID_NOT_VALID(id));
      throw new BadRequestException(ID_NOT_VALID(id));
    }
  }

  /**
   * Método de utilidad para crear respuestas paginadas consistentes
   * @param data - Los datos a paginar
   * @param page - Página actual
   * @param limit - Límite por página
   * @param total - Total de documentos
   */
  private createPaginatedResponse<T>(data: T[], page: number, limit: number, total: number) {
    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  /**
   * Valida y sanitiza los parámetros de paginación
   * @param paginationDto - DTO de paginación
   */
  private validatePagination(paginationDto: PaginationDTO) {
    const { page = 1, limit = 10 } = paginationDto;
    
    // Validar que los valores sean positivos
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    
    return { page, limit, skip: (page - 1) * limit };
  }

  /**
   * Obtener estadísticas de pagos por apartamento
   * @param idApartment - ID del apartamento
   * @param condominiumId - ID del condominio
   */
  async getPaymentStatistics(idApartment: string, condominiumId: string) {
    this.logger.log(`GET_PAYMENT_STATISTICS - IN`);

    // Validar IDs
    this.validateId(idApartment);
    this.validateId(condominiumId);

    // Verificar que el apartamento existe
    await this.apartmentService.findOne(idApartment, condominiumId);

    const [totalPayments, activePayments, totalAmount] = await Promise.all([
      // Total de pagos (incluyendo eliminados)
      this.paymentModel.countDocuments({ apartmentId: idApartment }).exec(),
      
      // Pagos activos
      this.paymentModel.countDocuments({ 
        apartmentId: idApartment, 
        status: ACTIVE 
      }).exec(),
      
      // Suma total de montos de pagos activos
      this.paymentModel.aggregate([
        { $match: { apartmentId: idApartment, status: ACTIVE } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]).exec()
    ]);

    const statistics = {
      totalPayments,
      activePayments,
      deletedPayments: totalPayments - activePayments,
      totalAmount: totalAmount.length > 0 ? totalAmount[0].total : 0,
      averagePayment: activePayments > 0 ? (totalAmount.length > 0 ? totalAmount[0].total / activePayments : 0) : 0,
    };

    this.logger.log(`GET_PAYMENT_STATISTICS - OUT`);
    return statistics;
  }

  /**
   * Buscar pagos por rango de fechas
   * @param idApartment - ID del apartamento
   * @param condominiumId - ID del condominio
   * @param startDate - Fecha de inicio
   * @param endDate - Fecha de fin
   * @param paginationDto - Parámetros de paginación
   */
  async findPaymentsByDateRange(
    idApartment: string, 
    condominiumId: string, 
    startDate: Date, 
    endDate: Date,
    paginationDto: PaginationDTO
  ) {
    this.logger.log(`FIND_PAYMENTS_BY_DATE_RANGE - IN`);

    // Validar IDs
    this.validateId(idApartment);
    this.validateId(condominiumId);

    // Verificar que el apartamento existe
    await this.apartmentService.findOne(idApartment, condominiumId);

    // Validar fechas
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Validar paginación
    const { page, limit, skip } = this.validatePagination(paginationDto);

    const rootFilter = {
      apartmentId: idApartment,
      status: { $ne: DELETED },
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    };

    this.logger.debug(`FIND_PAYMENTS_BY_DATE_RANGE - Filtro: ${JSON.stringify(rootFilter)}`);

    // Obtener los pagos con paginación
    const payments = await this.paymentModel
      .find(rootFilter)
      .populate({
        path: 'apartmentId',
        select: 'name description',
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    // Contar el total de documentos
    const total = await this.paymentModel.countDocuments(rootFilter).exec();

    this.logger.log(`FIND_PAYMENTS_BY_DATE_RANGE - OUT`);
    return this.createPaginatedResponse(payments, page, limit, total);
  }
}
