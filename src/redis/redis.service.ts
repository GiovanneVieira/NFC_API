import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor() {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
    this.client = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
    });

    this.client.on('connect', () => {
      this.logger.log('Redis conectado');
    });

    this.client.on('error', (err) => {
      this.logger.warn(`Redis erro: ${err.message}`);
    });
  }

  async set(key: string, value: string, ttlMs: number): Promise<boolean> {
    try {
      const result = await this.client.set(key, value, 'PX', ttlMs, 'NX');
      return result === 'OK';
    } catch (error) {
      this.logger.warn(
        `Redis SET falhou | key=${key} | error=${(error as Error).message}`,
      );
      return false;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.warn(
        `Redis GET falhou | key=${key} | error=${(error as Error).message}`,
      );
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      this.logger.warn(
        `Redis DEL falhou | key=${key} | error=${(error as Error).message}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
    this.logger.log('Redis conexao encerrada');
  }
}
