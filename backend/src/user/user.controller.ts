import { Controller, Get, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from './decorators/user.decorator';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Auth()
	@Get('profile')
	async getProfile(@CurrentUser('id') id: string) {
		return this.userService.getByID(id);
	}

	@Auth()
	@Patch('profile/favorites/:productID')
	async toggleFavorites(
		@CurrentUser('id') userID: string,
		@Param('productID') productID: string
	) {
		return this.userService.togglleFavorite(productID, userID);
	}
}
