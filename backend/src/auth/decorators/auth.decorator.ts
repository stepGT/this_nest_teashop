import { UseGuards } from '@nestjs/common';
import { JWTAuthGuard } from '../guards/jwt-auth.guards';

export const Auth = () => UseGuards(JWTAuthGuard);
