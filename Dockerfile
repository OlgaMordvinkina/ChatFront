FROM nginx:alpine

ADD nginx/default.conf /etc/nginx/conf.d/default.conf

ADD ./dist/chat-front /build