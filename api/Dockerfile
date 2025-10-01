FROM node:20-alpine

WORKDIR /api

COPY package*.json /api/

RUN npm install

COPY . /api/

EXPOSE 80

CMD ["npm", "start"]