import { ModuleMetadata } from '@nestjs/common';

/**
 * Condominium Module Configuration
 * 
 * Provides configuration options for the CondominiumModule
 * to handle different deployment scenarios and dependencies.
 */
export interface CondominiumModuleOptions {
  /**
   * Whether to enable apartment integration
   * Set to false if you want to use CondominiumModule without ApartmentModule
   */
  enableApartmentIntegration?: boolean;

  /**
   * Whether to enable user validation
   * Set to false if you want to handle user validation externally
   */
  enableUserValidation?: boolean;

  /**
   * Custom schema options for the Condominium entity
   */
  schemaOptions?: {
    collection?: string;
    timestamps?: boolean;
    [key: string]: any;
  };
}

/**
 * Default configuration for the CondominiumModule
 */
export const defaultCondominiumModuleOptions: CondominiumModuleOptions = {
  enableApartmentIntegration: true,
  enableUserValidation: true,
  schemaOptions: {
    collection: 'condominiums',
    timestamps: true,
  },
};

/**
 * Configuration for testing environments
 * Disables external dependencies for isolated testing
 */
export const testCondominiumModuleOptions: CondominiumModuleOptions = {
  enableApartmentIntegration: false,
  enableUserValidation: false,
  schemaOptions: {
    collection: 'test_condominiums',
    timestamps: true,
  },
};
