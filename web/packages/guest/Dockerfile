FROM node:22.22-alpine AS development

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
COPY packages/guest/package.json ./packages/guest/package.json
COPY packages/host/package.json ./packages/host/package.json

RUN yarn install

COPY . .

WORKDIR /usr/src/app/packages/guest

EXPOSE 3000

CMD ["yarn", "dev", "--", "--host", "0.0.0.0"]