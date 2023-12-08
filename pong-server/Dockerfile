FROM node:18-bookworm

WORKDIR /app

COPY package*.json .

RUN apt-get update && apt-get install -y build-essential

RUN npm install

EXPOSE ${PUBLIC_BACKEND_PORT}
EXPOSE ${PUBLIC_WEBSOCKET_PORT}

CMD ["npm", "run", "dev"]