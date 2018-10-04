'use strict';

const express = require('express');
const fake_data = require('./fakedata'); // HACK


// a method to strip diacritic marks for more consistent string comparison
function sanitize(s) {
    return s
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

    // takes a search string and returns a list of
    // matches (full name, country code, and flag url)
    async filter(req, res) {
        // TODO error handling

        // optimize: an empty query should match nothing
        if (!req.query.q) {
            res.json([]);
            return;
        }

        // get our list of countries and process it
        let matches = (await this._get_countries())
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

        res.json(matches);
    }

    // takes a country code and returns all the details
    async details(req, res) {
        // TODO error handling

        // we'll use the ISO 3166-1 country codes
        // https://en.wikipedia.org/wiki/ISO_3166-1#Current_codes
        // another option would be the FIPS country codes
        // https://en.wikipedia.org/wiki/List_of_FIPS_country_codes

        let code = req.params.code;

        // get the data from our cached api data
        let country_data = (await this._get_countries())
            .find(c => c.countryCode === code.toUpperCase());

        res.json(country_data);
    }

    // get our list of countries from the external api and cache them
    // so we aren't pounding their servers and using up our credits
    async _get_countries() {
        // TODO error handling

        // if we haven't cached the data yet, do so
        if (!this._countries) {
            // TODO make an actual api call
            // 'http://api.geonames.org/countryInfoJSON?username=karjaneth'
            let data = fake_data;
            this._countries = data.geonames;

            // add flag data from this flag api, for fun!
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
