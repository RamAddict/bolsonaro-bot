FROM node:16-alpine

RUN apk add libsodium git build-base python3 libtool autoconf automake

WORKDIR /home/node/app
COPY . /home/node/app
RUN npm install
RUN npm run build

CMD [ "npm", "run", "start:production" ]
