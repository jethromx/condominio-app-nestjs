/**
 * Constantes utilizadas en el módulo de apartamentos
 */

// Tokens de inyección de dependencias
export const APARTMENT_MODULE_OPTIONS = 'APARTMENT_MODULE_OPTIONS';

// Nombres de entidades
export const APARTMENT_ENTITY = 'Apartment';

// Prefijos de rutas
export const APARTMENT_ROUTE_PREFIX = 'condominiums/:condominiumId/apartments';

// Eventos del módulo (para futuros event emitters)
export const APARTMENT_EVENTS = {
  CREATED: 'apartment.created',
  UPDATED: 'apartment.updated',
  DELETED: 'apartment.deleted',
  OWNER_CHANGED: 'apartment.owner.changed',
} as const;

// Mensajes de error específicos del módulo
export const APARTMENT_ERROR_MESSAGES = {
  NOT_FOUND: 'Apartment not found',
  ALREADY_EXISTS: 'Apartment already exists in this condominium',
  INVALID_OWNER: 'Invalid owner for this apartment',
  CONDOMINIUM_MISMATCH: 'Apartment does not belong to the specified condominium',
  CANNOT_DELETE: 'Cannot delete apartment with active relationships',
} as const;

// Roles válidos para operaciones de apartamentos
export const APARTMENT_VALID_ROLES = ['superUser', 'admin'] as const;

// Configuraciones de paginación
export const APARTMENT_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// Estados de apartamento
export const APARTMENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted',
  MAINTENANCE: 'maintenance',
} as const;
