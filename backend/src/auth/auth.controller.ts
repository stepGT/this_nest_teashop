import {
	Body,
	Controller,
	HttpCode,
	Post,
	Res,
	Req,
	UsePipes,
	ValidationPipe,
	UnauthorizedException,
	Get,
	UseGuards
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDTO } from './dto/auth.dto';
import type { Response, Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
	constructor(private readonly authService: AuthService) {}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Post('login')
	async login(
		@Body() dto: AuthDTO,
		@Res({ passthrough: true }) res: Response
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
		@Res({ passthrough: true }) res: Response
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
		@Req() req: Request,
		@Res({ passthrough: true }) res: Response
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
	async logout(@Res({ passthrough: true }) res: Response) {
		this.authService.removeRefreshTokenFromResponse(res);
		return true;
	}

	@Get('google')
	@UseGuards(AuthGuard('google'))
	async googleAuth(@Req() _req: any) {}

	@Get('google/callback')
	@UseGuards(AuthGuard('google'))
	async googleAuthCallback(
		@Req() req: any,
		@Res({ passthrough: true }) res: any
	) {
		const { refreshToken, ...response } =
			await this.authService.validateOAuthLogin(req);
		this.authService.addRefreshTokenToResponse(res, refreshToken);
		return res.redirect(
			`${process.env['CLIENT_URL']}/dashboard?accessToken=${response.accessToken}`
		);
	}

	@Get('yandex')
	@UseGuards(AuthGuard('yandex'))
	async yandexAuth(@Req() _req: any) {}

	@Get('yandex/callback')
	@UseGuards(AuthGuard('yandex'))
	async yandexAuthCallback(
		@Req() req: any,
		@Res({ passthrough: true }) res: any
	) {
		const { refreshToken, ...response } =
			await this.authService.validateOAuthLogin(req);
		this.authService.addRefreshTokenToResponse(res, refreshToken);
		return res.redirect(
			`${process.env['CLIENT_URL']}/dashboard?accessToken=${response.accessToken}`
		);
	}
}
