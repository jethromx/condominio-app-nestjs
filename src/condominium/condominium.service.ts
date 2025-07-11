import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCondominiumDto } from './dto/create-condominium.dto';
import { UpdateCondominiumDto } from './dto/update-condominium.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Condominium } from './entities/condominium.entity';
import { ACTIVE, DELETED, ID_NOT_VALID, IN, OUT } from 'src/common/messages.const';
import { handleQuery } from 'src/common/helpers/handleQuery.helper';
import { DEFAULTS } from 'src/common/constants';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class CondominiumService {
  private readonly logger = new Logger(CondominiumService.name);

  private readonly CREATE_CONDOMINIUM = 'CREATE_CONDOMINIUM';
  private readonly UPDATE_CONDOMINIUM = 'UPDATE_CONDOMINIUM';
  private readonly DELETE_CONDOMINIUM = 'DELETE_CONDOMINIUM';
  private readonly FIND_ALL_CONDOMINIUM = 'FIND_ALL_CONDOMINIUM';
  private readonly FIND_CONDOMINIUM_BY_ID = 'FIND_CONDOMINIUM_BY_ID';


  constructor(
    @InjectModel(Condominium.name)
    private readonly condominiumModel: Model<Condominium>,
    private readonly usersService: UsersService,
  ) { }



  async create(createCondominiumDto: CreateCondominiumDto, userId: string) {
    this.logger.log(`${this.CREATE_CONDOMINIUM} - ${IN}`);

    this.validateId(userId);

    // Verificar duplicados por nombre y que se encuentre en estado activo
    await this.checkDuplicateName(createCondominiumDto.name);

    // Verificar si el ID del administrador es válido
    if (createCondominiumDto.adminId) {
      this.validateId(createCondominiumDto.adminId);

      const adminExists = await this.usersService.exists(createCondominiumDto.adminId);
      if (!adminExists) {
        const message = `Admin with id ${createCondominiumDto.adminId} not found`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }
    }

    try {
      this.logger.debug(`${this.CREATE_CONDOMINIUM} - Creating condominium with name: ${createCondominiumDto.name}`);
      
      // Crear un nuevo condominio usando create directamente (más eficiente)
      const condominium = await this.condominiumModel.create({
        ...createCondominiumDto,
        createdBy: userId,
        updatedBy: userId,
        status: ACTIVE, // Asegurar que se cree activo
      });

      this.logger.log(`${this.CREATE_CONDOMINIUM} - ${OUT}`);
      return condominium;

    } catch (error) {
      this.logger.error(`${this.CREATE_CONDOMINIUM} - Error: ${error.message}`, error.stack);
      
      // Manejo específico de errores de MongoDB
      if (error.code === 11000) {
        throw new BadRequestException('Condominium with this name already exists');
      }
      
      throw new BadRequestException('Error creating condominium');
    }
  }

  async findAll(_query: any) {
    this.logger.log(`${this.FIND_ALL_CONDOMINIUM} - ${IN}`);

    const { paginationDto, q } = handleQuery(_query);
    const { limit = DEFAULTS.LIMIT, page = DEFAULTS.PAGE } = paginationDto;

    // Validar parámetros de paginación
    if (limit <= 0 || page <= 0) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    // Calcular el número de documentos a omitir para la paginación
    const skip = (page - 1) * limit;

    const rootFilter = {
      status: ACTIVE,
    };

    try {
      this.logger.debug(`${this.FIND_ALL_CONDOMINIUM} - Finding condominiums with pagination: page=${page}, limit=${limit}`);

      const query = this.condominiumModel.find(rootFilter);

      // Agregar la cláusula where si `q` existe
      if (q) {
        query.where(q);
      }

      // Ejecutar la consulta con paginación, orden y población de campos relacionados
      const condominiums = await query
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('adminId', 'fullName email') // Poblar información del admin
        .lean() // Mejor rendimiento al devolver objetos planos
        .exec();

      this.logger.debug(`${this.FIND_ALL_CONDOMINIUM} - Found ${condominiums.length} condominiums`);
      
      // Contar documentos con el mismo filtro
      const total = await this.condominiumModel.countDocuments(rootFilter).exec();
      const totalPages = Math.ceil(total / limit);

      this.logger.log(`${this.FIND_ALL_CONDOMINIUM} - ${OUT}`);
      return {
        data: condominiums,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    } catch (error) {
      this.logger.error(`${this.FIND_ALL_CONDOMINIUM} - Error: ${error.message}`, error.stack);
      throw new BadRequestException('Error fetching condominiums');
    }
  }



  async findOne(id: string) {
    this.logger.log(`${this.FIND_CONDOMINIUM_BY_ID} - ${IN}`);

    this.validateId(id);

    try {
      this.logger.debug(`${this.FIND_CONDOMINIUM_BY_ID} - Finding condominium with id: ${id}`);
      
      const condominium = await this.condominiumModel
        .findOne({ _id: id, status: ACTIVE })
        .populate('adminId', 'fullName email phone') // Poblar información completa del admin
        .exec();
        
      if (!condominium) {
        const message = `Condominium with id ${id} and status ACTIVE not found`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }
      
      this.logger.log(`${this.FIND_CONDOMINIUM_BY_ID} - ${OUT}`);
      return condominium;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      this.logger.error(`${this.FIND_CONDOMINIUM_BY_ID} - Error: ${error.message}`, error.stack);
      throw new BadRequestException('Error finding condominium');
    }
  }



  async update(id: string, updateCondominiumDto: UpdateCondominiumDto, userId: string) {
    this.logger.log(`${this.UPDATE_CONDOMINIUM} - ${IN}`);

    this.validateId(userId);
    this.validateId(id);

    // Verificar si el condominio existe y está activo por ID, reusando el método findOne
    // Si no existe, lanzará una excepción NotFoundException
    await this.findOne(id);

    // Verificar si se está actualizando el adminId
    if ('adminId' in updateCondominiumDto && updateCondominiumDto.adminId) {
      this.validateId(updateCondominiumDto.adminId as string);
      
      const adminExists = await this.usersService.exists(updateCondominiumDto.adminId as string);
      if (!adminExists) {
        const message = `Admin with id ${updateCondominiumDto.adminId} not found`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }
    }

    if ('name' in updateCondominiumDto && updateCondominiumDto.name) {
      // Verificar duplicados por nombre y que se encuentre en estado activo
      // Excluir el ID del condominio que se está actualizando
      // para evitar la coincidencia consigo mismo
      this.logger.debug(`${this.UPDATE_CONDOMINIUM} - Checking for duplicate name: ${updateCondominiumDto.name}`);
      await this.checkDuplicateName(updateCondominiumDto.name as string, id);
    }

    try {
      // Actualizar el condominio
      this.logger.debug(`${this.UPDATE_CONDOMINIUM} - Updating condominium with id: ${id}`);
      
      const condominiumUpdated = await this.condominiumModel
        .findByIdAndUpdate(
          id,
          { ...updateCondominiumDto, updatedBy: userId },
          { new: true, runValidators: true }
        )
        .populate('adminId', 'fullName email phone')
        .exec();

      if (!condominiumUpdated) {
        throw new NotFoundException(`Condominium with id ${id} not found`);
      }

      this.logger.log(`${this.UPDATE_CONDOMINIUM} - ${OUT}`);
      return condominiumUpdated;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`${this.UPDATE_CONDOMINIUM} - Error: ${error.message}`, error.stack);
      
      // Manejo específico de errores de MongoDB
      if (error.code === 11000) {
        throw new BadRequestException('Condominium with this name already exists');
      }
      
      throw new BadRequestException('Error updating condominium');
    }
  }


  async remove(id: string) {
    this.logger.log(`${this.DELETE_CONDOMINIUM} - ${IN}`);

    this.validateId(id);
    // Verificar si el condominio existe y está activo por ID, reusando el método findOne
    // Si no existe, lanzará una excepción NotFoundException
    const condominium = await this.findOne(id);

    condominium.status = DELETED;
    await condominium.save();

    this.logger.log(`${this.DELETE_CONDOMINIUM} - ${OUT}`);
    return condominium;

  }


  // Método reutilizable para verificar si un condominio con el mismo nombre ya existe
  private async checkDuplicateName(name: string, idToExclude?: string): Promise<void> {
    this.logger.log(`CHECKDUPLICATENAME - Checking for duplicate name: ${name} - IN`);
    
    if (!name || name.trim().length === 0) {
      throw new BadRequestException('Name cannot be empty');
    }

    try {
      const filter: any = { 
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') }, // Case insensitive
        status: ACTIVE 
      };

      if (idToExclude) {
        filter._id = { $ne: idToExclude };
      }

      const existingCondominium = await this.condominiumModel.findOne(filter).exec();

      if (existingCondominium) {
        const message = `Condominium with name '${name}' and status ACTIVE already exists`;
        this.logger.error(message);
        throw new BadRequestException(message);
      }

      this.logger.log(`CHECKDUPLICATENAME - No duplicate found for name: ${name} - OUT`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      this.logger.error(`CHECKDUPLICATENAME - Error: ${error.message}`);
      throw new BadRequestException('Error checking duplicate name');
    }
  }

  private validateId(id: string) {
    if (!isValidObjectId(id)) {
      this.logger.error(ID_NOT_VALID(id));
      throw new BadRequestException(ID_NOT_VALID(id));
    }
  }

  // Métodos de utilidad adicionales
  async exists(id: string): Promise<boolean> {
    this.logger.log('exists - IN');
    this.validateId(id);
    
    try {
      const exists = await this.condominiumModel.exists({ _id: id, status: ACTIVE });
      this.logger.log('exists - OUT');
      return !!exists;
    } catch (error) {
      this.logger.error(`exists - Error: ${error.message}`);
      return false;
    }
  }

  async findByName(name: string): Promise<Condominium | null> {
    this.logger.log('findByName - IN');
    
    try {
      const condominium = await this.condominiumModel
        .findOne({ name, status: ACTIVE })
        .populate('adminId', 'fullName email')
        .lean();
      
      this.logger.log('findByName - OUT');
      return condominium;
    } catch (error) {
      this.logger.error(`findByName - Error: ${error.message}`);
      return null;
    }
  }

  async countActive(): Promise<number> {
    this.logger.log('countActive - IN');
    
    try {
      const count = await this.condominiumModel.countDocuments({ status: ACTIVE });
      this.logger.log('countActive - OUT');
      return count;
    } catch (error) {
      this.logger.error(`countActive - Error: ${error.message}`);
      return 0;
    }
  }

  async findByAdmin(adminId: string): Promise<Condominium[]> {
    this.logger.log('findByAdmin - IN');
    this.validateId(adminId);
    
    try {
      const condominiums = await this.condominiumModel
        .find({ adminId, status: ACTIVE })
        .populate('adminId', 'fullName email')
        .sort({ createdAt: -1 })
        .lean();
      
      this.logger.log('findByAdmin - OUT');
      return condominiums;
    } catch (error) {
      this.logger.error(`findByAdmin - Error: ${error.message}`);
      throw new BadRequestException('Error finding condominiums by admin');
    }
  }

  async bulkUpdateStatus(ids: string[], status: string, userId: string): Promise<{ modifiedCount: number }> {
    this.logger.log('bulkUpdateStatus - IN');
    
    // Validar todos los IDs
    ids.forEach(id => this.validateId(id));
    this.validateId(userId);
    
    try {
      const result = await this.condominiumModel.updateMany(
        { _id: { $in: ids }, status: ACTIVE },
        { status, updatedBy: userId }
      );
      
      this.logger.log('bulkUpdateStatus - OUT');
      return { modifiedCount: result.modifiedCount };
    } catch (error) {
      this.logger.error(`bulkUpdateStatus - Error: ${error.message}`);
      throw new BadRequestException('Error updating condominiums status');
    }
  }

  async getStatistics(): Promise<{
    total: number;
    active: number;
    deleted: number;
    byStatus: Record<string, number>;
  }> {
    this.logger.log('getStatistics - IN');
    
    try {
      const [total, active, deleted, statusStats] = await Promise.all([
        this.condominiumModel.countDocuments(),
        this.condominiumModel.countDocuments({ status: ACTIVE }),
        this.condominiumModel.countDocuments({ status: DELETED }),
        this.condominiumModel.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ])
      ]);

      const byStatus = statusStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});

      this.logger.log('getStatistics - OUT');
      return {
        total,
        active,
        deleted,
        byStatus
      };
    } catch (error) {
      this.logger.error(`getStatistics - Error: ${error.message}`);
      throw new BadRequestException('Error getting condominium statistics');
    }
  }
}
