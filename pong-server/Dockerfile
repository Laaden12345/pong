FROM node:18-alpine

WORKDIR /app

COPY package*.json .

RUN npm install

EXPOSE ${PUBLIC_BACKEND_PORT}
EXPOSE ${PUBLIC_WEBSOCKET_PORT}

CMD ["npm", "run", "dev"]