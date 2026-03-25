FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl dos2unix

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate && npm run build

COPY entrypoint.sh /entrypoint.sh
RUN dos2unix /entrypoint.sh && chmod +x /entrypoint.sh

EXPOSE 5000

CMD ["/entrypoint.sh"]