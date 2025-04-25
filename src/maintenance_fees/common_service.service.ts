import { BadRequestException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose/dist/common";
import { CommonService } from "./entities/common_service.entity";
import { Model } from "mongoose";
import { CondominiumService } from "src/condominium/condominium.service";
import { isValidUUIDv4 } from "src/common/helpers/validateUUID";
import { ACTIVE, DELETED, ID_NOT_VALID } from "src/common/messages.const";
import { PaginationDTO } from "src/common/dto/Pagination.dto";
import { v4 as uuidv4 } from 'uuid';

@Injectable() 
export class CommonServiceService{
    private readonly logger = new Logger(CommonServiceService.name);

    private readonly CREATE_COMMON_SERVICE = 'CREATE_COMMON_SERVICE';
    private readonly UPDATE_COMMON_SERVICE = 'UPDATE_COMMON_SERVICE';
    private readonly DELETE_COMMON_SERVICE = 'DELETE_COMMON_SERVICE';
    private readonly FIND_ALL_COMMON_SERVICE = 'FIND_ALL_COMMON_SERVICE';
    private readonly FIND_COMMON_SERVICE_BY_ID = 'FIND_COMMON_SERVICE_BY_ID';

    constructor(
        @InjectModel(CommonService.name)
        private readonly commonServiceModel: Model<CommonService>,
        private readonly condominiumService: CondominiumService,
    ) {}

    async create(condominiumId: string, createCommonServiceDto: any, userId: string) {
        this.logger.log(`${this.CREATE_COMMON_SERVICE} - IN`);

        this.validateId(userId);
        this.validateId(condominiumId);


        // Verificar si el condominio existe
        await this.condominiumService.findOne(condominiumId);

        // Crear un nuevo servicio común
        const commonService = new this.commonServiceModel({
            _id: uuidv4(),
            ...createCommonServiceDto,
            condominiumId,
            createdBy: userId,
            updatedBy: userId,
        });

        await commonService.save();
        this.logger.log(`${this.CREATE_COMMON_SERVICE} - OUT`);
        return commonService;
    }
    async findAll(condominiumId: string, paginationDto: PaginationDTO) {
        this.logger.log(`${this.FIND_ALL_COMMON_SERVICE} - IN`);

        this.validateId(condominiumId);

        // Verificar si el condominio existe
        await this.condominiumService.findOne(condominiumId);

        /*
        const rootFilter = {
            condominiumId,
            status: { $ne: DELETED }, // Filtrar por estado diferente a "deleted"
        };*/

        const rootFilter = {
            condominiumId,
            status: ACTIVE, // Filtrar por estado diferente a "deleted"
        };


        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        this.logger.log(`Pagination - page: ${page}, limit: ${limit}, skip: ${skip}`);

        const commonServices = await this.commonServiceModel
            .find(rootFilter)
            .skip(skip)
            .limit(limit)
            .exec();

        if (!commonServices ) {
            this.logger.error(`${this.FIND_ALL_COMMON_SERVICE} - No common services found`);
            throw new NotFoundException('No common services found');
        }

        const total = await this.commonServiceModel.countDocuments(rootFilter).exec();
        const totalPages = Math.ceil(total / limit);
        const response = {
            data: commonServices,
            total,
            page,
            limit,
            totalPages
        }

        this.logger.log(`${this.FIND_ALL_COMMON_SERVICE} - OUT`);
        return response;
    }
    async findOne(condominiumId: string, commonServiceId: string) {
        this.logger.log(`${this.FIND_COMMON_SERVICE_BY_ID} - IN`);

        this.validateId(condominiumId);
        this.validateId(commonServiceId);

        // Verificar si el condominio existe
        await this.condominiumService.findOne(condominiumId);

        const commonService = await this.commonServiceModel
            .findOne({ _id: commonServiceId, condominiumId, status: { $ne: DELETED } })
            .exec();

        if (!commonService) {
            this.logger.error(`${this.FIND_COMMON_SERVICE_BY_ID} - Common service not found`);
            throw new NotFoundException('Common service not found');
        }

        this.logger.log(`${this.FIND_COMMON_SERVICE_BY_ID} - OUT`);
        return commonService;
    }
    async update(condominiumId: string, commonServiceId: string, updateCommonServiceDto: any, userId: string) {
        this.logger.log(`${this.UPDATE_COMMON_SERVICE} - IN`);

        this.validateId(condominiumId);
        this.validateId(commonServiceId);
        this.validateId(userId);

        // Verificar si el condominio existe
        await this.condominiumService.findOne(condominiumId);
        await this.findOne(condominiumId, commonServiceId);

        const commonService = await this.commonServiceModel
            .findOneAndUpdate(
                { _id: commonServiceId, condominiumId },
                { ...updateCommonServiceDto, updatedBy: userId },
                { new: true }
            )
            .exec();

        if (!commonService) {
            this.logger.error(`${this.UPDATE_COMMON_SERVICE} - Common service not found`);
            throw new NotFoundException('Common service not found');
        }

        this.logger.log(`${this.UPDATE_COMMON_SERVICE} - OUT`);
        return commonService;
    }
    async remove(condominiumId: string, commonServiceId: string) {
        this.logger.log(`${this.DELETE_COMMON_SERVICE} - IN`);

        this.validateId(condominiumId);
        this.validateId(commonServiceId);


        // Verificar si el condominio existe
        await this.condominiumService.findOne(condominiumId);

        await this.findOne(condominiumId, commonServiceId);

        const commonService = await this.commonServiceModel
            .findOneAndUpdate(
                { _id: commonServiceId, condominiumId },
                { status: DELETED },
                { new: true }
            )
            .exec();
        if (!commonService) {
            this.logger.error(`${this.DELETE_COMMON_SERVICE} - Common service not found`);
            throw new NotFoundException('Common service not found');
        }

        this.logger.log(`${this.DELETE_COMMON_SERVICE} - OUT`);
        return commonService;
    }


    
    private validateId(id: string) {
          if (!isValidUUIDv4(id)) {
            this.logger.error(ID_NOT_VALID(id));
            throw new BadRequestException(ID_NOT_VALID(id));
          }
        }
}
