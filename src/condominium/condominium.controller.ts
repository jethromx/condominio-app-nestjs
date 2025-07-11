import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  HttpCode, 
  HttpStatus, 
  UseInterceptors,
  NotFoundException,
  BadRequestException
} from '@nestjs/common';
import { CondominiumService } from './condominium.service';
import { CreateCondominiumDto } from './dto/create-condominium.dto';
import { UpdateCondominiumDto } from './dto/update-condominium.dto';
import { CondominiumQueryDto } from './dto/condominium-query.dto';
import { ValidRoles } from 'src/auth/interfaces';
import { Auth, GetUser } from 'src/auth/decorators';
import { ApartmentService } from 'src/apartment/apartment.service';
import { PaginationDTO } from 'src/common/dto/Pagination.dto';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { ErrorResponseInterceptor } from 'src/common/interceptors/error-response.interceptor';

/**
 * Condominium Controller
 * 
 * Handles HTTP requests for condominium management operations.
 * All endpoints require authentication and appropriate role permissions.
 * 
 * @security
 * - Requires superUser or admin role for all operations
 * - Uses JWT authentication strategy
 * - User context injected via @GetUser decorator
 * 
 * @validation
 * - All inputs validated using DTOs and class-validator
 * - MongoDB ObjectId validation using custom pipes
 * - Query parameter validation for search and pagination
 * 
 * @error_handling
 * - Consistent error responses via ErrorResponseInterceptor
 * - Proper HTTP status codes for different operations
 * - Detailed error messages for debugging
 */

@Controller('condominiums')
@Auth(ValidRoles.superUser, ValidRoles.admin)
@UseInterceptors(ErrorResponseInterceptor)
export class CondominiumController {
  constructor(
    private readonly condominiumService: CondominiumService,
    private readonly apartmentService: ApartmentService,
  ) {}

  /**
   * Create a new condominium
   * 
   * @param createCondominiumDto - Condominium creation data
   * @param user - Authenticated user creating the condominium
   * @returns Created condominium with generated ID
   * 
   * @throws BadRequestException - Invalid input data or duplicate name
   * @throws NotFoundException - Admin user not found
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createCondominiumDto: CreateCondominiumDto,
    @GetUser('id') userId: string,
  ) {
    try {
      return await this.condominiumService.create(createCondominiumDto, userId);
    } catch (error) {
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        throw new BadRequestException('A condominium with this name already exists');
      }
      throw error;
    }
  }

  /**
   * Get all condominiums with optional filtering and pagination
   * 
   * @param queryDto - Query parameters for filtering and pagination
   * @returns Paginated list of condominiums matching the criteria
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() queryDto: CondominiumQueryDto,
  ) {
    return await this.condominiumService.findAll(queryDto);
  }

  /**
   * Get condominium statistics
   * 
   * @returns Statistics including total count, active count, etc.
   */
  @Get('stats')
  @HttpCode(HttpStatus.OK)
  async getStatistics() {
    return await this.condominiumService.getStatistics();
  }

  /**
   * Check if a condominium exists by ID
   * 
   * @param id - Condominium ID to check
   * @returns Boolean indicating existence
   */
  @Get('exists/:id')
  @HttpCode(HttpStatus.OK)
  async exists(
    @Param('id', ParseMongoIdPipe) id: string,
  ) {
    const exists = await this.condominiumService.exists(id);
    return { exists };
  }

  /**
   * Get a specific condominium by ID
   * 
   * @param id - Condominium ID
   * @returns Condominium details
   * 
   * @throws NotFoundException - Condominium not found
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', ParseMongoIdPipe) id: string,
  ) {
    const condominium = await this.condominiumService.findOne(id);
    if (!condominium) {
      throw new NotFoundException('Condominium not found');
    }
    return condominium;
  }

  /**
   * Get all apartments belonging to a specific condominium
   * 
   * @param paginationDto - Pagination parameters
   * @param condominiumId - Condominium ID
   * @returns Paginated list of apartments
   * 
   * @throws NotFoundException - Condominium not found
   */
  @Get(':id/apartments')
  @HttpCode(HttpStatus.OK)
  async findApartments(
    @Query() paginationDto: PaginationDTO,
    @Param('id', ParseMongoIdPipe) condominiumId: string,
  ) {
    // Verify condominium exists first
    const condominiumExists = await this.condominiumService.exists(condominiumId);
    if (!condominiumExists) {
      throw new NotFoundException('Condominium not found');
    }

    return await this.apartmentService.findAllApartmentsByCondominium(
      paginationDto, 
      condominiumId
    );
  }

  /**
   * Update a condominium
   * 
   * @param id - Condominium ID to update
   * @param updateCondominiumDto - Update data
   * @param user - Authenticated user performing the update
   * @returns Updated condominium
   * 
   * @throws NotFoundException - Condominium not found
   * @throws BadRequestException - Invalid update data
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateCondominiumDto: UpdateCondominiumDto,
    @GetUser('id') userId: string,
  ) {
    try {
      const updated = await this.condominiumService.update(
        id, 
        updateCondominiumDto, 
        userId
      );
      
      if (!updated) {
        throw new NotFoundException('Condominium not found');
      }
      
      return updated;
    } catch (error) {
      if (error.message.includes('duplicate') || error.message.includes('already exists')) {
        throw new BadRequestException('A condominium with this name already exists');
      }
      throw error;
    }
  }

  /**
   * Soft delete a condominium
   * 
   * @param id - Condominium ID to delete
   * @returns Success message
   * 
   * @throws NotFoundException - Condominium not found
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseMongoIdPipe) id: string,
  ) {
    const deleted = await this.condominiumService.remove(id);
    
    if (!deleted) {
      throw new NotFoundException('Condominium not found');
    }
    
    return { 
      message: 'Condominium deleted successfully',
      id: id 
    };
  }
}
