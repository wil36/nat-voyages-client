FROM nginx1.28.0-alpine
COPY index.html /usr/share/nginx/html/
EXPOSE 80