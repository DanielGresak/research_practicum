# Set up

1. Download Docker

    - Documentation and links for this can be found at https://docs.docker.com/desktop/.

2. After Docker is installed, pull this git repository and cd into this directory in your terminal.

3. run the following in your terminal: 
    ```
            docker build --tag <name of container> .
    ```

    - name of container can be anything. I used python-django.
    - make sure to include the '.' at the end with a space between the container name and the '.'.
    - This builds the container as set out in the Dockerfile.

4. After the above command finishes, then run the following command:

    ```
        docker run --publish 8000:8000 <name of container>
    ```
         
    - Use the same container name as how you built it first.
    - This runs the project through the docker container.
5. On your browser, go to the webpage http://localhost:8000/ and the website should then show.

## Docker brief summary

Docker is used to ensure that the application works the same no matter which computer it is ran on. It does this by creating it's own environment on your computer. This includes an operating system (in this case it's Linux Alpine). 

It will then download all dependencies using that operating system. The dependencies are outlined in requirements.txt. 

The above command, '8000:8000', tells docker to map whatever the output of the container is in port 8000 to port 8000 of your local machine.

Anytime you are downloading a new dependency, you will need to add it to requirements.txt and run the command in section 3. <mark> TBC </mark>



