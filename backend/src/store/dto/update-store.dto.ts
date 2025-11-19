import { IsString } from 'class-validator';
import { CreateStoreDTO } from './create-store.dto';

export class UpdateStoreDTO extends CreateStoreDTO {
	@IsString({
		message: 'Description is required'
	})
	description: string;
}
