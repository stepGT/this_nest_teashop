import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AuthDTO } from '../auth/dto/auth.dto';
import { hash } from 'argon2';

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async getByID(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			include: {
				stores: true,
				favorites: true,
				orders: true
			}
		});
		if (!user) throw new NotFoundException('User not found!');
		return user;
	}

	async getByEmail(email: string) {
		const user = await this.prisma.user.findUnique({
			where: { email },
			include: {
				stores: true,
				favorites: true,
				orders: true
			}
		});
		return user;
	}

	async toglleFavorite(productID: string, userID: string) {
		const user = await this.getByID(userID);
		const isExist = user.favorites.some(
			product => product.id === productID
		);
		await this.prisma.user.update({
			where: {
				id: user.id
			},
			data: {
				favorites: {
					[isExist ? 'disconnect' : 'connect']: {
						id: productID
					}
				}
			}
		});
		return true;
	}

	async create(dto: AuthDTO) {
		return this.prisma.user.create({
			data: {
				name: dto.name,
				email: dto.email,
				password: await hash(dto.password)
			}
		});
	}
}
