import { Module } from '@nestjs/common';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { Catalog, CatalogSchema } from './entities/catalog.entity';

@Module({
  controllers: [CatalogsController],
  imports: [
     MongooseModule.forFeature([
      {
          name:Catalog.name,
          schema: CatalogSchema
        }
      ]),
    PassportModule.register({
              defaultStrategy: 'jwt'
            }),
  ],
  providers: [CatalogsService],
})
export class CatalogsModule {}
