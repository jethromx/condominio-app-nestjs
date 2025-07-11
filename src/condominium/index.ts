// Condominium Module Exports
// Centralized export point for all condominium-related functionality

// Main module
export { CondominiumModule } from './condominium.module';

// Controller and Service
export { CondominiumController } from './condominium.controller';
export { CondominiumService } from './condominium.service';

// DTOs
export { CreateCondominiumDto } from './dto/create-condominium.dto';
export { UpdateCondominiumDto } from './dto/update-condominium.dto';
export { CondominiumQueryDto } from './dto/condominium-query.dto';
export { 
  CondominiumResponseDto, 
  PaginatedCondominiumResponseDto, 
  CondominiumStatsResponseDto 
} from './dto/condominium-response.dto';

// Entities
export { Condominium, CondominiumSchema } from './entities/condominium.entity';
export { CondominiumStatus } from './entities/condominium-status.enum';

// Configuration
export { CondominiumModuleOptions } from './condominium-module.config';
