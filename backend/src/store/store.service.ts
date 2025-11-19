import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateStoreDTO } from './dto/create-store.dto';
import { UpdateStoreDTO } from './dto/update-store.dto';
import { Store } from '../../generated/prisma/index';

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

	async create(userID: string, DTO: CreateStoreDTO) {
		return await this.prisma.store.create({
			data: {
				title: DTO.title,
				userID,
				email: ''
			}
		});
	}

	async update(storeID: string, userID: string, DTO: UpdateStoreDTO) {
		await this.getByID(storeID, userID);
		return this.prisma.store.update({
			where: {
				id: storeID
			},
			data: {
				...DTO,
				userID
			}
		});
	}

	async delete(storeID: string, userID: string) {
		await this.getByID(storeID, userID);
		return this.prisma.store.delete({
			where: {
				id: storeID
			}
		});
	}
}
