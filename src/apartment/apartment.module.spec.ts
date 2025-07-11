import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ApartmentModule } from './apartment.module';
import { ApartmentService } from './apartment.service';
import { ApartmentController } from './apartment.controller';
import { Apartment } from './entities/apartment.entity';
import { CondominiumService } from 'src/condominium/condominium.service';
import { UsersService } from 'src/users/users.service';

describe('ApartmentModule', () => {
  let module: TestingModule;
  let apartmentService: ApartmentService;
  let apartmentController: ApartmentController;

  // Mock del modelo de Mongoose
  const mockApartmentModel = {
    find: jest.fn(),
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    countDocuments: jest.fn(),
    exec: jest.fn(),
  };

  // Mock de servicios dependientes
  const mockCondominiumService = {
    findOne: jest.fn(),
  };

  const mockUsersService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ApartmentModule],
    })
      .overrideProvider(getModelToken(Apartment.name))
      .useValue(mockApartmentModel)
      .overrideProvider(CondominiumService)
      .useValue(mockCondominiumService)
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .compile();

    apartmentService = module.get<ApartmentService>(ApartmentService);
    apartmentController = module.get<ApartmentController>(ApartmentController);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('Module Compilation', () => {
    it('should compile the module successfully', () => {
      expect(module).toBeDefined();
    });

    it('should have ApartmentService defined', () => {
      expect(apartmentService).toBeDefined();
      expect(apartmentService).toBeInstanceOf(ApartmentService);
    });

    it('should have ApartmentController defined', () => {
      expect(apartmentController).toBeDefined();
      expect(apartmentController).toBeInstanceOf(ApartmentController);
    });
  });

  describe('Providers', () => {
    it('should provide all necessary services', () => {
      const providers = [
        ApartmentService,
        'ParseObjectIdPipe',
        'ResponseTransformInterceptor',
        'AllExceptionsFilter',
      ];

      providers.forEach(provider => {
        expect(module.get(provider)).toBeDefined();
      });
    });
  });

  describe('Exports', () => {
    it('should export ApartmentService', () => {
      const exportedService = module.get(ApartmentService);
      expect(exportedService).toBeDefined();
      expect(exportedService).toBeInstanceOf(ApartmentService);
    });
  });
});
