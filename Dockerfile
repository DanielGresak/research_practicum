FROM python:3.9-alpine
ENV PATH="/scripts:${PATH}"
ENV PYTHONUNBUFFERED=1

RUN apk add --no-cache mariadb-connector-c-dev
RUN apk update && apk add python3 python3-dev mariadb-dev build-base && pip3 install mysqlclient && apk del python3-dev mariadb-dev build-base
RUN apk add netcat-openbsd

RUN apk add chromium
ENV PYTHONUNBUFFERED=1
COPY requirements.txt requirements.txt

RUN apk add --update --no-cache --virtual .tmp gcc libc-dev linux-headers
RUN pip install -r requirements.txt

# Deleting module once not needed
RUN apk del .tmp

RUN mkdir /core
COPY ./core /core
WORKDIR /core

COPY ./scripts /scripts

#Allowing all scripts to be executable
RUN chmod +x /scripts/*

#creating static and media folders in docker image
RUN mkdir -p /vol/web/media
RUN mkdir -p /vol/web/

# Adding user as best practice is to not use the root user
RUN adduser -D user
RUN chown -R user:user /vol

RUN chmod -R 755 /vol/web

# Changing to user
USER user 

CMD ["entrypoint.sh"]
