# pulsar-express

> Simple Web Interface for Apache Pulsar

![Pulsar logo](docs/pulsar.png)


## Install

There are several ways to use `pulsar-express`:
* By cloning the projet and running it locally (see `Development` section)
* By installing it using `npm`
```bash
# Install it globally
$ npm install pulsar-express -g

# Start it
$ pulsar-express

        ╭────────────────╮
        │ PULSAR EXPRESS │
        ╰────────────────╯

        => Open http://localhost:3000


# Start it on a specific port
$ PORT=8000 pulsar-express

        ╭────────────────╮
        │ PULSAR EXPRESS │
        ╰────────────────╯

        => Open http://localhost:8000

```

From there, you can connect with your browser to the url above !

![Pulsar express home](docs/home.png)


### Overview

You can see some basic informations.

![Pulsar express overview](docs/overview.png)


### Clusters

![Pulsar express clusters](docs/clusters.png)

### Topics

![Pulsar express topics](docs/topics.png)

![Pulsar express topics](docs/topic.png)

### Functions

![Pulsar express functions](docs/functions.png)

![Pulsar express function](docs/function.png)


## How to

* First step, you have to define a connection (for sending requests to the API)
  * These connections are stored on client side (localstorage of your browser)
* Then, you can access the clusters, the topics and the functions

## Development

This app has been developed with [Nuxt.js](https://nuxtjs.org).

``` bash
# install dependencies
$ npm install

# serve with hot reload at localhost:3000
$ npm run dev

# build for production and launch server
$ npm run build
$ npm start
```

For detailed explanation on how things work, checkout [Nuxt.js docs](https://nuxtjs.org).



## To do

* Navigation: add a way to change the cluster in each page
* More functions for each items (delete, update, ...)
* Auto refresh
* ...And a lot of things !!!



## Known issues

* When creating a topic, the API response is always 405 Method Not Allowed :(