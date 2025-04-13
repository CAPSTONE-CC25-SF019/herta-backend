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



FROM node:23-alpine AS final

ARG username="appuser"

# TODO: Include All ENV 
ENV ML_API_BASE_URL="" \
    FRONT_END_BASE_URL="" \
    DATABASE_URL="" \
    LOG_LEVEL="" \
    LOG_OUTPUT="" \
    REFRESH_TOKEN_EXPIRE="" \
    ACCESS_TOKEN_EXPIRE="" \
    JWT_AUTH_NAME="" \
    HASH_SALT="" \
    HASH_SECRET_KEY="" \
    API_VERSION=""

WORKDIR /app

COPY --from=build /etc/passwd /etc/passwd
COPY --from=build /etc/group /etc/group

USER root

COPY --chown=${username}:${username} --from=build /app .

RUN npm run db:generate \
    && npm run cert:jwe \
    && npm run cert:jws:auth \
    && npm run cert:jws:fp

USER ${username}:${username}

ENTRYPOINT ["npm"]
CMD [ "run", "start:dev"]