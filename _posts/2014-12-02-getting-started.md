---
layout: post
title:  "Getting Started"
description: "Where do I Start?"
categories: installation
---

To get started setting up your own instance of Benefisher, we first need to get some installation out of the way.
The following things will need to be installed before we can continue. You will need:

  1. Node.js
  2. Node Package Manager (NPM)
  3. GitHub
  4. MySQL

Once these things are installed, continue on ahead.

  1. Fork and clone the repository.
  2. Install the grunt CLI tool: `npm install -g grunt-cli`
  3. Install server-side dependencies: `npm install`
  4. Install client-side dependencies: `grunt build`
  5. Setup a Mapbox map to use in your development environment at the following [Mapbox Site][mapbox].
  6. Create a database for your development environment.
  7. Create another database for your test environment.
  8. Copy the `.env.dist` file to a file called `.env` and another file called `.env.test`
  9. Update the Mapbox and DB parameters in the `.env` file with your Mapbox, database info for the development enviornment, and Ohana API URL.
  10. Do the same in the `.env.test` file, but use the database for your test environment.
  11. Start the local test server: `grunt dev`
  12. [Test it out!][benefisher]

  [mapbox]:       https://www.mapbox.com/help/creating-new-map/
  [benefisher]:   https://google.com
