import { ModuleMetadata, Type } from '@nestjs/common';

/**
 * Configuración centralizada para el módulo de pagos
 */
export interface PaymentsModuleOptions {
  // Configuraciones de paginación por defecto
  defaultPaginationLimit?: number;
  maxPaginationLimit?: number;
  
  // Configuraciones de validación
  enableStrictValidation?: boolean;
  enableIdempotencyCheck?: boolean;
  
  // Configuraciones de logging
  enableDetailedLogging?: boolean;
  enableAuditLog?: boolean;
  
  // Configuraciones de cache (para futuras implementaciones)
  enableCaching?: boolean;
  cacheTTL?: number;
  
  // Configuraciones de estadísticas
  enableStatistics?: boolean;
  statisticsRetentionDays?: number;
}

/**
 * Configuración asíncrona del módulo
 */
export interface PaymentsModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<PaymentsModuleOptions> | PaymentsModuleOptions;
  inject?: any[];
  useClass?: Type<PaymentsModuleOptionsFactory>;
  useExisting?: Type<PaymentsModuleOptionsFactory>;
}

/**
 * Factory para crear opciones del módulo
 */
export interface PaymentsModuleOptionsFactory {
  createPaymentsModuleOptions(): Promise<PaymentsModuleOptions> | PaymentsModuleOptions;
}

/**
 * Configuración por defecto del módulo
 */
export const DEFAULT_PAYMENTS_MODULE_OPTIONS: PaymentsModuleOptions = {
  defaultPaginationLimit: 10,
  maxPaginationLimit: 100,
  enableStrictValidation: true,
  enableIdempotencyCheck: true,
  enableDetailedLogging: true,
  enableAuditLog: true,
  enableCaching: false,
  cacheTTL: 300, // 5 minutos
  enableStatistics: true,
  statisticsRetentionDays: 365, // 1 año
};
