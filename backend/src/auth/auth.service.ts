import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthDTO } from './dto/auth.dto';

@Injectable()
export class AuthService {
	constructor(
		private jwt: JwtService,
		private userService: UserService,
		private prisma: PrismaService
	) {}

	async login(dto: AuthDTO) {
		const user = await this.validateUser(dto);
		const tokens = this.issueTokens(user.id);
		return { user, ...tokens };
	}

	async register(dto: AuthDTO) {
		const oldUser = await this.userService.getByEmail(dto.email);
		if (oldUser) throw new BadRequestException('User not found!');
		const user = await this.userService.create(dto);
		const tokens = this.issueTokens(user.id);
		return { user, ...tokens };
	}

	issueTokens(userID: string) {
		const data = { id: userID };

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		});

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '1h'
		});
		return { accessToken, refreshToken };
	}

	private async validateUser(dto: AuthDTO) {
		const user = await this.userService.getByEmail(dto.email);
		if (!user) {
			throw new NotFoundException('User not found!');
		}
		return user;
	}
}
