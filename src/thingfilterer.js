'use strict';

// const _ = require('lodash');
const express = require('express');
const fake_data = require('./fakedata'); // HACK


class ThingFilterer {
    constructor(config) {
        this.app = express();

        this.app.get('/', this.index.bind(this));
        this.app.get('/filter/', this.filter.bind(this));
        this.app.get('/details/:code', this.details.bind(this));
    }

    // our static html file with client-side javascript
    index(req, res) {
        res.sendFile(`${__dirname}/index.html`);
    }

    // takes a search string and returns a list of
    // matches (full name and country code)
    async filter(req, res) {
        // TODO error handling

        // an empty query should match nothing
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
            }))

            // just keep those whose name includes the search string
            .filter(c => c.name.toLowerCase().includes(req.query.q.toLowerCase()))

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
