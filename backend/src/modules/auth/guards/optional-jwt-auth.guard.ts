import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Optional JWT Authentication Guard
 *
 * This guard allows endpoints to work with both authenticated and anonymous users.
 * - If a valid JWT token is provided, the user will be attached to the request
 * - If no token or invalid token is provided, the request continues without user
 *
 * Usage:
 * @UseGuards(OptionalJwtAuthGuard)
 * async someEndpoint(@CurrentUser() user?: User) {
 *   if (user) {
 *     // User is authenticated
 *   } else {
 *     // Anonymous user
 *   }
 * }
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  /**
   * Override handleRequest to allow requests to continue even without authentication
   */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  handleRequest(err: any, user: any): typeof user | null {
    // If there's an error or no user, just return null (don't throw)
    // This allows the request to continue without authentication
    if (err || !user) {
      return null;
    }

    // If user is found, return it normally
    return user;
  }
}
