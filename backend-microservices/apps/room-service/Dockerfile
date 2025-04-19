FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build rooms

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist/apps/rooms ./dist
COPY --from=build /app/node_modules ./node_modules

USER node

EXPOSE 3002
CMD ["node", "dist/main"]