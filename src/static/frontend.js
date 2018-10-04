/* global $, Vue, _ */
'use strict';

// helper function for API calls
const get = (url, data) => $.ajax({
    type: 'GET',
    url,
    data,
    dataType: 'json', // data type of API response
});

async function init() {
    // using vue.js to manage state
    window.app = new Vue({
        // tell vue which element to care about
        el: '#app',

        // define data up front so Vue knows about it
        data: {
            query: undefined,
            countries: undefined,
            selection: undefined,
            details: undefined,
            error: undefined,
        },

        // dynamically update our data based on certain bound values
        watch: {
            // limit filter API call to once every 1/4 second
            query: _.throttle(async function(q) {
                // call our filter endpoint
                let response = await get('/filter', { q });

                // process the response
                if (response.error) {
                    // if we got an error, log and display it
                    console.error(`Error: ${response.error}`);
                    this.error = [
                        'There was an error getting results from the server.',
                        'Please try again or contact the maintainer.',
                    ].join('<br />');
                } else {
                    // if no error, blank it and update our countries
                    this.error = undefined;
                    this.countries = response.results;
                }
            }, 250),

            selection: async function(s) {
                // fill the query field with whatever name they clicked
                this.query = s.name;

                // call our details endpoint
                let response = await get(`/details/${s.code}`);

                // process the response
                if (response.error) {
                    // if we got an error, log and display it
                    console.error(`Error: ${response.error}`);
                    this.error = [
                        'There was an error getting details from the server.',
                        'Please try again or contact the maintainer.',
                    ].join('<br />');
                } else {
                    // if no error, blank it and update our details
                    this.error = undefined;
                    this.details = response.details;
                }

                // focus on the query field
                $('#query').focus();
            },
        },
    });

    // page should begin with input focused on the query field
    $('#query').focus();
}

// run our init function on when the DOM is ready
$(init);
