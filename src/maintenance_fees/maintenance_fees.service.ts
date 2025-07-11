import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMaintenanceFeeDto } from './dto/create-maintenance_fee.dto';
import { UpdateMaintenanceFeeDto } from './dto/update-maintenance_fee.dto';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { MaintenanceFee } from './entities/maintenance_fee.entity';
import { ACTIVE, DELETED, ID_NOT_VALID } from 'src/common/messages.const';
import { CondominiumService } from 'src/condominium/condominium.service';
import { PaginationDTO } from 'src/common/dto/Pagination.dto';


/**
 * Servicio para gestión de cuotas de mantenimiento
 * Proporciona operaciones CRUD y funcionalidades específicas para manejo de cuotas
 */
@Injectable()
export class MaintenanceFeesService {
  private readonly logger = new Logger(MaintenanceFeesService.name);
  
  // Constantes para logging y mensajes
  private readonly CREATE_MAINTENANCE_FEE = 'CREATE_MAINTENANCE_FEE';
  private readonly UPDATE_MAINTENANCE_FEE = 'UPDATE_MAINTENANCE_FEE';
  private readonly DELETE_MAINTENANCE_FEE = 'DELETE_MAINTENANCE_FEE';
  private readonly FIND_ALL_MAINTENANCE_FEE = 'FIND_ALL_MAINTENANCE_FEE';
  private readonly FIND_MAINTENANCE_FEE_BY_ID = 'FIND_MAINTENANCE_FEE_BY_ID';

  // Constantes para mensajes de error
  private readonly MAINTENANCE_FEE_NOT_FOUND = 'Maintenance fee not found';
  private readonly MAINTENANCE_FEE_ALREADY_EXISTS = 'Maintenance fee already exists';
  private readonly NO_MAINTENANCE_FEES_FOUND = 'No maintenance fees found';
  private readonly INVALID_DATE_RANGE = 'Invalid date range provided';

  constructor(
     @InjectModel(MaintenanceFee.name)
     private readonly maintenanceFeeModel: Model<MaintenanceFee>,
     private readonly condominiumService: CondominiumService,
  ) {}

  /**
   * Valida parámetros de paginación
   */
  private validatePagination(paginationDto: PaginationDTO): void {
    const { page = 1, limit = 10 } = paginationDto;
    
    if (page < 1) {
      throw new BadRequestException('Page must be greater than 0');
    }
    
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
  }

