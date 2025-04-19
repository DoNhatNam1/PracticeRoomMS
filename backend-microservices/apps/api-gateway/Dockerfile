FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build api-gateway

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist/apps/api-gateway ./dist
COPY --from=build /app/node_modules ./node_modules

USER node

EXPOSE 3000
CMD ["node", "dist/main"]