import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class InvestmentsService {
  constructor(
    private readonly databaseService: DatabaseService,
  ) {}

  async create(createInvestmentDto: Prisma.InvestmentCreateInput & { creator: object }) {
  const { creator, ...investmentData } = createInvestmentDto;

  // No need to fetch user from DB, assume frontend provides it
  return this.databaseService.investment.create({
    data: {
      ...investmentData,
      creator,         // store creator JSON as-is
      backings: [],    // initialize empty array
    },
  });
}

  findAll() {
    return this.databaseService.investment.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.databaseService.investment.findUnique({
      where: { id },
    });
  }

  async findByCreator(creatorId: number) {
    const investments = await this.databaseService.investment.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Filter by creator id in JSON field
    return investments.filter((inv) => {
      const creator = inv.creator as any;
      return creator.id === creatorId;
    });
  }

  async addBacking(
  investmentId: number,
  backingData: { user: { id: number; name: string; image: string }; amount: number }
) {
  const investment = await this.findOne(investmentId);
  if (!investment) {
    throw new NotFoundException('Investment not found');
  }

  const backings = (investment.backings as any[]) || [];

  const newBacking = {
    id: backings.length + 1,
    userId: backingData.user.id,
    userName: backingData.user.name,
    userImage: backingData.user.image,
    amount: backingData.amount,
    createdAt: new Date().toISOString(),
  };

  backings.push(newBacking);

  return this.databaseService.investment.update({
    where: { id: investmentId },
    data: { backings },
  });
}

  async getBackings(investmentId: number) {
    const investment = await this.findOne(investmentId);
    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    return investment.backings || [];
  }

  async getTotalBacked(investmentId: number) {
    const investment = await this.findOne(investmentId);
    if (!investment) {
      throw new NotFoundException('Investment not found');
    }

    const backings = (investment.backings as any[]) || [];
    const total = backings.reduce((sum, backing) => sum + backing.amount, 0);

    return { total };
  }

  async getUserBackings(userId: number) {
    const investments = await this.databaseService.investment.findMany();

    const userBackings: any[] = [];

    investments.forEach((investment) => {
      const backings = (investment.backings as any[]) || [];
      const userBackingsInInvestment = backings.filter((b) => b.userId === userId);

      userBackingsInInvestment.forEach((backing) => {
        userBackings.push({
          ...backing,
          investmentId: investment.id,
          investmentTitle: investment.title,
          investmentImage: investment.image,
        });
      });
    });

    return userBackings;
  }

  update(id: number, updateInvestmentDto: Prisma.InvestmentUpdateInput) {
    return this.databaseService.investment.update({
      where: { id },
      data: updateInvestmentDto,
    });
  }

  remove(id: number) {
    return this.databaseService.investment.delete({
      where: { id },
    });
  }
}