import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PresencaService } from './presenca.service';

export interface NfcChamadaPayload {
  cardUid: string;
  receptorId: string;
}

@Controller()
export class PresencaMqttController {
  private readonly logger = new Logger(PresencaMqttController.name);

  constructor(private presencaService: PresencaService) {}

  @MessagePattern('facens/nfc/chamada')
  async handleNfcChamada(@Payload() payload: NfcChamadaPayload): Promise<void> {
    this.logger.debug(
      `MQTT payload received | receptorId=${payload.receptorId} | cardUid=${payload.cardUid}`,
    );

    if (!payload.cardUid || !payload.receptorId) {
      this.logger.warn(
        `MQTT payload invalido | cardUid ou receptorId ausente | raw=${JSON.stringify(payload)}`,
      );
      return;
    }

    try {
      await this.presencaService.registrarViaNfcHardware(
        payload.cardUid,
        payload.receptorId,
      );
    } catch (error) {
      this.logger.warn(
        `Falha ao registrar presenca NFC | cardUid=${payload.cardUid} | error=${(error as Error).message}`,
      );
    }
  }
}
