import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from 'src/auth/entities/user.entity';

/**
 * Users Module
 * 
 * Handles all user-related operations including:
 * - User creation and management
 * - User queries and updates
 * - User authentication context
 * 
 * @dependencies
 * - MongooseModule: For User entity database operations
 * - UsersService: Core business logic for user operations
 * - UsersController: HTTP endpoints for user management
 * 
 * @exports
 * - UsersService: For dependency injection in other modules
 * - MongooseModule: For direct model access when needed
 * 
 * @security
 * - All endpoints require authentication via @Auth decorator
 * - Role-based access control implemented at controller level
 * 
 * @performance
 * - Lazy loading of user data
 * - Optimized queries with select fields
 * - Pagination support for large datasets
 */
@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    // Add any additional providers here
    // Example: UserValidationService, UserCacheService, etc.
  ],
  imports: [
    // Register User entity with Mongoose
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
    ]),
    // Import PassportModule for AuthGuard functionality
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  exports: [
    UsersService, // Export service for use in other modules
    MongooseModule, // Export model for direct access if needed
  ]
})
export class UsersModule {}
