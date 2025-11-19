import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
	UsePipes,
	ValidationPipe
} from '@nestjs/common';
import { StoreService } from './store.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/user/decorators/user.decorator';
import { CreateStoreDTO } from './dto/create-store.dto';
import { UpdateStoreDTO } from './dto/update-store.dto';

@Controller('store')
export class StoreController {
	constructor(private readonly storeService: StoreService) {}

	@Auth()
	@Get('by-id/:id')
	async getByID(
		@Param('id') storeID: string,
		@CurrentUser('id') userID: string
	) {
		return this.storeService.getByID(storeID, userID);
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Auth()
	@Post()
	async create(
		@CurrentUser('id') userID: string,
		@Body() DTO: CreateStoreDTO
	) {
		return this.storeService.create(userID, DTO);
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Auth()
	@Put(':id')
	async update(
		@Param('id') storeID: string,
		@CurrentUser('id') userID: string,
		@Body() DTO: UpdateStoreDTO
	) {
		return this.storeService.update(storeID, userID, DTO);
	}

	@UsePipes(new ValidationPipe())
	@HttpCode(200)
	@Auth()
	@Delete(':id')
	async delete(
		@Param('id') storeID: string,
		@CurrentUser('id') userID: string
	) {
		return this.storeService.delete(storeID, userID);
	}
}
