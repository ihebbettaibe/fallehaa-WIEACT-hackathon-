import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, ProductType } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ProductsService {
constructor(private readonly databaseService: DatabaseService) {}

async create(createProductDto: { ownerId: number } & Omit<Prisma.ProductCreateInput, 'owner'>) {
const { ownerId, ...productData } = createProductDto;


// 🔍 fetch the user from DB
const user = await this.databaseService.user.findUnique({
  where: { id: ownerId },
  select: { id: true, name: true, email: true, image: true },
});

if (!user) {
  throw new NotFoundException(`User with id ${ownerId} not found`);
}

// ✅ embed real user data in JSON
return this.databaseService.product.create({
  data: {
    ...productData,
    owner: user,
  },
});


}

findAll(filters?: { type?: ProductType; minPrice?: number; maxPrice?: number }) {
return this.databaseService.product.findMany({
where: {
...(filters?.type && { type: filters.type }),
...(filters?.minPrice !== undefined && { price: { gte: filters.minPrice } }),
...(filters?.maxPrice !== undefined && { price: { lte: filters.maxPrice } }),
},
orderBy: { createdAt: 'desc' },
});
}

findOne(id: number) {
return this.databaseService.product.findUnique({
where: { id },
});
}

async findByOwner(ownerId: number) {
const products = await this.databaseService.product.findMany({
orderBy: { createdAt: 'desc' },
});
return products.filter(product => (product.owner as any)?.id === ownerId);
}

update(id: number, updateProductDto: Prisma.ProductUpdateInput) {
return this.databaseService.product.update({
where: { id },
data: updateProductDto,
});
}

remove(id: number) {
return this.databaseService.product.delete({
where: { id },
});
}
}
