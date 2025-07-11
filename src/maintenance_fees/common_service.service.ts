import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { CommonService } from "./entities/common_service.entity";
import { isValidObjectId, Model } from "mongoose";
import { CondominiumService } from "src/condominium/condominium.service";
import { ACTIVE, DELETED, ID_NOT_VALID } from "src/common/messages.const";
import { PaginationDTO } from "src/common/dto/Pagination.dto";

/**
 * Servicio para gestión de servicios comunes del condominio
 * Proporciona operaciones CRUD y funcionalidades específicas para servicios comunes
 */
@Injectable() 
export class CommonServiceService {
    private readonly logger = new Logger(CommonServiceService.name);

    // Constantes para logging y mensajes
    private readonly CREATE_COMMON_SERVICE = 'CREATE_COMMON_SERVICE';
    private readonly UPDATE_COMMON_SERVICE = 'UPDATE_COMMON_SERVICE';
    private readonly DELETE_COMMON_SERVICE = 'DELETE_COMMON_SERVICE';
    private readonly FIND_ALL_COMMON_SERVICE = 'FIND_ALL_COMMON_SERVICE';
    private readonly FIND_COMMON_SERVICE_BY_ID = 'FIND_COMMON_SERVICE_BY_ID';

    // Constantes para mensajes de error
    private readonly COMMON_SERVICE_NOT_FOUND = 'Common service not found';
    private readonly COMMON_SERVICE_ALREADY_EXISTS = 'Common service already exists';
    private readonly NO_COMMON_SERVICES_FOUND = 'No common services found';

