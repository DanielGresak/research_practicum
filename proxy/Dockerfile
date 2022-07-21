FROM nginxinc/nginx-unprivileged:1-alpine

COPY ./default.conf /etc/nginx/conf.d/default.conf

COPY ./uwsgi_params /etc/nginx/uwsgi_params

COPY ./certs ./etc/nginx/certs


USER root

RUN mkdir -p /vol/static
RUN chmod 755 /vol/static
RUN cd /etc/nginx/certs/
RUN cat certificate.crt ca_bundle.crt >> certificate.crt
USER nginx
