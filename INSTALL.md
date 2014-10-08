# Installation

## OS X/Linux
1. Fork and clone the repository.
2. Install server-side dependencies: `npm install`
3. Install client-side dependencies: `node_modules/bower/bin/bower install`
4. Install the grunt CLI tool: `npm install -g grunt-cli`
5. [Setup a Mapbox map](https://www.mapbox.com/help/creating-new-map/) to use in your development environment.
6. Copy the `.env.dist` file to a file called `.env`, and update the `MAPBOX_ID` and `MAPBOX_TOKEN` parameters in that file with your Mapbox map ID and API token.
7. Start the local test server: `grunt dev`
8. [Test it out](http://localhost:3000)

## Windows
TODO