    constructor(
        @InjectModel(CommonService.name)
        private readonly commonServiceModel: Model<CommonService>,
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
     * Crear un nuevo servicio común
     * @param condominiumId - ID del condominio
     * @param createCommonServiceDto - Datos del servicio común a crear
     * @param userId - ID del usuario creador
     * @returns Servicio común creado
     */
    async create(condominiumId: string, createCommonServiceDto: any, userId: string) {
        this.logger.log(`${this.CREATE_COMMON_SERVICE} - IN`);

        this.validateId(userId);
        this.validateId(condominiumId);

        // Verificar si el condominio existe
        await this.condominiumService.findOne(condominiumId);

        // Verificar si ya existe un servicio con el mismo nombre
        if (createCommonServiceDto.name) {
            const existingService = await this.commonServiceModel.findOne({
                name: createCommonServiceDto.name,
                condominiumId: condominiumId,
                status: ACTIVE
            }).exec();

            if (existingService) {
                this.logger.error(`${this.CREATE_COMMON_SERVICE} - Service with name "${createCommonServiceDto.name}" already exists`);
                throw new BadRequestException(`${this.COMMON_SERVICE_ALREADY_EXISTS} with name "${createCommonServiceDto.name}"`);
            }
        }

        // Crear un nuevo servicio común
        const commonService = new this.commonServiceModel({           
            ...createCommonServiceDto,
            condominiumId,
            createdBy: userId,
            updatedBy: userId,
        });

        const savedCommonService = await commonService.save();
        this.logger.log(`${this.CREATE_COMMON_SERVICE} - OUT - Created service with ID: ${savedCommonService._id}`);
        return savedCommonService;
    }
    /**
     * Obtener todos los servicios comunes paginados
     * @param condominiumId - ID del condominio
     * @param paginationDto - Parámetros de paginación
     * @returns Lista paginada de servicios comunes
     */
    async findAll(condominiumId: string, paginationDto: PaginationDTO) {
        this.logger.log(`${this.FIND_ALL_COMMON_SERVICE} - IN`);

        this.validateId(condominiumId);
        this.validatePagination(paginationDto);

        // Verificar si el condominio existe
        await this.condominiumService.findOne(condominiumId);

        const rootFilter = {
            condominiumId,
            status: ACTIVE,
        };

        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        this.logger.log(`${this.FIND_ALL_COMMON_SERVICE} - Pagination - page: ${page}, limit: ${limit}, skip: ${skip}`);

        const commonServices = await this.commonServiceModel
            .find(rootFilter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        const total = await this.commonServiceModel.countDocuments(rootFilter).exec();
        
        this.logger.log(`${this.FIND_ALL_COMMON_SERVICE} - OUT - Found ${commonServices.length} services`);
        return this.createPaginatedResponse(commonServices, total, page, limit);
    }
    /**
     * Obtener un servicio común por ID
     * @param condominiumId - ID del condominio
     * @param commonServiceId - ID del servicio común
     * @returns Servicio común encontrado
     */
    async findOne(condominiumId: string, commonServiceId: string) {
        this.logger.log(`${this.FIND_COMMON_SERVICE_BY_ID} - IN`);

        this.validateId(condominiumId);
        this.validateId(commonServiceId);

        // Verificar si el condominio existe
        await this.condominiumService.findOne(condominiumId);

        const commonService = await this.commonServiceModel
            .findOne({ 
                _id: commonServiceId, 
                condominiumId, 
                status: ACTIVE 
            })
            .exec();

        if (!commonService) {
            this.logger.error(`${this.FIND_COMMON_SERVICE_BY_ID} - Common service with id ${commonServiceId} not found`);
            throw new NotFoundException(`${this.COMMON_SERVICE_NOT_FOUND} with id ${commonServiceId}`);
        }

        this.logger.log(`${this.FIND_COMMON_SERVICE_BY_ID} - OUT - Found service: ${commonServiceId}`);
        return commonService;
    }
    /**
     * Actualizar un servicio común
     * @param condominiumId - ID del condominio
     * @param commonServiceId - ID del servicio común
     * @param updateCommonServiceDto - Datos a actualizar
     * @param userId - ID del usuario que actualiza
     * @returns Servicio común actualizado
     */
    async update(condominiumId: string, commonServiceId: string, updateCommonServiceDto: any, userId: string) {
        this.logger.log(`${this.UPDATE_COMMON_SERVICE} - IN`);

        this.validateId(condominiumId);
        this.validateId(commonServiceId);
        this.validateId(userId);

        // Verificar si el condominio existe
        await this.condominiumService.findOne(condominiumId);
        
        // Verificar si el servicio existe
        await this.findOne(condominiumId, commonServiceId);

        // Verificar duplicados si se está actualizando el nombre
        if (updateCommonServiceDto.name) {
            const existingService = await this.commonServiceModel.findOne({
                name: updateCommonServiceDto.name,
                condominiumId: condominiumId,
                _id: { $ne: commonServiceId },
                status: ACTIVE
            }).exec();

            if (existingService) {
                this.logger.error(`${this.UPDATE_COMMON_SERVICE} - Service with name "${updateCommonServiceDto.name}" already exists`);
                throw new BadRequestException(`${this.COMMON_SERVICE_ALREADY_EXISTS} with name "${updateCommonServiceDto.name}"`);
            }
        }

        const updateData = {
            ...updateCommonServiceDto,
            updatedBy: userId,
            updatedAt: new Date()
        };

        const commonService = await this.commonServiceModel
            .findOneAndUpdate(
                { _id: commonServiceId, condominiumId },
                updateData,
                { new: true }
            )
            .exec();

        if (!commonService) {
            this.logger.error(`${this.UPDATE_COMMON_SERVICE} - Common service with id ${commonServiceId} not found during update`);
            throw new NotFoundException(`${this.COMMON_SERVICE_NOT_FOUND} with id ${commonServiceId}`);
        }

        this.logger.log(`${this.UPDATE_COMMON_SERVICE} - OUT - Updated service: ${commonServiceId}`);
        return commonService;
    }
    /**
     * Eliminar un servicio común (soft delete)
     * @param condominiumId - ID del condominio
     * @param commonServiceId - ID del servicio común
     * @returns Servicio común eliminado
     */
    async remove(condominiumId: string, commonServiceId: string) {
        this.logger.log(`${this.DELETE_COMMON_SERVICE} - IN`);

        this.validateId(condominiumId);
        this.validateId(commonServiceId);

        // Verificar si el condominio existe
        await this.condominiumService.findOne(condominiumId);

        // Verificar si el servicio existe
        await this.findOne(condominiumId, commonServiceId);

        const commonService = await this.commonServiceModel
            .findOneAndUpdate(
                { _id: commonServiceId, condominiumId },
                { status: DELETED },
                { new: true }
            )
            .exec();
            
        if (!commonService) {
            this.logger.error(`${this.DELETE_COMMON_SERVICE} - Common service with id ${commonServiceId} not found during deletion`);
            throw new NotFoundException(`${this.COMMON_SERVICE_NOT_FOUND} with id ${commonServiceId}`);
        }

        this.logger.log(`${this.DELETE_COMMON_SERVICE} - OUT - Soft deleted service: ${commonServiceId}`);
        return commonService;
    }

    /**
     * Obtener estadísticas de servicios comunes
     * @param condominiumId - ID del condominio
     * @returns Estadísticas de servicios comunes
     */
    async getCommonServiceStatistics(condominiumId: string) {
        this.logger.log(`${this.FIND_ALL_COMMON_SERVICE} - Statistics - IN`);
        
        this.validateId(condominiumId);
        await this.condominiumService.findOne(condominiumId);

        const statistics = await this.commonServiceModel.aggregate([
            {
                $match: {
                    condominiumId: condominiumId,
                    status: ACTIVE
                }
            },
            {
                $group: {
                    _id: null,
                    totalServices: { $sum: 1 },
                    totalCost: { $sum: '$cost' },
                    averageCost: { $avg: '$cost' },
                    minCost: { $min: '$cost' },
                    maxCost: { $max: '$cost' }
                }
            }
        ]).exec();

        const result = statistics[0] || {
            totalServices: 0,
            totalCost: 0,
            averageCost: 0,
            minCost: 0,
            maxCost: 0
        };

        this.logger.log(`${this.FIND_ALL_COMMON_SERVICE} - Statistics - OUT`);
        return result;
    }

    /**
     * Buscar servicios comunes por frecuencia
     * @param condominiumId - ID del condominio
     * @param frequency - Frecuencia del servicio
     * @param paginationDto - Parámetros de paginación
     * @returns Lista paginada de servicios filtrados por frecuencia
     */
    async findByFrequency(condominiumId: string, frequency: string, paginationDto: PaginationDTO) {
        this.logger.log(`${this.FIND_ALL_COMMON_SERVICE} - By Frequency - IN`);
        
        this.validateId(condominiumId);
        this.validatePagination(paginationDto);
        
        await this.condominiumService.findOne(condominiumId);

        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;
        
        const rootFilter = { 
            status: ACTIVE, 
            condominiumId: condominiumId,
            frequency: frequency
        };

        const commonServices = await this.commonServiceModel
            .find(rootFilter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec();

        const total = await this.commonServiceModel.countDocuments(rootFilter).exec();
        
        this.logger.log(`${this.FIND_ALL_COMMON_SERVICE} - By Frequency - OUT`);
        return this.createPaginatedResponse(commonServices, total, page, limit);
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
