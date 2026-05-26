import { Controller } from '@nestjs/common';
import { AuthService } from './auth';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
}
