import { IsString } from 'class-validator';

export class CreateStoreDTO {
	@IsString({
		message: 'Name is required'
	})
	title: string;
}
