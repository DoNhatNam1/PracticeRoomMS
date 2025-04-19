FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build computers

FROM node:20-alpine AS production

WORKDIR /app

COPY --from=build /app/package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist/apps/computers ./dist
COPY --from=build /app/node_modules ./node_modules

USER node

EXPOSE 3003
CMD ["node", "dist/main"]