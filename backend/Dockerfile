FROM node:20-slim
WORKDIR /usr/src/app

COPY ./ ./

RUN npm i

EXPOSE 3000

CMD [ "npm", "run", "start" ]