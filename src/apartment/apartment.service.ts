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

  private readonly CREATE_APARTMENT = 'CREATE_APARTMENT';
  private readonly UPDATE_APARTMENT = 'UPDATE_APARTMENT';
  private readonly DELETE_APARTMENT = 'DELETE_APARTMENT';
  private readonly FIND_ALL_APARTMENT = 'FIND_ALL_APARTMENT';
  private readonly FIND_APARTMENT_BY_ID = 'FIND_APARTMENT_BY_ID';
  private readonly FIND_APARTMENT_BY_CONDOMINIUM = 'FIND_APARTMENT_BY_CONDOMINIUM';

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


    if (createApartmentDto.name) {
      // Verificar si el apartamento ya existe
      this.logger.debug(`${this.CREATE_APARTMENT} - Finding Apartment with name: ${createApartmentDto.name}`);
      const existingApartment = await this.apartmentModel.findOne({ name: createApartmentDto.name ,status: ACTIVE}).exec();
      if (existingApartment) {
        this.logger.error(`${this.CREATE_APARTMENT} - Apartment with name "${createApartmentDto.name}" already exists`);
        throw new BadRequestException(`Apartment with name ${createApartmentDto.name} already exists`);
      }
      
    }

    // Verifica si el ID del propietario es válido
    if(createApartmentDto.ownerId){
      this.validateId(createApartmentDto.ownerId);
      this.logger.log(`${this.CREATE_APARTMENT} - Finding Owner with id: ${createApartmentDto.ownerId}`);
      // Verificar si el propietario existe
      const adminExists = await this.usersService.findOne(createApartmentDto.ownerId);
      if (!adminExists) {
        const message = `Admin with id ${createApartmentDto.ownerId} not found`;
        this.logger.error(message);
        throw new NotFoundException(message);
      }
    }



    this.logger.debug(`${this.CREATE_APARTMENT} - Creating Apartment with name: ${createApartmentDto.name}`);
    // Crear el apartamento
    const apartment = await this.apartmentModel.create({
     
      ...createApartmentDto,
      condominiumId: condominiumId,
      createdBy: userId,
      updatedBy: userId,
    });
    apartment.save();
    this.logger.debug(`${this.CREATE_APARTMENT} - OUT`);
    return apartment;
  }


  async findAll(paginationDto: PaginationDTO, idCondominium: string) {
    this.logger.debug(`${this.FIND_ALL_APARTMENT} - IN`);

    this.logger.debug(`${this.FIND_ALL_APARTMENT} - Finding Condominium with id: ${idCondominium}`);
    await this.condominiumService.findOne(idCondominium);

    const { page = 1, limit = 10 } = paginationDto;
    const rootFilter= { status: ACTIVE };
    // Calcular el número de documentos a omitir
    const skip = (page - 1) * limit;

    this.logger.debug(`${this.FIND_ALL_APARTMENT} - Finding all apartments with pagination: page ${page}, limit ${limit}`);
    // Obtener los apartamentos con paginación
    const apartments = await this.apartmentModel
      .find(rootFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() // Mejor rendimiento al devolver objetos planos
      .exec();

    this.logger.debug(`${this.FIND_ALL_APARTMENT} -Counting Apartments found: `);
    const total = await this.apartmentModel.countDocuments({rootFilter}).exec();

    if (!apartments) {
        this.logger.error(`${this.FIND_ALL_APARTMENT} - No apartments found`);
        throw new NotFoundException(`No apartments found`);
      }

    this.logger.debug(`${this.FIND_ALL_APARTMENT} - OUT`);
    return {
      data: apartments,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findAllApartmentsByCondominium(paginationDto: PaginationDTO,idCondominium: string) {
    this.logger.log(`${this.FIND_APARTMENT_BY_CONDOMINIUM} - IN`);

    this.logger.debug(`${this.FIND_APARTMENT_BY_CONDOMINIUM} - Finding Condominium with id: ${idCondominium}`);
    await this.condominiumService.findOne(idCondominium);

    const { page = 1, limit = 10 } = paginationDto;
    // Calcular el número de documentos a omitir
    const skip = (page - 1) * limit;

    const rootFilter= { status: ACTIVE, condominiumId: idCondominium };
   
    // Obtener los apartamentos con paginación
    const apartments = await this.apartmentModel
      .find(rootFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean() // Mejor rendimiento al devolver objetos planos
      .exec();

    if (!apartments) {
        this.logger.error(`${this.FIND_APARTMENT_BY_CONDOMINIUM} - No apartments found`);
        throw new NotFoundException(`No apartments found`);
      }

 
    // Contar el total de documentos
    this.logger.debug(`${this.FIND_APARTMENT_BY_CONDOMINIUM} -Counting Apartments found: `);
    const total = await this.apartmentModel.countDocuments(rootFilter).exec();

    this.logger.log(`${this.FIND_ALL_APARTMENT} - OUT`);
    return {
      data: apartments,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    }
  }




  async findOne(id: string,idCondominium: string) {
    this.logger.log(`${this.FIND_APARTMENT_BY_ID} - IN`);

    this.logger.debug(`${this.FIND_APARTMENT_BY_ID} - Finding Condominium with id: ${idCondominium}`);
     // Verificar si el condominio existe
     await this.condominiumService.findOne(idCondominium);

     // Obtener el apartamento por ID
    const apartment = await this.apartmentModel.findOne({ _id: id, status:ACTIVE }).exec();
    if (!apartment) {
      this.logger.error(`${this.FIND_APARTMENT_BY_ID} - Apartment with ID "${id}" not found`);
      throw new NotFoundException(`Apartment with ID ${id} not found`);
    }

    if(idCondominium !== apartment.condominiumId._id.toString()){
      this.logger.error(`${this.FIND_APARTMENT_BY_ID} - Apartment with ID "${id}" not found in condominium "${idCondominium}"`);
      throw new NotFoundException(`Apartment with ID ${id} not found in condominium ${idCondominium}`);
    }

    this.logger.log(`${this.FIND_APARTMENT_BY_ID} - OUT`);
    return apartment;

  }




  async findOneByIdandIdCondominium(id: string,idCondominium: string) {
    this.logger.log(`${this.FIND_APARTMENT_BY_ID} - IN`);

    // Obtener el apartamento por ID
    this.logger.debug(`${this.FIND_APARTMENT_BY_ID} - Finding Apartment with id: ${id}`);
    const apartment = await this.findOne(id,idCondominium);


    this.logger.log(`${this.FIND_APARTMENT_BY_ID} - OUT`);
    return apartment;

  }

  async update(id: string, updateApartmentDto: UpdateApartmentDto, userId: string, condominiumId: string) {
    this.logger.log(`${this.UPDATE_APARTMENT} - IN`);

    this.logger.log(`${this.UPDATE_APARTMENT} - Finding Condominium with id: ${condominiumId}`);
    const apartment = await this.findOne(id,condominiumId);


    // Verificar si el apartamento existe con el mismo nombre dentro del mismo condominio
    if (updateApartmentDto.name) {
      const existingApartment = await this.apartmentModel.findOne({ name: updateApartmentDto.name, status:ACTIVE, condominiumId :apartment.condominiumId }).exec();
      if (existingApartment && existingApartment._id.toString() !== id) {
        this.logger.error(`${this.UPDATE_APARTMENT} - Apartment with name "${updateApartmentDto.name}" already exists`);
        throw new BadRequestException(`Apartment with name ${updateApartmentDto.name} already exists`);
      }
    }

    // Actualizar el apartamento
    const apartmentUpdated = await this.apartmentModel.findByIdAndUpdate(id, {
      ...updateApartmentDto,
      updatedBy: userId,
    });

    if (!apartmentUpdated) {
      this.logger.error(`${this.UPDATE_APARTMENT} - Apartment with ID "${id}" not found`);
      throw new NotFoundException(`Apartment with ID ${id} not found`);
    }
    this.logger.log(`${this.UPDATE_APARTMENT} - OUT`);
    return apartmentUpdated;


  }

  async remove(id: string, condominiumId: string) {
    this.logger.debug(`${this.DELETE_APARTMENT} - IN`);
    // Eliminar el apartamento por ID

    this.logger.debug(`${this.DELETE_APARTMENT} - Finding Condominium with id: ${condominiumId}`);
    const apartment =  await this.findOne(id,condominiumId);
    
    apartment.status = DELETED;
    await apartment.save();
    this.logger.debug(`${this.DELETE_APARTMENT} - OUT`);
    return apartment;

  }

  private validateId(id: string) {
      if (!isValidObjectId(id)) {
        this.logger.error(ID_NOT_VALID(id));
        throw new BadRequestException(ID_NOT_VALID(id));
      }
  }
}
