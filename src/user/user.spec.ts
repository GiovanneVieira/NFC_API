import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserService } from './user';
import { UserMapper } from 'src/mapper/usermapper';
import {
  createPrismaMock,
  prismaMockProvider,
  PrismaMock,
} from 'src/common/testing/prisma-mock';

const userRow = (over: Partial<any> = {}) => ({
  id: 'u1',
  email: 'a@x.com',
  name: 'Lucas Silva Souza',
  RA: '202501',
  role: 'STUDENT',
  course: null,
  cpf: null,
  cardValidity: null,
  image: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  ...over,
});

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, UserMapper, prismaMockProvider(prisma)],
    }).compile();
    service = module.get(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserByIdOrThrow', () => {
    it('lança NotFound quando não existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(service.getUserByIdOrThrow('u1')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('retorna o usuário e deriva firstName', async () => {
      prisma.user.findUnique.mockResolvedValue(userRow());
      const result = await service.getUserByIdOrThrow('u1');
      expect(result.id).toBe('u1');
      expect(result.firstName).toBe('Lucas');
    });
  });

  describe('updateCarteirinha', () => {
    it('lança NotFound quando o usuário não existe', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      await expect(
        service.updateCarteirinha('u1', { course: 'ADS' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('atualiza os dados da carteirinha', async () => {
      prisma.user.findUnique.mockResolvedValue(userRow());
      prisma.user.update.mockResolvedValue(
        userRow({ course: 'ADS', cpf: '12345678901' }),
      );
      const result = await service.updateCarteirinha('u1', {
        course: 'ADS',
        cpf: '12345678901',
        cardValidity: '2027-12-31T00:00:00.000Z',
      });
      expect(prisma.user.update).toHaveBeenCalled();
      expect(result.course).toBe('ADS');
      expect(result.cpf).toBe('12345678901');
    });
  });

  describe('getAllUsers', () => {
    it('mapeia a lista de usuários', async () => {
      prisma.user.findMany.mockResolvedValue([
        userRow(),
        userRow({ id: 'u2' }),
      ]);
      const result = await service.getAllUsers();
      expect(result).toHaveLength(2);
      expect(result[1].id).toBe('u2');
    });
  });
});
