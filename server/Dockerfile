FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm install -g nodemon

EXPOSE 5000

CMD ["npm", "run", "devStart"]
