import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMaintenanceFeeDto } from './dto/create-maintenance_fee.dto';
import { UpdateMaintenanceFeeDto } from './dto/update-maintenance_fee.dto';
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MaintenanceFee } from './entities/maintenance_fee.entity';
import { ACTIVE, DELETED, ID_NOT_VALID } from 'src/common/messages.const';
import { CondominiumService } from 'src/condominium/condominium.service';
import { PaginationDTO } from 'src/common/dto/Pagination.dto';
import { isValidUUIDv4 } from 'src/common/helpers/validateUUID';


@Injectable()
export class MaintenanceFeesService {
  private readonly logger = new Logger(MaintenanceFeesService.name);
  private readonly CREATE_MAINTENANCE_FEE = 'CREATE_MAINTENANCE_FEE';
  private readonly UPDATE_MAINTENANCE_FEE = 'UPDATE_MAINTENANCE_FEE';
  private readonly DELETE_MAINTENANCE_FEE = 'DELETE_MAINTENANCE_FEE';
  private readonly FIND_ALL_MAINTENANCE_FEE = 'FIND_ALL_MAINTENANCE_FEE';
  private readonly FIND_MAINTENANCE_FEE_BY_ID = 'FIND_MAINTENANCE_FEE_BY_ID';

  constructor(
     @InjectModel(MaintenanceFee.name)
     private readonly maintenanceFeeModel: Model<MaintenanceFee>,
     private readonly condominiumService: CondominiumService,

  ) {}


  async create(condominiumId:string,createMaintenanceFeeDto: CreateMaintenanceFeeDto,userId:string) {
    this.logger.log(`${this.CREATE_MAINTENANCE_FEE} - IN`);

    this.validateId(userId);

    // Verificar si el condominio existe
    await this.condominiumService.findOne(condominiumId);

    if(createMaintenanceFeeDto.detail){
      // Verificar si la cuota de mantenimiento ya existe
      const existingMaintenanceFee = await this.maintenanceFeeModel.findOne({ detail: createMaintenanceFeeDto.detail ,status: ACTIVE}).exec();
      if (existingMaintenanceFee) {
        this.logger.error(`${this.CREATE_MAINTENANCE_FEE} - Maintenance fee with detail "${createMaintenanceFeeDto.detail}" already exists`);
        throw new NotFoundException(`Maintenance fee with detail ${createMaintenanceFeeDto.detail} already exists`);
      }
    }

    // Crear un nuevo mantenimiento
    const maintenanceFee = new this.maintenanceFeeModel({
      _id: uuidv4(),
      condominiumId: condominiumId,     
      createdBy: userId,
      updatedBy: userId,

      ...createMaintenanceFeeDto,
    });

    await maintenanceFee.save();
    this.logger.log(`${this.CREATE_MAINTENANCE_FEE} - OUT`);
    return maintenanceFee;

  }

  async findAll(paginationDto: PaginationDTO,condominiumId:string ) {
    this.logger.log(`${this.FIND_ALL_MAINTENANCE_FEE} - IN`);

    this.validateId(condominiumId);
    // Verificar si el condominio existe
    await this.condominiumService.findOne(condominiumId);

    const rootFilter = { status: ACTIVE, condominiumId: condominiumId }

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

    if(!maintenanceFees){
      this.logger.error(`${this.FIND_ALL_MAINTENANCE_FEE} - No maintenance fees found`);
      throw new NotFoundException(`No maintenance fees found`);
    }

    // Contar el total de documentos
    const total = await this.maintenanceFeeModel.countDocuments(rootFilter).exec();
    this.logger.log(`${this.FIND_ALL_MAINTENANCE_FEE} - OUT`);
    return {
        total,
        page,
        limit,
        data: maintenanceFees,
      };
    
  }



  async findOne(condominiumId:string,id: string) {
    this.logger.log(`${this.FIND_MAINTENANCE_FEE_BY_ID} - IN`);

    this.validateId(condominiumId);
    this.validateId(id);

    // Verificar si el condominio existe
      await this.condominiumService.findOne(condominiumId);

    //await this.findOne(condominiumId,id);

    const maintenanceFee = await this.maintenanceFeeModel.findOne({ _id: id, status:ACTIVE }).exec();
    if (!maintenanceFee) {
      throw new NotFoundException(`Maintenance fee with id ${id} not found`);
    }
    this.logger.log(`${this.FIND_MAINTENANCE_FEE_BY_ID} - OUT`);
    return maintenanceFee;
  }




  async update(condominiumId:string,id: string, updateMaintenanceFeeDto: UpdateMaintenanceFeeDto,userId:string) {
    this.logger.log(`${this.UPDATE_MAINTENANCE_FEE} - IN`);

    this.validateId(userId);
    this.validateId(condominiumId);
    this.validateId(id);

    // Verificar si el condominio existe
    await this.condominiumService.findOne(condominiumId);
    // Verificar si la cuota de mantenimiento existe
    await this.findOne(condominiumId,id);


    const maintenanceFee = await this.maintenanceFeeModel.findByIdAndUpdate(id, updateMaintenanceFeeDto, { new: true }).exec();
    if (!maintenanceFee) {
      throw new NotFoundException(`Maintenance fee with id ${id} not found`);
    }
    this.logger.log(`${this.UPDATE_MAINTENANCE_FEE} - OUT`);
    return maintenanceFee;
  }




  async remove(condominiumId:string,id: string) {
    this.logger.log(`${this.DELETE_MAINTENANCE_FEE} - IN`);

    this.validateId(condominiumId);
    this.validateId(id);

    // Verificar si el condominio existe
    await this.condominiumService.findOne(condominiumId);

    await this.findOne(condominiumId,id);

    const maintenanceFee = await this.maintenanceFeeModel.findOne({ _id: id, status:ACTIVE }).exec();
    if (!maintenanceFee) {
      throw new NotFoundException(`Maintenance fee with id ${id} not found`);
    }
    // Cambiar el estado a DELETED
    maintenanceFee.status = DELETED;
    await maintenanceFee.save();
    this.logger.log(`${this.DELETE_MAINTENANCE_FEE} - OUT`);
    return maintenanceFee
  }

  private validateId(id: string) {
      if (!isValidUUIDv4(id)) {
        this.logger.error(ID_NOT_VALID(id));
        throw new BadRequestException(ID_NOT_VALID(id));
      }
    }
}
