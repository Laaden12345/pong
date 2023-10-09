FROM node:18

WORKDIR /app

COPY package*.json .

RUN npm install

EXPOSE 7777

CMD ["npm", "run", "dev"]