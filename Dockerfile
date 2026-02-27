FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate && npm run build