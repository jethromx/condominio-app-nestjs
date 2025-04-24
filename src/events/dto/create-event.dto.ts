import { IsDate, IsDateString, IsString } from "class-validator";

export class CreateEventDto {

    @IsString()
    name: string;
    @IsString()
    description: string;
    @IsDateString()
    startDate: Date;
    @IsDateString()
    endDate: Date;
    @IsDateString()
    startTime: string;
    @IsDateString()
    endTime: string;
    @IsString()
    location: string;
    @IsString()
    eventTypeId: string;
    @IsString()
    condominiumId: string;
    @IsString()
    userId: string;
}
