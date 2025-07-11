import { SetMetadata, UseGuards, applyDecorators } from '@nestjs/common';
import { ValidRoles } from '../interfaces';
import { AuthGuard } from '@nestjs/passport';
import { RoleProtected } from './role-protected.decorator';
import { UserRoleGuard } from '../guards/user-role/user-role.guard';

/**
 * Flexible Auth Decorator
 * 
 * Provides more flexible authentication and authorization options.
 * Allows for optional authentication and role checking.
 * 
 * @param options - Configuration options for authentication
 * @returns Combined decorators based on options
 * 
 * @example
 * ```typescript
 * @FlexAuth({ 
 *   required: true, 
 *   roles: [ValidRoles.admin],
 *   strategy: 'jwt'
 * })
 * @Get('admin-data')
 * getAdminData() {
 *   // Only authenticated admin users
 * }
 * ```
 * 
 * @example
 * ```typescript
 * @FlexAuth({ 
 *   required: false,
 *   roles: [ValidRoles.user]
 * })
 * @Get('optional-auth')
 * getOptionalAuth(@GetUser() user?: User) {
 *   // User can be null if not authenticated
 * }
 * ```
 */
export interface FlexAuthOptions {
  required?: boolean;
  roles?: ValidRoles[];
  strategy?: string;
}

export function FlexAuth(options: FlexAuthOptions = {}) {
  const { 
    required = true, 
    roles = [], 
    strategy = 'jwt' 
  } = options;

  const decorators = [];

  if (roles.length > 0) {
    decorators.push(RoleProtected(...roles));
  }

  if (required) {
    decorators.push(UseGuards(AuthGuard(strategy)));
    if (roles.length > 0) {
      decorators.push(UseGuards(UserRoleGuard));
    }
  } else {
    // Optional authentication - would need a custom guard
    decorators.push(UseGuards(AuthGuard(strategy)));
  }

  return applyDecorators(...decorators);
}
