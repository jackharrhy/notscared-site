FROM nginx:stable-alpine
RUN apk upgrade --no-cache && apk add --no-cache ca-certificates && update-ca-certificates \
    && rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY public/ /usr/share/nginx/html/
EXPOSE 3000
