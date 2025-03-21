FROM node:23-alpine AS build

ARG username="appuser"
ARG unique_id=3125

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm ci  && \
    adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${unique_id}" \
    "${username}"  


COPY --chown=${username}:${username} . .

RUN npm run db:generate \
    && npm run cert:jwe \
    && npm run cert:jws:auth \
    && npm run cert:jws:fp 


FROM gcr.io/distroless/nodejs22-debian12

ARG username="appuser"

# TODO: Include All ENV 
ENV DATABASE_URL="" \
    LOG_LEVEL="info" \
    LOG_OUTPUT="console"

WORKDIR /app

COPY --from=build /etc/passwd /etc/passwd
COPY --from=build /etc/group /etc/group

USER root

COPY --chown=${username}:${username} --from=build /app .

USER ${username}:${username}

CMD [ "src/index.js" ]