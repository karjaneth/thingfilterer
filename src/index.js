'use strict';


// get our app
const ThingFilterer = require('./thingfilterer');
let thing_filterer = new ThingFilterer();


// handle various circumstances under which we want to end
process.on('SIGINT', () => {
    console.error('Caught SIGINT, ending...');
    thing_filterer.end();
});

process.on('SIGTERM', () => {
    console.error('Caught SIGTERM, ending...');
    thing_filterer.end();
});

process.on('unhandledRejection', error => {
    console.error('Caught unhandled rejection, logging and ending...');
    console.error(error);
    thing_filterer.end();
    process.exit(1);
});


// kick things off
thing_filterer.start();
