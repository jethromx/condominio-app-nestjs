import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { CondominiumService } from './condominium.service';
import { CondominiumController } from './condominium.controller';
import { Condominium, CondominiumSchema } from './entities/condominium.entity';
import { ApartmentModule } from 'src/apartment/apartment.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/auth/entities/user.entity';

/**
 * Condominium Module
 * 
 * Handles all condominium-related operations including:
 * - Condominium creation and management
 * - Condominium queries and updates
 * - Relationship management with apartments and users
 * 
 * @dependencies
 * - MongooseModule: For Condominium entity database operations
 * - UsersModule: For admin user validation and management
 * - ApartmentModule: For related apartment operations (forwardRef due to circular dependency)
 * - AuthModule: For authentication strategies
 * 
 * @exports
 * - CondominiumService: For dependency injection in other modules
 * - MongooseModule: For direct model access when needed
 * 
 * @security
 * - All endpoints require authentication via @Auth decorator
 * - Role-based access control implemented at controller level
 * 
 * @performance
 * - Optimized queries with population of related data
 * - Pagination support for large datasets
 * - Efficient validation and error handling
 * 
 * @circular_dependency_note
 * This module has a circular dependency with ApartmentModule because:
 * - Condominiums contain multiple apartments
 * - Apartments belong to a condominium
 * - Both modules need to reference each other's services
 * 
 * This is resolved using forwardRef() which is acceptable for this business logic.
 * Alternative solutions could include:
 * 1. Creating a shared module for common entities
 * 2. Using events for communication between modules
 * 3. Restructuring to have a parent module that manages both
 * 
 * @usage_examples
 * ```typescript
 * // In other modules
 * import { CondominiumModule } from 'src/condominium';
 * 
 * @Module({
 *   imports: [CondominiumModule]
 * })
 * export class SomeModule {}
 * ```
 */
@Module({
  controllers: [CondominiumController],
  providers: [CondominiumService],
  imports: [
    // Authentication and authorization
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    
    // User management for admin validation
    UsersModule,
    
    // Circular dependency with ApartmentModule (apartments belong to condominiums)
    // This is necessary because:
    // 1. CondominiumController uses ApartmentService
    // 2. ApartmentService likely references CondominiumService
    // 3. Business logic requires bidirectional relationship
    forwardRef(() => ApartmentModule),
    forwardRef(() => AuthModule),
    
    // Database entity registration
    MongooseModule.forFeature([
      { name: Condominium.name, schema: CondominiumSchema },
      { name: User.name, schema: UserSchema } // Ensure User entity is registered for role validation
    ]),
  ],
  exports: [
    CondominiumService, // Export service for use in other modules
    MongooseModule, // Export model for direct access when needed
  ],
})
export class CondominiumModule {}
