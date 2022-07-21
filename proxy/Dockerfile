FROM nginxinc/nginx-unprivileged:1-alpine

COPY ./default.conf /etc/nginx/conf.d/default.conf

COPY ./uwsgi_params /etc/nginx/uwsgi_params

COPY ./certs ./etc/nginx/certs


USER root
RUN cat ./etc/nginx/certs/certificate.crt ./etc/nginx/certs/ca_bundle.crt >> certificate.crt
RUN mkdir -p /vol/static
RUN chmod 755 /vol/static

USER nginx
