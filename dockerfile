# ── ESTÁGIO 1: Compilação (Builder) ──
FROM node:22-alpine AS builder

WORKDIR /app

# Instala a biblioteca necessária para o Prisma Engine correr no Alpine Linux
RUN apk add --no-cache libc6-compat

# Copia os ficheiros de dependências
COPY package*.json ./

# ALTERAÇÃO AQUI: Mudamos de 'npm ci' para 'npm install' para ser mais tolerante com o lockfile
RUN npm install

# Copia a pasta do Prisma e gera o Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Copia o resto do código fonte do projeto
COPY . .

# Compila o NestJS de TypeScript para JavaScript (gera a pasta /dist)
RUN npm run build

# Remove as dependências de desenvolvimento para deixar a imagem leve
RUN npm prune --production

# ── ESTÁGIO 2: Execução em Produção (Runner) ──
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copia apenas o código compilado e as dependências limpas do estágio anterior
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# 🚀 ADICIONE ESTA LINHA AQUI EMBAIXO:
COPY --from=builder /app/prisma.config.ts ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]