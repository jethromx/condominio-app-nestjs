import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Catalog } from './entities/catalog.entity';
import { IN, OUT } from 'src/common/messages.const';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CatalogsService {
  private readonly logger = new Logger(CatalogsService.name);

  private readonly CREATE_CATALOG = 'CREATE_CATALOG';
  private readonly UPDATE_CATALOG = 'UPDATE_CATALOG';
  private readonly DELETE_CATALOG = 'DELETE_CATALOG';
  private readonly FIND_CATALOG = 'FIND_CATALOG';
  private readonly FIND_ALL_CATALOG = 'FIND_ALL_CATALOG';
  private readonly FIND_CATALOG_BY_ID = 'FIND_CATALOG_BY_ID';
  private readonly FIND_CATALOG_BY_NAME = 'FIND_CATALOG_BY_NAME';



  constructor(
    @InjectModel(Catalog.name)
    private readonly catalogModel: Model<Catalog>,
  ) { }


  async create(createCatalogDto: CreateCatalogDto, userId: string) {
    this.logger.debug(`${this.CREATE_CATALOG} - ${IN}`);

    // Verificar si el catálogo ya existe
    const existingCatalog = await this.catalogModel.findOne({ name: createCatalogDto.name }).exec();
    if (existingCatalog) {
      this.logger.error(`${this.CREATE_CATALOG} - Catalog with name "${createCatalogDto.name}" already exists`);
      //throw new Error(`Catalog with name "${createCatalogDto.name}" already exists`);
      throw new BadRequestException(`Catalog with name ${createCatalogDto.name} already exists`);
    }

    const catalog = await this.catalogModel.create({
      _id: uuidv4(),
      userId, // Pasar el userId al documento
      ...createCatalogDto,
      createdBy: userId,
      updatedBy: userId,
    });
    catalog.save();

    this.logger.debug(`${this.CREATE_CATALOG} - ${OUT}`);
    return catalog;

  }

  async findAll(page: number = 1, limit: number = 10) {
    this.logger.debug(`${this.FIND_ALL_CATALOG} - ${IN}`);

    // Calcular el número de documentos a omitir
    const skip = (page - 1) * limit;

    // Obtener los catálogos con paginación
    const catalogs = await this.catalogModel
    .find()
    .skip(skip)
    .limit(limit)
    .exec();

    // Contar el total de documentos
    const total = await this.catalogModel.countDocuments().exec();

    this.logger.debug(`${this.FIND_ALL_CATALOG} - ${OUT}`);
    return {
      data: catalogs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };


  }

  async findOne(id: string) {
    this.logger.debug(`${this.FIND_CATALOG_BY_ID} - ${IN}`);
    const catalog = await this.catalogModel.findById(id).exec();
    this.logger.debug(`${this.FIND_CATALOG_BY_ID} - ${OUT}`);
    return catalog;

  }

  async update(id: string, updateCatalogDto: UpdateCatalogDto, userId: string) {
    this.logger.debug(`${this.UPDATE_CATALOG} - ${IN}`);

    // Verificar si el nuevo nombre ya está en uso por otro catálogo
    if (updateCatalogDto.name) {
      const existingCatalog = await this.catalogModel.findOne({ name: updateCatalogDto.name }).exec();
      if (existingCatalog && existingCatalog._id.toString() !== id) {
        this.logger.error(`${this.UPDATE_CATALOG} - Catalog with name "${updateCatalogDto.name}" already exists`);
        throw new BadRequestException(`Catalog with name ${updateCatalogDto.name} already exists`);
      }
    }

    const updatedCatalog = await this.catalogModel.findByIdAndUpdate(
      id, 
      { ...updateCatalogDto, updatedBy: userId },
      { new: true }).exec();
    if (!updatedCatalog) {
      throw new BadRequestException(`Catalog with ID ${id} not found`);
    }

    this.logger.debug(`${this.UPDATE_CATALOG} - ${OUT}`);
    return updatedCatalog;

  }

  remove(id: string) {
    this.logger.debug(`${this.DELETE_CATALOG} - ${IN}`);
    const deletedCatalog = this.catalogModel.findByIdAndDelete(id).exec();
    if (!deletedCatalog) {
      throw new BadRequestException(`Catalog with ID ${id} not found`);
    }
    this.logger.debug(`${this.DELETE_CATALOG} - ${OUT}`);
    return deletedCatalog;
  }
}
