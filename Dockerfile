# https://nodejs.org/de/docs/guides/nodejs-docker-webapp/

FROM node:16

WORKDIR /usr/src/app

# A wildcard is used to ensure both package.json AND package-lock.json are copied (npm@5+)
COPY package*.json ./

RUN npm ci --only=production

COPY . .

CMD [ "npm", "start" ]

ARG VCS_REF
ARG BUILD_DATE

LABEL \
    org.opencontainers.image.description="This is latest docker image of https://github.com/trolit/Patchron repository." \
    org.opencontainers.image.owner="https://github.com/trolit" \
    org.opencontainers.image.created=$BUILD_DATE \
    org.opencontainers.image.license="ISC" \
	org.opencontainers.image.sha=$VCS_REF \
