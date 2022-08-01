FROM python:3.9-buster
ENV PATH="/scripts:${PATH}"
ENV PYTHONUNBUFFERED=1

COPY requirements.txt requirements.txt
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
