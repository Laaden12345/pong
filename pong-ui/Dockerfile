FROM node:18-alpine

COPY package*.json /app/

WORKDIR /app

RUN npm install

COPY . .

EXPOSE ${FRONTEND_PORT}

CMD ["npm", "run", "dev"]
