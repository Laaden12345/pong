FROM node:18

COPY package*.json /app/

WORKDIR /app

RUN npm install

COPY . /app

EXPOSE 3000

CMD ["npm", "run", "dev"]
