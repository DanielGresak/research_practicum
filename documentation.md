# Documentation
## Table of contents

1. [Setup and Docker](#set-up)
2. [Django](#django)
3. [Testing](#testing)
## Set up

1. Download Docker

    - Documentation and links for this can be found at https://docs.docker.com/desktop/.

2. After Docker is installed, pull this git repository and cd into this directory in your terminal.

3. run the following in your terminal: 
    ```
            docker-compose up
    ```

4. On your browser, go to the webpage http://localhost:8000/ and the website should then show.

### Docker brief summary

Docker is used to ensure that the application works the same no matter which computer it is ran on. It does this by creating it's own environment on your computer. This includes an operating system (in this case it's Linux Alpine). 

It will then download all dependencies using that operating system. The dependencies are outlined in requirements.txt. 

The command in part 3 builds, recreates, starts and attaches to containers for a service. This is outlined in the docker-compose.tml file. If the container and images already exists it will just run the command outlined in the file which is:

```
python manage.py runserver 0.0.0.0:8000
```

More information on docker-compose can be found [here.](https://docs.docker.com/compose/reference/up/)


Anytime you are downloading a new dependency, you will need to add it to requirements.txt and run the command in section 3. <mark> TBC </mark>

## Django

## Testing

Application testing is important when making changes to the application to make sure we don't inadvertantly create bugs in the application. 

To do this, make sure you're in the root directory and run the following command:

```
python manage.py test
```

This will run all tests in the testing folder and give the results within the console. This will be run locally for now. I will look into running it through the Docker container.