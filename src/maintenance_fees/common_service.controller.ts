import { 
    Body, 
    Controller, 
    Delete, 
    Get, 
    Param, 
    Patch, 
    Post, 
    Query, 
    HttpCode,
    HttpStatus,
    ValidationPipe,
    UseInterceptors,
    UseFilters
} from "@nestjs/common";
import { Auth, GetUser } from "src/auth/decorators";
import { ValidRoles } from "src/auth/interfaces";
import { CreateCommonServiceDto } from "./dto/create-common_service.dto";
import { CommonServiceService } from "./common_service.service";
import { UpdateCommonServiceDto } from "./dto/update-common_service.dto";
import { PaginationDTO } from "src/common/dto/Pagination.dto";
import { ParseObjectIdPipe } from "src/common/pipes/parse-objectid.pipe";
import { ResponseTransformInterceptor } from "src/common/interceptors/response-transform.interceptor";
import { AllExceptionsFilter } from "src/common/filters/all-exceptions.filter";


/**
 * Controlador para gestión de servicios comunes del condominio
 * Maneja todas las operaciones CRUD y consultas específicas para servicios comunes
 */
@Controller('condominiums/:condominiumId/common-services')
@Auth(ValidRoles.superUser, ValidRoles.admin)
@UseInterceptors(ResponseTransformInterceptor)
@UseFilters(AllExceptionsFilter)
export class CommonServiceController {
    constructor(
        private readonly commonServiceService: CommonServiceService,
    ) { }

    /**
     * Crear un nuevo servicio común
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(
        @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
        @Body(ValidationPipe) createCommonServiceDto: CreateCommonServiceDto,
        @GetUser('id') userId: string,
    ) {
        return this.commonServiceService.create(condominiumId, createCommonServiceDto, userId);
    }

    /**
     * Obtener todos los servicios comunes paginados
     */
    @Get()
    @HttpCode(HttpStatus.OK)
    findAll(
        @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
        @Query(ValidationPipe) paginationDto: PaginationDTO,
    ) {
        return this.commonServiceService.findAll(condominiumId, paginationDto);
    }

    /**
     * Obtener un servicio común por ID
     */
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    findOne(
        @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
        @Param('id', ParseObjectIdPipe) id: string,
    ) {
        return this.commonServiceService.findOne(condominiumId, id);
    }

    /**
     * Actualizar un servicio común
     */
    @Patch(':id')
    @HttpCode(HttpStatus.OK)
    update(
        @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
        @Param('id', ParseObjectIdPipe) id: string,
        @Body(ValidationPipe) updateCommonServiceDto: UpdateCommonServiceDto,
        @GetUser('id') userId: string,
    ) {
        return this.commonServiceService.update(condominiumId, id, updateCommonServiceDto, userId);
    }

    /**
     * Eliminar un servicio común (soft delete)
     */
    @Delete(':id')
    @HttpCode(HttpStatus.OK)
    remove(
        @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
        @Param('id', ParseObjectIdPipe) id: string,
    ) {
        return this.commonServiceService.remove(condominiumId, id);
    }

    /**
     * Obtener estadísticas de servicios comunes
     */
    @Get('statistics')
    @HttpCode(HttpStatus.OK)
    getStatistics(
        @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
    ) {
        return this.commonServiceService.getCommonServiceStatistics(condominiumId);
    }

    /**
     * Buscar servicios comunes por frecuencia
     */
    @Get('by-frequency/:frequency')
    @HttpCode(HttpStatus.OK)
    findByFrequency(
        @Param('condominiumId', ParseObjectIdPipe) condominiumId: string,
        @Param('frequency') frequency: string,
        @Query(ValidationPipe) paginationDto: PaginationDTO,
    ) {
        return this.commonServiceService.findByFrequency(condominiumId, frequency, paginationDto);
    }
}