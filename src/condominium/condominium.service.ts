import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateCondominiumDto } from './dto/create-condominium.dto';
import { UpdateCondominiumDto } from './dto/update-condominium.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Condominium } from './entities/condominium.entity';
import { ACTIVE, DELETED, ID_NOT_VALID, IN, OUT } from 'src/common/messages.const';
import { v4 as uuidv4 } from 'uuid';
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

      const adminExists = await this.usersService.findOne(createCondominiumDto.adminId);
      if (!adminExists) {
        const message = `Admin with id ${createCondominiumDto.adminId} not found`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }
    }

    try {

      this.logger.debug(`${this.CREATE_CONDOMINIUM} - Condominium with name: ${createCondominiumDto.name}`);
      // Crear un nuevo condominio
      const condominium = new this.condominiumModel({
        ...createCondominiumDto,
        createdBy: userId,
        updatedBy: userId,
      });

      this.logger.debug(`${this.CREATE_CONDOMINIUM} - Saving condominium`);
      await condominium.save();

      this.logger.log(`${this.CREATE_CONDOMINIUM} - ${OUT}`);
      return condominium;

    } catch (error) {
      this.logger.error(`${this.CREATE_CONDOMINIUM} - Error: ${error.message}`);
      throw new BadRequestException('Error creating condominium');
    }

  }

  async findAll(_query: any) {
    this.logger.log(`${this.FIND_ALL_CONDOMINIUM} - ${IN}`);

    const { paginationDto, q } = handleQuery(_query);
    const { limit = DEFAULTS.LIMIT, page = DEFAULTS.PAGE } = paginationDto;

    // Calcular el número de documentos a omitir
    // para la paginación
    const skip = (page - 1) * limit;

    const rootFilter = {
      status: ACTIVE,
    }

    try {
      // Construir la consulta base
      this.logger.debug(`${this.FIND_ALL_CONDOMINIUM} - Finding all condominiums`);

      const query = this.condominiumModel.find(rootFilter);

      // Agregar la cláusula where si `q` existe
      if (q) {
        query.where(q);
      }

      // Ejecutar la consulta con paginación y orden
      const condominiums = await query
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean() // Mejor rendimiento al devolver objetos planos
        .exec();

      this.logger.debug(`${this.FIND_ALL_CONDOMINIUM} - Found ${condominiums.length} condominiums`);
      const total = await this.condominiumModel.countDocuments(rootFilter).exec();

      this.logger.log(`${this.FIND_ALL_CONDOMINIUM} - ${OUT}`);
      return {
        data: condominiums,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      this.logger.error(`${this.FIND_ALL_CONDOMINIUM} - Error: ${error.message}`);
      throw new BadRequestException('Error fetching condominiums');
    }
  }



  async findOne(id: string) {
    this.logger.log(`${this.FIND_CONDOMINIUM_BY_ID} - ${IN}`);

    this.validateId(id);    

    // Verificar si el condominio existe y está activo
    this.logger.debug(`${this.FIND_CONDOMINIUM_BY_ID} - Finding condominium with id: ${id}`);
    const condominium = await this.condominiumModel.findOne({ _id: id, status: ACTIVE }).exec();
    if (!condominium) {
      const message = `Condominium with id ${id} and status ACTIVE not found`;
      this.logger.error(message);
      throw new NotFoundException(message);
    }
    this.logger.log(`${this.FIND_CONDOMINIUM_BY_ID} - ${OUT}`);
    return condominium;
  }



  async update(id: string, updateCondominiumDto: UpdateCondominiumDto, userId: string) {
    this.logger.log(`${this.UPDATE_CONDOMINIUM} - ${IN}`);

    this.validateId(userId);
    this.validateId(id);

    // Verificar si el condominio existe y está activo por ID, reusando el método findOne
    // Si no existe, lanzará una excepción NotFoundException
    await this.findOne(id);

    if (updateCondominiumDto.name) {
      // Verificar duplicados por nombre y que se encuentre en estado activo
      // Excluir el ID del condominio que se está actualizando
      // para evitar la coincidencia consigo mismo
      this.logger.debug(`${this.UPDATE_CONDOMINIUM} - Checking for duplicate name: ${updateCondominiumDto.name}`);
      await this.checkDuplicateName(updateCondominiumDto.name, id);
    }

    // Actualizar el condominio
    this.logger.debug(`${this.UPDATE_CONDOMINIUM} - Updating condominium with id: ${id}`);
    const condominiumUpdated = await this.condominiumModel.findByIdAndUpdate(
      id,
      { ...updateCondominiumDto, updatedBy: userId },
      { new: true },
    ).exec();

    this.logger.log(`${this.UPDATE_CONDOMINIUM} - ${OUT}`);
    return condominiumUpdated;

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

    this.logger.log(`CHECKDUPLICATENAME - Checking for duplicate name: ${name} IN `);
    // Verificar si el condominio ya existe
    const existingCondominium = await this.condominiumModel.findOne({ name, status: ACTIVE }).exec();

    if (existingCondominium && (!idToExclude || existingCondominium._id.toString() !== idToExclude)) {
      const message = `Condominium with name ${name} and status ACTIVE already exists`;
      this.logger.error(message);
      throw new BadRequestException(message);
    }

    this.logger.log(`CHECKDUPLICATENAME - No duplicate found for name: ${name} OUT`);
  }

  private validateId(id: string) {
    if (!isValidObjectId(id)) {
      this.logger.error(ID_NOT_VALID(id));
      throw new BadRequestException(ID_NOT_VALID(id));
    }
  }
}
