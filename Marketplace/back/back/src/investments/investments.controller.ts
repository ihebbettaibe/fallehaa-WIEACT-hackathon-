import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { Prisma } from '@prisma/client';

@Controller('investments')
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}
// investments.controller.ts
  @Post()
  async create(@Body() createInvestmentDto: Prisma.InvestmentCreateInput & { creator: object }) {
  return this.investmentsService.create(createInvestmentDto);
}


  @Get()
  findAll() {
    return this.investmentsService.findAll();
  }

  @Get('creator/:creatorId')
  findByCreator(@Param('creatorId', ParseIntPipe) creatorId: number) {
    return this.investmentsService.findByCreator(creatorId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.investmentsService.findOne(id);
  }

 @Post(':id/backings')
addBacking(
  @Param('id', ParseIntPipe) id: number,
  @Body() backingData: { user: { id: number; name: string; image: string }; amount: number },
) {
  return this.investmentsService.addBacking(id, backingData);
}


  @Get(':id/backings')
  getBackings(@Param('id', ParseIntPipe) id: number) {
    return this.investmentsService.getBackings(id);
  }

  @Get(':id/total')
  getTotalBacked(@Param('id', ParseIntPipe) id: number) {
    return this.investmentsService.getTotalBacked(id);
  }

  @Get('users/:userId/backings')
  getUserBackings(@Param('userId', ParseIntPipe) userId: number) {
    return this.investmentsService.getUserBackings(userId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInvestmentDto: Prisma.InvestmentUpdateInput,
  ) {
    return this.investmentsService.update(id, updateInvestmentDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.investmentsService.remove(id);
  }
}