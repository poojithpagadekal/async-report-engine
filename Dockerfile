FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node dist/server.js"]