  /**
   * Crea respuesta paginada estándar
   */
  private createPaginatedResponse(data: any[], total: number, page: number, limit: number) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
      data
    };
  }

  /**
   * Valida que las fechas sean válidas y coherentes
   */
  private validateDateRange(startDate: Date, endDate: Date): void {
    if (!startDate || !endDate) {
      throw new BadRequestException('Start date and end date are required');
    }
    
    if (startDate > endDate) {
      throw new BadRequestException('Start date cannot be greater than end date');
    }
  }

  /**
   * Crear una nueva cuota de mantenimiento
   * @param condominiumId - ID del condominio
   * @param createMaintenanceFeeDto - Datos de la cuota a crear
   * @param userId - ID del usuario creador
   * @returns Cuota de mantenimiento creada
   */
  async create(condominiumId: string, createMaintenanceFeeDto: CreateMaintenanceFeeDto, userId: string) {
    this.logger.log(`${this.CREATE_MAINTENANCE_FEE} - IN`);

    this.validateId(userId);
    this.validateId(condominiumId);

    // Verificar si el condominio existe
    await this.condominiumService.findOne(condominiumId);

    if (createMaintenanceFeeDto.detail) {
      // Verificar si la cuota de mantenimiento ya existe
      const existingMaintenanceFee = await this.maintenanceFeeModel.findOne({ 
        detail: createMaintenanceFeeDto.detail,
        condominiumId: condominiumId,
        status: ACTIVE 
      }).exec();
      
      if (existingMaintenanceFee) {
        this.logger.error(`${this.CREATE_MAINTENANCE_FEE} - Maintenance fee with detail "${createMaintenanceFeeDto.detail}" already exists`);
        throw new BadRequestException(`${this.MAINTENANCE_FEE_ALREADY_EXISTS} with detail "${createMaintenanceFeeDto.detail}"`);
      }
    }

    // Crear un nuevo mantenimiento
    const maintenanceFee = new this.maintenanceFeeModel({
      condominiumId: condominiumId,     
      createdBy: userId,
      updatedBy: userId,
      ...createMaintenanceFeeDto,
    });

    const savedMaintenanceFee = await maintenanceFee.save();
    this.logger.log(`${this.CREATE_MAINTENANCE_FEE} - OUT - Created maintenance fee with ID: ${savedMaintenanceFee._id}`);
    return savedMaintenanceFee;
  }



  /**
   * Obtener todas las cuotas de mantenimiento paginadas
   * @param paginationDto - Parámetros de paginación
   * @param condominiumId - ID del condominio
   * @returns Lista paginada de cuotas de mantenimiento
   */
  async findAll(paginationDto: PaginationDTO, condominiumId: string) {
    this.logger.log(`${this.FIND_ALL_MAINTENANCE_FEE} - IN`);

    this.validateId(condominiumId);
    this.validatePagination(paginationDto);
    
    // Verificar si el condominio existe
    await this.condominiumService.findOne(condominiumId);

    const rootFilter = { status: ACTIVE, condominiumId: condominiumId };
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    // Obtener los documentos de la base de datos
    const maintenanceFees = await this.maintenanceFeeModel
      .find(rootFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() // Mejor rendimiento al devolver objetos planos
      .exec();

    // Contar el total de documentos
    const total = await this.maintenanceFeeModel.countDocuments(rootFilter).exec();
    
    this.logger.log(`${this.FIND_ALL_MAINTENANCE_FEE} - OUT - Found ${maintenanceFees.length} maintenance fees`);
    return this.createPaginatedResponse(maintenanceFees, total, page, limit);
  }




  /**
   * Obtener una cuota de mantenimiento por ID
   * @param condominiumId - ID del condominio
   * @param id - ID de la cuota de mantenimiento
   * @returns Cuota de mantenimiento encontrada
   */
  async findOne(condominiumId: string, id: string) {
    this.logger.log(`${this.FIND_MAINTENANCE_FEE_BY_ID} - IN`);

    this.validateId(condominiumId);
    this.validateId(id);

    // Verificar si el condominio existe
    await this.condominiumService.findOne(condominiumId);

    const maintenanceFee = await this.maintenanceFeeModel.findOne({ 
      _id: id, 
      condominiumId: condominiumId,
      status: ACTIVE 
    }).exec();
    
    if (!maintenanceFee) {
      this.logger.error(`${this.FIND_MAINTENANCE_FEE_BY_ID} - Maintenance fee with id ${id} not found`);
      throw new NotFoundException(`${this.MAINTENANCE_FEE_NOT_FOUND} with id ${id}`);
    }
    
    this.logger.log(`${this.FIND_MAINTENANCE_FEE_BY_ID} - OUT - Found maintenance fee: ${id}`);
    return maintenanceFee;
  }




  /**
   * Actualizar una cuota de mantenimiento
   * @param condominiumId - ID del condominio
   * @param id - ID de la cuota de mantenimiento
   * @param updateMaintenanceFeeDto - Datos a actualizar
   * @param userId - ID del usuario que actualiza
   * @returns Cuota de mantenimiento actualizada
   */
  async update(condominiumId: string, id: string, updateMaintenanceFeeDto: UpdateMaintenanceFeeDto, userId: string) {
    this.logger.log(`${this.UPDATE_MAINTENANCE_FEE} - IN`);

    this.validateId(userId);
    this.validateId(condominiumId);
    this.validateId(id);

    // Verificar si el condominio existe
    await this.condominiumService.findOne(condominiumId);
    
    // Verificar si la cuota de mantenimiento existe
    await this.findOne(condominiumId, id);

    // Verificar duplicados si se está actualizando el detalle
    if (updateMaintenanceFeeDto.detail) {
      const existingMaintenanceFee = await this.maintenanceFeeModel.findOne({
        detail: updateMaintenanceFeeDto.detail,
        condominiumId: condominiumId,
        _id: { $ne: id },
        status: ACTIVE
      }).exec();

      if (existingMaintenanceFee) {
        this.logger.error(`${this.UPDATE_MAINTENANCE_FEE} - Maintenance fee with detail "${updateMaintenanceFeeDto.detail}" already exists`);
        throw new BadRequestException(`${this.MAINTENANCE_FEE_ALREADY_EXISTS} with detail "${updateMaintenanceFeeDto.detail}"`);
      }
    }

    const updateData = {
      ...updateMaintenanceFeeDto,
      updatedBy: userId,
      updatedAt: new Date()
    };

    const maintenanceFee = await this.maintenanceFeeModel.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true }
    ).exec();
    
    if (!maintenanceFee) {
      this.logger.error(`${this.UPDATE_MAINTENANCE_FEE} - Maintenance fee with id ${id} not found during update`);
      throw new NotFoundException(`${this.MAINTENANCE_FEE_NOT_FOUND} with id ${id}`);
    }
    
    this.logger.log(`${this.UPDATE_MAINTENANCE_FEE} - OUT - Updated maintenance fee: ${id}`);
    return maintenanceFee;
  }



  /**
   * Obtener cuotas de mantenimiento por rango de fechas
   * @param condominiumId - ID del condominio
   * @param startDate - Fecha de inicio
   * @param endDate - Fecha de fin
   * @returns Cuota de mantenimiento en el rango especificado
   */
  async getMaintenanceByStartDate(condominiumId: string, startDate: Date, endDate: Date) {
    this.logger.log(`${this.FIND_ALL_MAINTENANCE_FEE} - IN`);
    
    this.validateId(condominiumId);
    this.validateDateRange(startDate, endDate);
   
    // Verificar si el condominio existe
    await this.condominiumService.findOne(condominiumId);

    const rootFilter = { 
      status: ACTIVE, 
      condominiumId: condominiumId, 
      startDate: { 
        $gte: startDate.toISOString(), 
        $lte: endDate.toISOString() 
      },
      feedType: { $eq: 'MANTENIMIENTO' }
    };

    this.logger.debug(`${this.FIND_ALL_MAINTENANCE_FEE} - Filter: ${JSON.stringify(rootFilter)}`);

    const maintenanceFees = await this.maintenanceFeeModel
      .findOne(rootFilter)   
      .exec();

    this.logger.log(`${this.FIND_ALL_MAINTENANCE_FEE} - OUT - Found maintenance fee in date range`);
    return maintenanceFees;
  }




  /**
   * Eliminar una cuota de mantenimiento (soft delete)
   * @param condominiumId - ID del condominio
   * @param id - ID de la cuota de mantenimiento
   * @returns Cuota de mantenimiento eliminada
   */
  async remove(condominiumId: string, id: string) {
    this.logger.log(`${this.DELETE_MAINTENANCE_FEE} - IN`);

    this.validateId(condominiumId);
    this.validateId(id);

    // Verificar si el condominio existe
    await this.condominiumService.findOne(condominiumId);

    // Verificar si la cuota de mantenimiento existe
    const maintenanceFee = await this.findOne(condominiumId, id);

    // Cambiar el estado a DELETED
    maintenanceFee.status = DELETED;
    const deletedMaintenanceFee = await maintenanceFee.save();
    
    this.logger.log(`${this.DELETE_MAINTENANCE_FEE} - OUT - Soft deleted maintenance fee: ${id}`);
    return deletedMaintenanceFee;
  }

  /**
   * Obtener estadísticas de cuotas de mantenimiento
   * @param condominiumId - ID del condominio
   * @returns Estadísticas de cuotas de mantenimiento
   */
  async getMaintenanceFeeStatistics(condominiumId: string) {
    this.logger.log(`${this.FIND_ALL_MAINTENANCE_FEE} - Statistics - IN`);
    
    this.validateId(condominiumId);
    await this.condominiumService.findOne(condominiumId);

    const statistics = await this.maintenanceFeeModel.aggregate([
      {
        $match: {
          condominiumId: condominiumId,
          status: ACTIVE
        }
      },
      {
        $group: {
          _id: null,
          totalFees: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          minAmount: { $min: '$amount' },
          maxAmount: { $max: '$amount' }
        }
      }
    ]).exec();

    const result = statistics[0] || {
      totalFees: 0,
      totalAmount: 0,
      averageAmount: 0,
      minAmount: 0,
      maxAmount: 0
    };

    this.logger.log(`${this.FIND_ALL_MAINTENANCE_FEE} - Statistics - OUT`);
    return result;
  }

  /**
   * Buscar cuotas de mantenimiento por tipo
   * @param condominiumId - ID del condominio
   * @param feedType - Tipo de cuota
   * @param paginationDto - Parámetros de paginación
   * @returns Lista paginada de cuotas filtradas por tipo
   */
  async findByFeedType(condominiumId: string, feedType: string, paginationDto: PaginationDTO) {
    this.logger.log(`${this.FIND_ALL_MAINTENANCE_FEE} - By Feed Type - IN`);
    
    this.validateId(condominiumId);
    this.validatePagination(paginationDto);
    
    await this.condominiumService.findOne(condominiumId);

    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;
    
    const rootFilter = { 
      status: ACTIVE, 
      condominiumId: condominiumId,
      feedType: feedType
    };

    const maintenanceFees = await this.maintenanceFeeModel
      .find(rootFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    const total = await this.maintenanceFeeModel.countDocuments(rootFilter).exec();
    
    this.logger.log(`${this.FIND_ALL_MAINTENANCE_FEE} - By Feed Type - OUT`);
    return this.createPaginatedResponse(maintenanceFees, total, page, limit);
  }

  /**
   * Validar ObjectId de MongoDB
   * @param id - ID a validar
   * @throws BadRequestException si el ID no es válido
   */
  private validateId(id: string) {
    if (!isValidObjectId(id)) {
      this.logger.error(ID_NOT_VALID(id));
      throw new BadRequestException(ID_NOT_VALID(id));
    }
  }

    
}
