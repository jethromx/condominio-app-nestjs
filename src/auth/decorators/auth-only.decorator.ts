import { UseGuards, applyDecorators } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Authentication Only Decorator
 * 
 * Ensures the user is authenticated but doesn't check roles.
 * Use this when you only need to verify the user is logged in.
 * 
 * @returns AuthGuard decorator for JWT authentication
 * 
 * @example
 * ```typescript
 * @AuthOnly()
 * @Get('my-profile')
 * getMyProfile(@GetUser() user: User) {
 *   // Any authenticated user can access this
 *   return user;
 * }
 * ```
 */
export function AuthOnly() {
  return applyDecorators(
    UseGuards(AuthGuard('jwt')),
  );
}
