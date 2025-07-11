import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateApartmentDto } from './dto/create-apartment.dto';
import { UpdateApartmentDto } from './dto/update-apartment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CondominiumService } from 'src/condominium/condominium.service';
import { Apartment } from './entities/apartment.entity';
import { v4 as uuidv4 } from 'uuid';
import { ACTIVE, DELETED, ID_NOT_VALID } from 'src/common/messages.const';
import { PaginationDTO } from 'src/common/dto/Pagination.dto';
import { isValidUUIDv4 } from 'src/common/helpers/validateUUID';
import { UsersService } from 'src/users/users.service';


@Injectable()
export class ApartmentService {
  private readonly logger = new Logger(ApartmentService.name);

  // Constantes para logging
  private readonly CREATE_APARTMENT = 'CREATE_APARTMENT';
  private readonly UPDATE_APARTMENT = 'UPDATE_APARTMENT';
  private readonly DELETE_APARTMENT = 'DELETE_APARTMENT';
  private readonly FIND_ALL_APARTMENT = 'FIND_ALL_APARTMENT';
  private readonly FIND_APARTMENT_BY_ID = 'FIND_APARTMENT_BY_ID';
  private readonly FIND_APARTMENT_BY_CONDOMINIUM = 'FIND_APARTMENT_BY_CONDOMINIUM';

  // Constantes para mensajes de error
  private readonly APARTMENT_NOT_FOUND = 'Apartment not found';
  private readonly APARTMENT_ALREADY_EXISTS = 'Apartment already exists';
  private readonly OWNER_NOT_FOUND = 'Owner not found';
  private readonly FAILED_TO_CREATE = 'Failed to create apartment';
  private readonly FAILED_TO_UPDATE = 'Failed to update apartment';
  private readonly FAILED_TO_DELETE = 'Failed to delete apartment';


  constructor(
    @InjectModel(Apartment.name)
    private readonly apartmentModel: Model<Apartment>,
    private readonly condominiumService: CondominiumService,
    private readonly usersService: UsersService,
  ) { }



  async create(createApartmentDto: CreateApartmentDto, userId: string, condominiumId: string) {
    this.logger.log(`${this.CREATE_APARTMENT} - IN`);

    this.validateId(userId);
    this.validateId(condominiumId);

    // Verificar si el condominio existe
    // Si el condominio no existe, se lanzará una excepción
    this.logger.debug(`${this.CREATE_APARTMENT} - Finding Condominium with id: ${condominiumId}`);
    await this.condominiumService.findOne(condominiumId);


    // Verificar si el apartamento ya existe en el condominio
    if (createApartmentDto.name) {
      this.logger.debug(`${this.CREATE_APARTMENT} - Finding Apartment with name: ${createApartmentDto.name} in condominium: ${condominiumId}`);
      const existingApartment = await this.apartmentModel.findOne({ 
        name: createApartmentDto.name,
        condominiumId: condominiumId,
        status: ACTIVE 
      }).exec();
      
      if (existingApartment) {
        this.logger.error(`${this.CREATE_APARTMENT} - ${this.APARTMENT_ALREADY_EXISTS}: "${createApartmentDto.name}" in condominium`);
        throw new BadRequestException(`${this.APARTMENT_ALREADY_EXISTS} with name ${createApartmentDto.name} in this condominium`);
      }
    }

    // Verificar si el ID del propietario es válido
    if (createApartmentDto.ownerId) {
      this.validateId(createApartmentDto.ownerId);
      this.logger.debug(`${this.CREATE_APARTMENT} - Finding Owner with id: ${createApartmentDto.ownerId}`);
      
      // Verificar si el propietario existe
      const ownerExists = await this.usersService.findOne(createApartmentDto.ownerId);
      if (!ownerExists) {
        const message = `${this.OWNER_NOT_FOUND} with id ${createApartmentDto.ownerId}`;
        this.logger.error(`${this.CREATE_APARTMENT} - ${message}`);
        throw new NotFoundException(message);
      }
    }



    // Crear el apartamento
    this.logger.debug(`${this.CREATE_APARTMENT} - Creating Apartment with name: ${createApartmentDto.name}`);
    const apartment = await this.apartmentModel.create({
      ...createApartmentDto,
      condominiumId: condominiumId,
      createdBy: userId,
      updatedBy: userId,
    });
    
    this.logger.log(`${this.CREATE_APARTMENT} - OUT`);
    return apartment;
  }


