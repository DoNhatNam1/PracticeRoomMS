FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run prisma:generate
RUN npm run build user-service

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist/apps/user-service ./dist
COPY --from=build /app/node_modules ./node_modules

RUN mkdir -p /app/uploads && \
    chown -R node:node /app && \
    chmod -R 755 /app/uploads

USER node

EXPOSE 3001
CMD ["node", "dist/main"]