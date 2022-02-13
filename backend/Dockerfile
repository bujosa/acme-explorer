FROM node:16-alpine
ARG BUILD

WORKDIR /backend
RUN npm install -g nodemon
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "run", "dev"]