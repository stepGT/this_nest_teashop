import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { AuthDTO } from '../auth/dto/auth.dto'
import { hash } from 'argon2'

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
		})
		return user
	}

	async getByEmail(email: string) {
		const user = await this.prisma.user.findUnique({
			where: { email },
			include: {
				stores: true,
				favorites: true,
				orders: true
			}
		})
		return user
	}

	async create(dto: AuthDTO) {
		return this.prisma.user.create({
			data: {
				name: dto.name,
				email: dto.email,
				password: await hash(dto.password)
			}
		})
	}
}
