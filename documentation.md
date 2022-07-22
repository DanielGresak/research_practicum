# Documentation
## Table of contents

1. [Setup and Docker](#set-up)
2. [Django](#django)
3. [Testing](#testing)
4. [Virtual Machine](#virtual-machine)
5. [Deployment](#deployment)

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

If you want to run the application in deployment mode, use the following command:

```
docker-compose -f docker-compose-deploy.yml up --build
```

Then go to localhost (no need for specifying port as it is running on port 80)

To rebuild the docker-compose-deploy file:

```
docker compose -f docker-compose-deploy.yml build --no-cache

```

## Django

## Testing

Application testing is important when making changes to the application to make sure we don't inadvertantly create bugs in the application. 

To do this, we first need the application working in the background so that we can test the front-end using selenium. Firstly, make sure you have selenium  and webdriver installed locally.

The application can then be run in the background using `docker-compose up -d`.

Then make sure you're in the initial core directory.
You can then run `python manage.py test`

This will run all tests, you should also see a browser pop up briefly and go through the website a few times. 

(Below won't work at the moment)
Then run:

```
docker exec -ti researchpracticum_app_1 sh -c "python manage.py test"
```
For testing coverage run:

1. python -m coverage run manage.py test
2. python -m coverage report
3. python -m coverage html

## Django Extension in VS-Code
The following Django Extension aims to speed up coding by highlighting code snippets in Django-html. 
![Django extension install](/doc_images/Django_extension_install.png) 
While this extension is unquestionably useful, it has it flaws; in fact, it violates the
HTML autocomplete function in VS-Code, meaning that the intellisense feature known from VS-Code stops working. Luckily there is a workaround, and to fix this issue proceed as follows:
1. Install Django extension as shown above
2. Open the **Workspace** settings.json in VS-Code
3. Type the following code into the settings.json and save:
![Django extension settings](/doc_images/Django_VSCode_settings_json.png)     
4. Go to Preferences --> Settings and search for "emmet include"
5. Add the the following item as shown in screenhot
![Django extension emmet](/doc_images/Django_extension_emmet.png) 
6. From now on, the VS-Code intellisense should work as usual.


## Virtual Machine
### Connecting VS-Code to the VM using SSH

1. To connect to the virtual machine with VS code, we first need to download the private key "vm-team-16-tt.key" and store it in /Users/\<username>/.ssh (For Mac users: show hidden directories by pressing Command + Shift + . )
2. Open VS code and install the extension 'Remote Development'.
3. Press the green icon at the very bottom left of the screen, and then in the dropdown press on 'Open SSH configuration file.
4. Edit the configuration file to look like the following:

```
Host ubuntuVM16
    HostName ipa-017.ucd.ie
    User student
    IdentityFile <Path to private key>
```
5. Save the file and then in the same dropdown, click on 'Connect to host'
6. Choose the host named 'ubuntuVM16' and then type in the passphrase.

### Solved: issues for Mac users when hooking up VS-Code with the VM 
The passphrase is requested every time VS-Code is opened. To solve this issue let's first enable the login terminal to get more information about the underlying problem:
1. In VS-Code go to View -> Command Palette
2. Type in SSH and you'll see some settings options for SSH appear
3. Select "Remote-SSH: Settings" (a page opens up with loads of settings for SSH)
4. Scroll down to towards the end and look for a setting "Remote.SSH: Show Login Terminal"
5. Tick this option
6. Try to connect again to the VM and see what's being outputed in the login terminal. You might see something like this:
![SSH login error on Mac](/doc_images/Mac_ssh_key_issue.jpeg)
7. Go to /Users/\<username>/.ssh directory and right click on the private key "vm-team-16-tt.key" and open "Get Info". In "Sharing & Permissions" only assign the "read & write" privelege to your own user set all other listed users to "No Access". In my case I had to delete the "staff" group as it wouldn't allow me to assign "No Access" to this group.
8. Now the problem should be solved and you're good to go. 



## Deployment

To deploy the application on the ucd virtual machine, you first have to sign onto the UCD vm through your terminal

This can be done by typing in:
```
ssh student@ipa-017.ucd.ie
```

And then putting in the password.

You can then change into the research practicum directory.

Check to see if the application is currently running. This can be done by inputting `docker ps`. If there is any containers running you can run `docker kill <container-name>`.

At this stage if you would like you can pull any changes from git.

Then you can run:

```
docker-compose -f docker-compose-deploy.yml up --build
```

This will run the application in the foreground. To run it in the background, just add `-d` at the end of the script above.

Once this is done you can exit the vm anytime by typing exit and the application should still be running if you added the `-d`.