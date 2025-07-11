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
  ClassSerializerInterceptor
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { ParseMongoIdPipe } from 'src/common/pipes/parse-mongo-id/parse-mongo-id.pipe';
import { ErrorResponseInterceptor } from 'src/common/interceptors/error-response.interceptor';

/**
 * Users Controller
 * 
 * Handles HTTP requests for user management operations.
 * All endpoints require authentication and proper authorization.
 * 
 * @version 1.0.0
 * @author Your Team
 */
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor, ErrorResponseInterceptor)
@Auth(ValidRoles.superUser, ValidRoles.admin)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Create a new user
   * @param userId - ID of the user creating the new user
   * @param createUserDto - User creation data
   * @returns Created user data
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @GetUser('id') userId: string,
    @Body() createUserDto: CreateUserDto
  ) {
    const user = await this.usersService.create(createUserDto, userId);
    return {
      message: 'User created successfully',
      user
    };
  }

  /**
   * Get all users with pagination and filtering
   * @param query - Query parameters for filtering and pagination
   * @returns Paginated list of users
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: UserQueryDto
  ) {
    return this.usersService.findAll(query);
  }

  /**
   * Get a specific user by ID
   * @param id - User ID
   * @returns User data
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @Param('id', ParseMongoIdPipe) id: string
  ) {
    return this.usersService.findOne(id);
  }

  /**
   * Update a user
   * @param userId - ID of the user performing the update
   * @param id - ID of the user to update
   * @param updateUserDto - Update data
   * @returns Updated user data
   */
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @GetUser('id') userId: string,
    @Param('id', ParseMongoIdPipe) id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const user = await this.usersService.update(id, updateUserDto, userId);
    return {
      message: 'User updated successfully',
      user
    };
  }

  /**
   * Soft delete a user (deactivate)
   * @param id - ID of the user to delete
   * @returns Deleted user data
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Param('id', ParseMongoIdPipe) id: string
  ) {
    const user = await this.usersService.remove(id);
    return {
      message: 'User deleted successfully',
      user
    };
  }

  /**
   * Get current user count (utility endpoint)
   * @returns Count of active users
   */
  @Get('stats/count')
  @HttpCode(HttpStatus.OK)
  async getUserCount() {
    const count = await this.usersService.countActiveUsers();
    return {
      count,
      message: 'Active users count retrieved successfully'
    };
  }

  /**
   * Check if user exists by ID
   * @param id - User ID to check
   * @returns Existence status
   */
  @Get(':id/exists')
  @HttpCode(HttpStatus.OK)
  async checkUserExists(
    @Param('id', ParseMongoIdPipe) id: string
  ) {
    const exists = await this.usersService.exists(id);
    return {
      exists,
      message: exists ? 'User exists' : 'User does not exist'
    };
  }

  /**
   * Find user by email
   * @param email - Email to search for
   * @returns User data if found
   */
  @Get('email/:email')
  @HttpCode(HttpStatus.OK)
  async findByEmail(
    @Param('email') email: string
  ) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      return {
        message: 'User not found',
        user: null
      };
    }
    return {
      message: 'User found',
      user
    };
  }

  /**
   * Bulk deactivate users (Admin only)
   * @param ids - Array of user IDs to deactivate
   * @returns Bulk operation result
   */
  @Patch('bulk/deactivate')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.superUser) // More restrictive for bulk operations
  async bulkDeactivate(
    @Body('ids') ids: string[]
  ) {
    if (!Array.isArray(ids) || ids.length === 0) {
      return {
        message: 'No user IDs provided',
        modifiedCount: 0
      };
    }

    const result = await this.usersService.bulkDeactivate(ids);
    return {
      message: `${result.modifiedCount} users deactivated successfully`,
      modifiedCount: result.modifiedCount
    };
  }

  /**
   * Get user profile (less restrictive - users can view their own profile)
   * @param id - User ID
   * @param currentUserId - ID of the requesting user
   * @returns User profile data
   */
  @Get(':id/profile')
  @HttpCode(HttpStatus.OK)
  @Auth(ValidRoles.user, ValidRoles.admin, ValidRoles.superUser)
  async getUserProfile(
    @Param('id', ParseMongoIdPipe) id: string,
    @GetUser('id') currentUserId: string
  ) {
    // Users can only view their own profile unless they're admin/superUser
    const currentUser = await this.usersService.findOne(currentUserId);
    const isAdminOrSuper = currentUser.roles.some(role => 
      [ValidRoles.admin, ValidRoles.superUser].includes(role as ValidRoles)
    );

    if (!isAdminOrSuper && id !== currentUserId) {
      return {
        message: 'Access denied: You can only view your own profile',
        user: null
      };
    }

    const user = await this.usersService.findOne(id);
    return {
      message: 'Profile retrieved successfully',
      user
    };
  }
}
