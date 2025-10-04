import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { Prisma, JobType } from '@prisma/client';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  create(@Body() createJobDto: Prisma.JobCreateInput & { posterId: number }) {
    return this.jobsService.create(createJobDto);
  }

  @Get()
  findAll(@Query('type') type?: JobType) {
    return this.jobsService.findAll({ type });
  }

  @Get('offers')
  findOffers() {
    return this.jobsService.findOffers();
  }

  @Get('seekers')
  findSeekers() {
    return this.jobsService.findSeekers();
  }

  @Get('poster/:posterId')
  findByPoster(@Param('posterId', ParseIntPipe) posterId: number) {
    return this.jobsService.findByPoster(posterId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateJobDto: Prisma.JobUpdateInput,
  ) {
    return this.jobsService.update(id, updateJobDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.jobsService.remove(id);
  }
}