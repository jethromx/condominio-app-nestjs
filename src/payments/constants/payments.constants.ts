/**
 * Constantes utilizadas en el módulo de pagos
 */

// Tokens de inyección de dependencias
export const PAYMENTS_MODULE_OPTIONS = 'PAYMENTS_MODULE_OPTIONS';

// Nombres de entidades
export const PAYMENT_ENTITY = 'Payment';

// Prefijos de rutas
export const PAYMENTS_ROUTE_PREFIX = 'condominiums/:condominiumId/apartments/:apartmentId/payments';

// Eventos del módulo (para futuros event emitters)
export const PAYMENT_EVENTS = {
  CREATED: 'payment.created',
  UPDATED: 'payment.updated',
  DELETED: 'payment.deleted',
  STATUS_CHANGED: 'payment.status.changed',
  AMOUNT_UPDATED: 'payment.amount.updated',
} as const;

// Mensajes de error específicos del módulo
export const PAYMENT_ERROR_MESSAGES = {
  NOT_FOUND: 'Payment not found',
  ALREADY_EXISTS: 'Payment already exists',
  INVALID_AMOUNT: 'Invalid payment amount',
  INVALID_DATE: 'Invalid payment date',
  APARTMENT_MISMATCH: 'Payment does not belong to the specified apartment',
  MAINTENANCE_FEE_REQUIRED: 'Maintenance fee is required',
  DUPLICATE_IDEMPOTENCY_KEY: 'Duplicate idempotency key',
  CANNOT_DELETE: 'Cannot delete payment with dependencies',
} as const;

// Roles válidos para operaciones de pagos
export const PAYMENT_VALID_ROLES = ['superUser', 'admin', 'treasurer'] as const;

// Configuraciones de paginación
export const PAYMENT_PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MIN_LIMIT: 1,
} as const;

// Estados de pago
export const PAYMENT_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
  CANCELLED: 'CANCELLED',
} as const;

// Estados de procesamiento de pago
export const PAYMENT_PROCESSING_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

// Métodos de pago válidos
export const PAYMENT_METHODS = {
  CASH: 'CASH',
  BANK_TRANSFER: 'TRANSFERENCIA',
  CREDIT_CARD: 'TARJETA_CREDITO',
  DEBIT_CARD: 'TARJETA_DEBITO',
  CHECK: 'CHEQUE',
  DIGITAL_WALLET: 'BILLETERA_DIGITAL',
} as const;

// Tipos de pago
export const PAYMENT_TYPES = {
  MAINTENANCE_FEE: 'MAINTENANCE_FEE',
  FINE: 'FINE',
  SPECIAL_ASSESSMENT: 'SPECIAL_ASSESSMENT',
  UTILITY: 'UTILITY',
  OTHER: 'OTHER',
} as const;

// Monedas soportadas
export const SUPPORTED_CURRENCIES = {
  MXN: 'MX',
  USD: 'US',
  EUR: 'EU',
} as const;

// Límites de montos
export const PAYMENT_LIMITS = {
  MIN_AMOUNT: 0.01,
  MAX_AMOUNT: 999999.99,
} as const;

// Configuraciones de idempotencia
export const IDEMPOTENCY_CONFIG = {
  KEY_LENGTH: 32,
  EXPIRATION_HOURS: 24,
} as const;
