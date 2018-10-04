'use strict';

const express = require('express');
const axios = require('axios');


// a method to strip diacritic marks for more consistent string comparison
function sanitize(s) {
    return s
        .toString() // just in case...
        .normalize('NFD') // decompose combined graphemes to separate parts
        .replace(/[\u0300-\u036f]/g, "") // strip unicode diacritics
        .toLocaleLowerCase('en-US'); // lowercase with locale awareness
}


class ThingFilterer {
    constructor(config) {
        this.app = express();

        // set up routes
        this.app.use('/', express.static(`${__dirname}/static/`));
        this.app.get('/filter/', this.filter.bind(this));
        this.app.get('/details/:code', this.details.bind(this));
    }

    // takes a search string and returns an object with either a `results`
    // property having a list of matches (full name, country code, and flag
    // url) or an `error` property with an error message
    async filter(req, res) {
        // an empty query should match nothing
        if (!req.query.q) {
            res.json({ results: [] });
            return;
        }

        // get our list of countries and deal with errors
        let countries;
        try {
            countries = await this._get_countries();
        } catch (e) {
            console.error(e);
            res.json({ error: e.message });
            return;
        }

        try {
            // process the data to get our results
            let results = countries
                // pick off just the fields we need
                .map(c => ({
                    name: c.countryName,
                    code: c.countryCode,
                    flag: c.flag,
                }))

                // just keep those whose name includes the search string
                .filter(c => sanitize(c.name).includes(sanitize(req.query.q)))

                // sort alphabetically by name
                .sort((a, b) => a.name.localeCompare(b.name));

            res.json({ results });
        } catch (e) {
            console.error(e);
            res.json({ error: 'An unknown error occured. Please try again or contact the maintainer.' });
        }
    }

    // takes a country code and returns an object with either a `details`
    // property containing all the details we have on that country, or an
    // `error` property with an error message
    async details(req, res) {
        // we'll use the ISO 3166-1 country codes
        // https://en.wikipedia.org/wiki/ISO_3166-1#Current_codes
        // another option would be the FIPS country codes
        // https://en.wikipedia.org/wiki/List_of_FIPS_country_codes

        let code = req.params.code;

        // get our list of countries and deal with errors
        let countries;
        try {
            countries = await this._get_countries();
        } catch (e) {
            console.error(e);
            res.json({ error: e.message });
            return;
        }

        // find the one that matches the code we were given, if any
        let details = countries.find(c => sanitize(c.countryCode) === sanitize(code));

        if (details) {
            res.json({ details });
        } else {
            // if we didn't get a result, log and return an error
            console.error(`No details found for country code ${code}`);
            res.json({ error: `No details found for country code ${code}` });
        }
    }

    // get our list of countries from the external api and cache them
    // so we aren't pounding their servers and using up our credits
    async _get_countries() {
        // if we haven't cached the data yet, do so
        if (!this._countries) {
            // make the api call
            let { data } = await axios.get('http://api.geonames.org/countryInfoJSON?username=karjaneth');

            // http://www.geonames.org/export/webservice-exception.html
            if (data.status) {
                console.error('GeoNames data:', data);
                throw new Error(`GeoNames error ${data.status.value}: ${data.status.message}`);
            }

            // if we're missing this property, something went wrong
            if (!data.geonames) {
                console.error('GeoNames data:', data);
                throw new Error(`GeoNames error: data missing!`);
            }

            // pull off the actual country data
            this._countries = data.geonames;

            // add flag image url, for fun!
            this._countries.forEach(c => {
                c.flag = `https://www.countryflags.io/${c.countryCode}/flat/64.png`;
            });
        }

        // give out the cached data
        return this._countries;
    }

    start() {
        console.log('Starting...');
        this.server = this.app.listen(8888, () => {
            console.log('Thing Filterer is listening on port 8888');
        });
    }

    end() {
        console.log('Ending...');
        this.server.close();
    }
}


module.exports = ThingFilterer;
