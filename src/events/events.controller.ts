import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  create(@Body() createEventDto: CreateEventDto,@GetUser('id') userId: string) {
    return this.eventsService.create(createEventDto,userId);
  }

  @Get()
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  findAll() {
    return this.eventsService.findAll();
  }

  @Get(':id')
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto,@GetUser('id') userId: string) {
    return this.eventsService.update(id, updateEventDto,userId);
  }

  @Delete(':id')
  @Auth(ValidRoles.superUser, ValidRoles.admin)
  remove(@Param('id') id: string) {
    return this.eventsService.remove(id);
  }
}
