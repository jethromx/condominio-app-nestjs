import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from "@nestjs/common";
import { Auth, GetUser } from "src/auth/decorators";
import { ValidRoles } from "src/auth/interfaces";
import { CreateCommonServiceDto } from "./dto/create-common_service.dto";
import { CommonServiceService } from "./common_service.service";
import { UpdateCommonServiceDto } from "./dto/update-common_service.dto";
import { Response } from 'express';


@Controller('condominiums/:condominiumId/common-services')
@Auth(ValidRoles.superUser, ValidRoles.admin)
export class CommonServiceController {
    constructor(
        private readonly commonServiceService: CommonServiceService,
    ) { }

    @Post()
    create(
        @Param('condominiumId') condominiumId: string,
        @Body() createCommonServiceDto: CreateCommonServiceDto,
        @GetUser('id') userId: string,) {
        return this.commonServiceService.create(condominiumId, createCommonServiceDto, userId);
    }


    @Get()
    findAll(
        @Param('condominiumId') condominiumId: string,
        @Query() query: any,
    ) {
        return this.commonServiceService.findAll(condominiumId, query);
    }


    @Get(':id')
    findOne(
        @Param('condominiumId') condominiumId: string,
        @Param('id') id: string) {
        return this.commonServiceService.findOne(condominiumId, id);
    }


    @Patch(':id')
    update(
        @Param('condominiumId') condominiumId: string,
        @Param('id') id: string,
        @Body() updateCommonServiceDto: UpdateCommonServiceDto,
        @GetUser('id') userId: string,) {
        return this.commonServiceService.update(condominiumId, id, updateCommonServiceDto, userId);
    }


    @Delete(':id')
    async remove(
        @Param('condominiumId') condominiumId: string,
        @Param('id') id: string,
        @Res() res: Response) {
        await this.commonServiceService.remove(condominiumId, id);
        return res.status(204).send();
    }
}