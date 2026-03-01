import {
	BadRequestException,
	Injectable,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { AuthDTO } from './dto/auth.dto';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
	EXPIRE_DAY_REFRESH_TOKEN = 1;
	REFRESH_TOKEN = 'refreshToken';

	constructor(
		private jwt: JwtService,
		private userService: UserService,
		private prisma: PrismaService,
		private configService: ConfigService
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

	async getNewTokens(refreshToken: string) {
		const result = await this.jwt.verifyAsync(refreshToken);
		if (!result) throw new UnauthorizedException('Invalid refresh token');
		const user = await this.userService.getByID(result.id);
		const tokens = this.issueTokens(user.id);
		return { user, ...tokens };
	}

	issueTokens(userID: string) {
		const data = { id: userID };

		const accessToken = this.jwt.sign(data, {
			expiresIn: '1h'
		});

		const refreshToken = this.jwt.sign(data, {
			expiresIn: '7d'
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

	async validateOAuthLogin(req: any) {
		let user = await this.userService.getByEmail(req.user.email);
		//
		if (!user) {
			user = await this.prisma.user.create({
				data: {
					email: req.user.email,
					name: req.user.name,
					picture: req.user.picture
				},
				include: {
					stores: true,
					favorites: true,
					orders: true
				}
			});
		}
		const tokens = this.issueTokens(user.id);
		return { user, ...tokens };
	}

	/**
	 *
	 * @param res
	 * @param refreshToken
	 */
	addRefreshTokenToResponse(res: Response, refreshToken: string) {
		const expiresIn = new Date();
		expiresIn.setDate(expiresIn.getDate() + this.EXPIRE_DAY_REFRESH_TOKEN);

		res.cookie(this.REFRESH_TOKEN, refreshToken, {
			httpOnly: true,
			domain: this.configService.get('SERVER_DOMAIN'),
			expires: expiresIn,
			secure: true,
			sameSite: 'none'
		});
	}

	/**
	 *
	 * @param res
	 */
	removeRefreshTokenFromResponse(res: Response) {
		res.cookie(this.REFRESH_TOKEN, '', {
			httpOnly: true,
			domain: this.configService.get('SERVER_DOMAIN'),
			expires: new Date(0),
			secure: true,
			sameSite: 'none'
		});
	}
}
