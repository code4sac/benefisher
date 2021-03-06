# Installation

## OS X/Linux

###Development Tools
To get started setting up your own instance of Benefisher, we first need to get some installation out of the way.
The following things will need to be installed before we can continue. You will need:

  1. [Node.js](https://github.com/joyent/node/wiki/installing-node.js-via-package-manager)
  2. Node Package Manager (Should be installed along with Node.js)
  3. [Git](https://help.github.com/articles/set-up-git/)
  4. [MySQL](http://dev.mysql.com/doc/refman/5.0/en/macosx-installation.html)

###Ohana API  
You will also need access to an [Ohana API](http://ohanapi.org/) instance. Benefisher is currently designed to work with v3.0.0 of the Ohana API.

###Benefisher
1. Fork and clone the repository.
 
2. Install the grunt CLI tool: `npm install -g grunt-cli`

3. Install server-side dependencies: `npm install`

4. Install client-side dependencies: `grunt build`

5. [Setup a Mapbox map](https://www.mapbox.com/help/creating-new-map/) to use in your development environment.

6. Create a database for your development environment and another database for your test environment.

7. Copy the `.env.dist` file to a file called `.env`, and update the Mapbox and DB parameters in that file with your Mapbox, database info, and Ohana API URL.

8. Copy the `.env` file to a file called `.env.test` and update the DB parameters with your test database info and Ohana API URL.

9. Start the local test server: `grunt dev`

10. [Test it out](http://localhost:3000)

## Windows
Once Git, Node, NPM, and MySQL are installed, you can use [Git Bash](http://msysgit.github.io/) to complete the install using the OS X instructions.

# Deployment

##AWS Elastic Beanstalk
The following assumes you've already cloned the Benefisher repository, and are issuing commands from the project directory.

1. Download and install the [Elastic Beanstalk command line tool](http://aws.amazon.com/code/6752709412171743).

2. Initialize your Elastic Beanstalk instance: `eb init`.

  a. Enter your AWS Access Key and your AWS Secret Key (Use [IAM](http://docs.aws.amazon.com/IAM/latest/UserGuide/ManagingCredentials.html) to create new access keys for yourself if needed).

  b. Enter a name for your application.

  c. Choose `WebServer::Standard::1.0` as your environment tier.

  d. Choose whether you'd like to set up a load balancer for this instance (recommended for higher traffic installs).

  e. Create an RDS DB instance.

  f. Enter an RDS DB master password.

3. Start your Elastic Beanstalk application: `eb start`.

4. In the AWS console, navigate to the Elastic Beanstalk service, select your application, then click the 'Configuration' menu item on the left. Click the gear icon on 'Software Configuration' box. In the 'Environment Properties' section, add a new property and value for each of the following: API_URL, MAPBOX_ID, and MAPBOX_TOKEN. Database parameters will be set automatically.

5. Deploy your application: `git aws.push`.
