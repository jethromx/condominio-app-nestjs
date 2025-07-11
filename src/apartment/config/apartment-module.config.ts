import { ModuleMetadata, Type } from '@nestjs/common';

/**
 * Configuración centralizada para el módulo de apartamentos
 */
export interface ApartmentModuleOptions {
  // Configuraciones de paginación por defecto
  defaultPaginationLimit?: number;
  maxPaginationLimit?: number;
  
  // Configuraciones de validación
  enableStrictValidation?: boolean;
  
  // Configuraciones de logging
  enableDetailedLogging?: boolean;
  
  // Configuraciones de cache (para futuras implementaciones)
  enableCaching?: boolean;
  cacheTTL?: number;
}

/**
 * Configuración asíncrona del módulo
 */
export interface ApartmentModuleAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  useFactory?: (...args: any[]) => Promise<ApartmentModuleOptions> | ApartmentModuleOptions;
  inject?: any[];
  useClass?: Type<ApartmentModuleOptionsFactory>;
  useExisting?: Type<ApartmentModuleOptionsFactory>;
}

/**
 * Factory para crear opciones del módulo
 */
export interface ApartmentModuleOptionsFactory {
  createApartmentModuleOptions(): Promise<ApartmentModuleOptions> | ApartmentModuleOptions;
}

/**
 * Configuración por defecto del módulo
 */
export const DEFAULT_APARTMENT_MODULE_OPTIONS: ApartmentModuleOptions = {
  defaultPaginationLimit: 10,
  maxPaginationLimit: 100,
  enableStrictValidation: true,
  enableDetailedLogging: true,
  enableCaching: false,
  cacheTTL: 300, // 5 minutos
};
