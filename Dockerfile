FROM node:16

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci --production
RUN npm cache clean --force

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