  async findAll(paginationDto: PaginationDTO, idCondominium: string) {
    this.logger.log(`${this.FIND_ALL_APARTMENT} - IN`);
    
    // Validar ID del condominio
    this.validateId(idCondominium);

    this.logger.debug(`${this.FIND_ALL_APARTMENT} - Finding Condominium with id: ${idCondominium}`);
    await this.condominiumService.findOne(idCondominium);

    // Validar y obtener parámetros de paginación
    const { page, limit, skip } = this.validatePagination(paginationDto);
    const rootFilter = { status: ACTIVE };
    
    this.logger.debug(`${this.FIND_ALL_APARTMENT} - Finding all apartments with pagination: page ${page}, limit ${limit}`);
    
    // Obtener los apartamentos con paginación
    const apartments = await this.apartmentModel
      .find(rootFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() // Mejor rendimiento al devolver objetos planos
      .exec();

    this.logger.debug(`${this.FIND_ALL_APARTMENT} - Counting Apartments found`);
    const total = await this.apartmentModel.countDocuments(rootFilter).exec();

    this.logger.log(`${this.FIND_ALL_APARTMENT} - OUT`);
    return this.createPaginatedResponse(apartments, page, limit, total);
  }

  async findAllApartmentsByCondominium(paginationDto: PaginationDTO, idCondominium: string) {
    this.logger.log(`${this.FIND_APARTMENT_BY_CONDOMINIUM} - IN`);
    
    // Validar ID del condominio
    this.validateId(idCondominium);

    this.logger.debug(`${this.FIND_APARTMENT_BY_CONDOMINIUM} - Finding Condominium with id: ${idCondominium}`);
    await this.condominiumService.findOne(idCondominium);

    // Validar y obtener parámetros de paginación
    const { page, limit, skip } = this.validatePagination(paginationDto);
    const rootFilter = { status: ACTIVE, condominiumId: idCondominium };
   
    this.logger.debug(`${this.FIND_APARTMENT_BY_CONDOMINIUM} - Finding apartments with pagination: page ${page}, limit ${limit}`);
    
    // Obtener los apartamentos con paginación
    const apartments = await this.apartmentModel
      .find(rootFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() // Mejor rendimiento al devolver objetos planos
      .exec();

    // Contar el total de documentos
    this.logger.debug(`${this.FIND_APARTMENT_BY_CONDOMINIUM} - Counting Apartments found`);
    const total = await this.apartmentModel.countDocuments(rootFilter).exec();

    this.logger.log(`${this.FIND_APARTMENT_BY_CONDOMINIUM} - OUT`);
    return this.createPaginatedResponse(apartments, page, limit, total);
  }




  async findOne(id: string, idCondominium: string) {
    this.logger.log(`${this.FIND_APARTMENT_BY_ID} - IN`);
    
    // Validar IDs
    this.validateId(id);
    this.validateId(idCondominium);

    this.logger.debug(`${this.FIND_APARTMENT_BY_ID} - Finding Condominium with id: ${idCondominium}`);
    // Verificar si el condominio existe
    await this.condominiumService.findOne(idCondominium);

    // Obtener el apartamento por ID y condominio en una sola consulta
    this.logger.debug(`${this.FIND_APARTMENT_BY_ID} - Finding Apartment with id: ${id} in condominium: ${idCondominium}`);
    const apartment = await this.apartmentModel.findOne({ 
      _id: id, 
      condominiumId: idCondominium,
      status: ACTIVE 
    }).exec();
    
    if (!apartment) {
      this.logger.error(`${this.FIND_APARTMENT_BY_ID} - ${this.APARTMENT_NOT_FOUND} with ID "${id}" in condominium "${idCondominium}"`);
      throw new NotFoundException(`${this.APARTMENT_NOT_FOUND} with ID ${id} in condominium ${idCondominium}`);
    }

    this.logger.log(`${this.FIND_APARTMENT_BY_ID} - OUT`);
    return apartment;
  }




 

  async update(id: string, updateApartmentDto: UpdateApartmentDto, userId: string, condominiumId: string) {
    this.logger.log(`${this.UPDATE_APARTMENT} - IN`);
    
    // Validar IDs
    this.validateId(id);
    this.validateId(userId);
    this.validateId(condominiumId);

    this.logger.debug(`${this.UPDATE_APARTMENT} - Finding apartment with id: ${id} in condominium: ${condominiumId}`);
    const apartment = await this.findOne(id, condominiumId);

    // Verificar si el apartamento existe con el mismo nombre dentro del mismo condominio
    if (updateApartmentDto.name && updateApartmentDto.name !== apartment.name) {
      this.logger.debug(`${this.UPDATE_APARTMENT} - Checking if apartment name "${updateApartmentDto.name}" already exists`);
      const existingApartment = await this.apartmentModel.findOne({ 
        name: updateApartmentDto.name, 
        status: ACTIVE, 
        condominiumId: condominiumId,
        _id: { $ne: id } // Excluir el apartamento actual
      }).exec();
      
      if (existingApartment) {
        this.logger.error(`${this.UPDATE_APARTMENT} - ${this.APARTMENT_ALREADY_EXISTS}: "${updateApartmentDto.name}" in condominium`);
        throw new BadRequestException(`${this.APARTMENT_ALREADY_EXISTS} with name ${updateApartmentDto.name} in this condominium`);
      }
    }

    // Verificar propietario si se está actualizando
    if (updateApartmentDto.ownerId) {
      this.validateId(updateApartmentDto.ownerId);
      this.logger.debug(`${this.UPDATE_APARTMENT} - Finding Owner with id: ${updateApartmentDto.ownerId}`);
      const ownerExists = await this.usersService.findOne(updateApartmentDto.ownerId);
      if (!ownerExists) {
        const message = `${this.OWNER_NOT_FOUND} with id ${updateApartmentDto.ownerId}`;
        this.logger.error(`${this.UPDATE_APARTMENT} - ${message}`);
        throw new NotFoundException(message);
      }
    }

    // Actualizar el apartamento
    this.logger.debug(`${this.UPDATE_APARTMENT} - Updating apartment with id: ${id}`);
    const apartmentUpdated = await this.apartmentModel.findByIdAndUpdate(
      id, 
      {
        ...updateApartmentDto,
        updatedBy: userId,
        updatedAt: new Date(),
      },
      { new: true } // Retornar el documento actualizado
    ).exec();

    if (!apartmentUpdated) {
      this.logger.error(`${this.UPDATE_APARTMENT} - ${this.FAILED_TO_UPDATE} with ID "${id}"`);
      throw new NotFoundException(`${this.FAILED_TO_UPDATE} with ID ${id}`);
    }
    
    this.logger.log(`${this.UPDATE_APARTMENT} - OUT`);
    return apartmentUpdated;
  }

  async remove(id: string, condominiumId: string) {
    this.logger.log(`${this.DELETE_APARTMENT} - IN`);
    
    // Validar IDs
    this.validateId(id);
    this.validateId(condominiumId);

    this.logger.debug(`${this.DELETE_APARTMENT} - Finding apartment with id: ${id} in condominium: ${condominiumId}`);
    const apartment = await this.findOne(id, condominiumId);
    
    // Soft delete
    this.logger.debug(`${this.DELETE_APARTMENT} - Soft deleting apartment with id: ${id}`);
    const deletedApartment = await this.apartmentModel.findByIdAndUpdate(
      id,
      { 
        status: DELETED,
        updatedAt: new Date()
      },
      { new: true }
    ).exec();

    if (!deletedApartment) {
      this.logger.error(`${this.DELETE_APARTMENT} - ${this.FAILED_TO_DELETE} with ID "${id}"`);
      throw new NotFoundException(`${this.FAILED_TO_DELETE} with ID ${id}`);
    }

    this.logger.log(`${this.DELETE_APARTMENT} - OUT`);
    return deletedApartment;
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
}
