FROM node:16-alpine
ARG BUILD
ENV BUILD=${BUILD}

WORKDIR /backend
RUN npm install -g nodemon
COPY package*.json ./
RUN npm install
COPY . .

CMD if [ "$BUILD" = "production" ] ; then npm start ; else npm run dev ; fi