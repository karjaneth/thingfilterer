# Thing Filterer

A Web Application for Filtering Things (specifically Countries).

## Running

You can run Thing Filterer locally either directly with `node` or using `docker`.

### Node

Ensure you have Node.js installed, then run...

```bash
npm start
```

It will listen on port `80` by default. You can press `ctrl+c` to exit.

### Docker

Ensure you have Docker installed, then run something like...

```bash
sudo docker build -t thingfilterer .
sudo docker run -it -p8888:80 thingfilterer
```

In this example, it will listen on port `8888` of your machine, bound to port
`80` in the container. You can press `ctrl+c` to exit.

## Using

Navigate to `localhost:port`. You can type part of a country name to narrow down
the list, and click any country to see more details. The data is pulled from an
open API, supplemented with some additional data.
