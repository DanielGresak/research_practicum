FROM python:3.9-buster
ENV PATH="/scripts:${PATH}"
ENV PYTHONUNBUFFERED=1


# RUN apt-get install mysql-shell
# RUN apt-get install --no-cache mariadb-connector-c-dev
# RUN apt-get update && apt-get install python3 python3-dev mariadb-dev build-base && pip3 install mysqlclient && apt-get del python3-dev mariadb-dev build-base
# RUN apt-get install netcat-openbsd

# RUN apt-get install chromium
COPY requirements.txt requirements.txt

# RUN apt-get install --update --no-cache --virtual .tmp gcc libc-dev linux-headers
RUN pip install -r requirements.txt

# Deleting module once not needed
# RUN apt-get del .tmp

RUN mkdir /core
COPY ./core /core
WORKDIR /core

COPY ./scripts /scripts

#Allowing all scripts to be executable
RUN chmod +x /scripts/*

#creating static and media folders in docker image
RUN mkdir -p /vol/web/media
RUN mkdir -p /vol/web/

# installing user as best practice is to not use the root user
RUN adduser user
RUN chown -R user:user /vol

RUN chmod -R 755 /vol/web

# Changing to user
USER user 

CMD ["entrypoint.sh"]
