/**
 * Transforma a string do .env em um array limpo de strings.
 * Usado diretamente no CORS nativo do NestJS (main.ts).
 */
export function getCleanOrigins(rawOrigins: string | undefined): string[] {
  return rawOrigins
    ? rawOrigins.split(',').map((o) => o.trim()).filter(Boolean)
    : ['http://localhost:8081', 'http://localhost:3000'];
}

/**
 * Retorna a função de callback dinamicamente para o Better Auth.
 * Reaproveita a função de limpeza acima para evitar código duplicado.
 */
export function createTrustedOriginsChecker(rawOrigins: string | undefined) {
  // Reaproveitando a função de cima 
  const allowedOrigins = getCleanOrigins(rawOrigins);

  return (request: any) => {
    const origin = request?.headers?.get?.('origin') || request?.headers?.origin;

    if (!origin) return allowedOrigins;

    // Validação dinâmica do túnel do Expo
    if (origin.includes('exp.direct')) {
      const isExpoTunnel = /\.exp\.direct$/.test(origin);
      if (isExpoTunnel) {
        return [...allowedOrigins, origin];
      }
    }

    return allowedOrigins;
  };
}