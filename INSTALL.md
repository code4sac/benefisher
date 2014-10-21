# Installation

## OS X/Linux
(Assumes you've already installed node, npm, and git)
1. Fork and clone the repository.
2. Install the grunt CLI tool: `npm install -g grunt-cli`
3. Install server-side dependencies: `npm install`
4. Install client-side dependencies: `grunt build`
5. [Setup a Mapbox map](https://www.mapbox.com/help/creating-new-map/) to use in your development environment.
6. Create a database for your development environment and another database for your test environment.
7. Copy the `.env.dist` file to a file called `.env`, and update the Mapbox and DB parameters in that file with your Mapbox and database info.
8. Copy the `.env` file to a file called `.env.test` and update the DB parameters with your test database info.
9. Start the local test server: `grunt dev`
10. [Test it out](http://localhost:3000)

## Windows
TODO
