import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { AuthGuard } from '@nestjs/passport';
import { RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';

/**
 * Auth Decorator
 * 
 * Combines authentication and authorization in a single decorator.
 * Ensures the user is authenticated and has the required roles.
 * 
 * @param roles - Array of valid roles that can access the endpoint
 * @returns Combined decorators for authentication and authorization
 * 
 * @example
 * ```typescript
 * @Auth(ValidRoles.admin, ValidRoles.superUser)
 * @Get('sensitive-data')
 * getSensitiveData() {
 *   // Only admin and superUser can access this
 * }
 * ```
 * 
 * @example
 * ```typescript
 * @Auth() // No roles specified - any authenticated user
 * @Get('profile')
 * getProfile() {
 *   // Any authenticated user can access this
 * }
 * ```
 * 
 * @security
 * - Uses JWT strategy for authentication
 * - Validates user exists and is active
 * - Checks user roles against required roles
 * - Throws UnauthorizedException if authentication fails
 * - Throws ForbiddenException if authorization fails
 * 
 * @dependencies
 * - Requires PassportModule to be imported in the module
 * - Requires JwtStrategy to be configured
 * - Requires UserRoleGuard for role validation
 */
export function Auth(...roles: ValidRoles[]) {
  return applyDecorators(
    RoleProtected(...roles),    
    UseGuards(AuthGuard('jwt'), UserRoleGuard), // Specify 'jwt' strategy explicitly
  );
}
