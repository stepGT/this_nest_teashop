import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class AuthDTO {
	@IsOptional()
	@IsString()
	name: string

	@IsString({
		message: 'Mail is required'
	})
	@IsEmail()
	email: string

	@MinLength(6, {
		message: 'Password must be at least 6 characters long!'
	})
	@IsString({
		message: 'Password is required'
	})
	password: string
}
