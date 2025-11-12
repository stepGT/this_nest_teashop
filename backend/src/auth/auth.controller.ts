import {
	Body,
	Controller,
	HttpCode,
	Post,
	Res,
	Req,
	UsePipes,
	ValidationPipe,
	UnauthorizedException
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto/auth.dto';
import express from 'express';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(
		@Body() dto: AuthDTO,
		@Res({ passthrough: true }) res: express.Response
	) {
		const { refreshToken, ...response } = await this.authService.login(dto);
		this.authService.addRefreshTokenToResponse(res, refreshToken);
		return response;
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('register')
	async register(
		@Body() dto: AuthDTO,
		@Res({ passthrough: true }) res: express.Response
	) {
		const { refreshToken, ...response } =
			await this.authService.register(dto);
		this.authService.addRefreshTokenToResponse(res, refreshToken);
		return response;
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login/access-token')
	async getNewTokens(
		@Req() req: express.Request,
		@Res({ passthrough: true }) res: express.Response
	) {
		const refreshTokenFromCookie =
			req.cookies[this.authService.REFRESH_TOKEN];

		if (!refreshTokenFromCookie) {
			this.authService.removeRefreshTokenFromResponse(res);
			throw new UnauthorizedException("Refresh token didn't pass");
		}

		const { refreshToken, ...response } =
			await this.authService.getNewTokens(refreshTokenFromCookie);

		this.authService.addRefreshTokenToResponse(res, refreshToken);
		return response;
	}

	@HttpCode(200)
	@Post('logout')
	async logout(@Res({ passthrough: true }) res: express.Response) {
		this.authService.removeRefreshTokenFromResponse(res);
		return true;
	}
}
