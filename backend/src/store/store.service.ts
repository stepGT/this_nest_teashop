import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class StoreService {
	constructor(private prisma: PrismaService) {}

	async getByID(storeID: string, userID: string) {
		const store = await this.prisma.store.findUnique({
			where: { id: storeID, userID }
		});
		if (!store)
			throw new NotFoundException(
				'The store was not found or you are not the owner!'
			);
		return store;
	}
}
