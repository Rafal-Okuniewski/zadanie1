ARG VERSION=1.10
FROM node AS build
ARG VERSION
RUN mkdir -p /var/node
WORKDIR /var/node
ADD . ./
RUN npm install

FROM node:fermium-alpine3.15
ENV NODE_ENV="production_${VERSION}"
COPY --from=build /var/node /var/node
WORKDIR /var/node
EXPOSE 8080

RUN echo "Author: Rafał Okuniewski"
CMD [ "node", "server.js" ]
