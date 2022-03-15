FROM nginx:1.21.5-alpine

WORKDIR /frontend
COPY package*.json ./
RUN apk add --no-cache nodejs npm
RUN npm install
COPY . .
COPY config/nginx-frontend.conf /etc/nginx/conf.d/
RUN npm run build