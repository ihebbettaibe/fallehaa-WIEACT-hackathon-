import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, JobType } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class JobsService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createJobDto: Prisma.JobCreateInput) {
    return this.databaseService.job.create({
      data: createJobDto,
    });
  }

  findAll(filters?: { type?: JobType }) {
    return this.databaseService.job.findMany({
      where: {
        ...(filters?.type && { type: filters.type }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.databaseService.job.findUnique({
      where: { id },
    });
  }

  async findByPoster(posterId: number) {
    // ⚠️ This method no longer makes sense without embedded poster data.
    // You may want to remove it entirely.
    // But if you keep it, it will always return empty unless you re-add user logic.
    return [];
  }

  findOffers() {
    return this.findAll({ type: JobType.OFFER });
  }

  findSeekers() {
    return this.findAll({ type: JobType.SEEK });
  }

  update(id: number, updateJobDto: Prisma.JobUpdateInput) {
    return this.databaseService.job.update({
      where: { id },
      data: updateJobDto,
    });
  }

  remove(id: number) {
    return this.databaseService.job.delete({
      where: { id },
    });
  }
}