import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { Session, Roles } from '@thallesp/nestjs-better-auth';
import type { UserSession } from '@thallesp/nestjs-better-auth';
import { UserService } from './user';
import { UserMapper } from 'src/mapper/usermapper';
import { UserResponseDTO } from 'src/dto/user/UserResponseDTO';
import { UpdateCarteirinhaDTO } from 'src/dto/user/UpdateCarteirinhaDTO';
import { Role } from 'src/model/UserModel';
import { auth } from 'src/auth/auth';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userMapper: UserMapper,
  ) {}

  /** Dados do usuário autenticado (usado na carteirinha e na saudação do app). */
  @Get('me')
  async me(
    @Session() session: UserSession<typeof auth>,
  ): Promise<UserResponseDTO> {
    const user = await this.userService.getUserByIdOrThrow(session.user.id);
    return this.userMapper.toResponse(user);
  }

  @Get()
  @Roles([Role.TEACHER])
  async listarTodos(): Promise<UserResponseDTO[]> {
    const users = await this.userService.getAllUsers();
    return users.map((u) => this.userMapper.toResponse(u));
  }

  @Get(':id')
  async buscarPorId(@Param('id') id: string): Promise<UserResponseDTO> {
    const user = await this.userService.getUserByIdOrThrow(id);
    return this.userMapper.toResponse(user);
  }

  @Patch(':id/carteirinha')
  @Roles([Role.TEACHER])
  async atualizarCarteirinha(
    @Param('id') id: string,
    @Body() dto: UpdateCarteirinhaDTO,
  ): Promise<UserResponseDTO> {
    const user = await this.userService.updateCarteirinha(id, dto);
    return this.userMapper.toResponse(user);
  }
}
