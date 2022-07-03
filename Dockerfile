FROM node:12-alpine

ARG BASE_URL=/
ENV PE_BASE_URL=${BASE_URL}

ENV APP_ROOT /app

RUN mkdir ${APP_ROOT}
WORKDIR ${APP_ROOT}

ADD ./package.json ${APP_ROOT}/package.json
ADD ./package-lock.json ${APP_ROOT}/package-lock.json
RUN npm install

ADD . ${APP_ROOT}

RUN npm run build

EXPOSE 3000

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

CMD [ "npm", "start" ]