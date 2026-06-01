import { Test, TestingModule } from '@nestjs/testing';
import { PresencaMqttController } from './presenca-mqtt.controller';
import { PresencaService } from './presenca.service';
import { PresencaModel, PresencaType } from 'src/model/PresencaModel';

const mockPresencaService = {
  registrarViaNfcHardware: jest.fn(),
};

describe('PresencaMqttController', () => {
  let controller: PresencaMqttController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PresencaMqttController],
      providers: [{ provide: PresencaService, useValue: mockPresencaService }],
    }).compile();

    controller = module.get(PresencaMqttController);
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('handleNfcChamada', () => {
    const payload = { cardUid: 'ABC123', receptorId: 'sala-01' };

    it('deve registrar presenca quando payload e valido', async () => {
      const presencaModel = new PresencaModel(
        'p1',
        'aluno-1',
        'aula-1',
        new Date(),
        PresencaType.NFC,
        new Date(),
        new Date(),
        'Lucas',
        '202501',
      );
      mockPresencaService.registrarViaNfcHardware.mockResolvedValue(
        presencaModel,
      );

      await controller.handleNfcChamada(payload);

      expect(mockPresencaService.registrarViaNfcHardware).toHaveBeenCalledWith(
        'ABC123',
        'sala-01',
      );
    });

    it('deve ignorar payload sem cardUid', async () => {
      await controller.handleNfcChamada({ cardUid: '', receptorId: 'sala-01' });

      expect(
        mockPresencaService.registrarViaNfcHardware,
      ).not.toHaveBeenCalled();
    });

    it('deve ignorar payload sem receptorId', async () => {
      await controller.handleNfcChamada({ cardUid: 'ABC123', receptorId: '' });

      expect(
        mockPresencaService.registrarViaNfcHardware,
      ).not.toHaveBeenCalled();
    });

    it('deve capturar erro do service sem lancar', async () => {
      mockPresencaService.registrarViaNfcHardware.mockRejectedValue(
        new Error('Algo deu errado'),
      );

      await expect(
        controller.handleNfcChamada(payload),
      ).resolves.toBeUndefined();
    });

    it('deve retornar null quando debounce bloqueia (service retorna null)', async () => {
      mockPresencaService.registrarViaNfcHardware.mockResolvedValue(null);

      const result = await controller.handleNfcChamada(payload);

      expect(result).toBeUndefined();
      expect(mockPresencaService.registrarViaNfcHardware).toHaveBeenCalledWith(
        'ABC123',
        'sala-01',
      );
    });
  });
});
