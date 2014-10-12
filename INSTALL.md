# Installation

## OS X/Linux
1. Fork and clone the repository.
2. Install the grunt CLI tool: `npm install -g grunt-cli`
3. Install server-side dependencies: `npm install`
4. Install client-side dependencies: `grunt build`
5. [Setup a Mapbox map](https://www.mapbox.com/help/creating-new-map/) to use in your development environment.
6. Copy the `.env.dist` file to a file called `.env`, and update the `MAPBOX_ID` and `MAPBOX_TOKEN` parameters in that file with your Mapbox map ID and API token.
7. Create a database for your development environment.
8. Copy the `config/config.json.dist` file to a file called `config/config.json` and update the parameters with your development database info.
9. Start the local test server: `grunt dev`
10. [Test it out](http://localhost:3000)

## Windows
TODO