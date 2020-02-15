const express = require('express');

const DB = require('./db');
const { getCostForQuery } = require('./controllers/costExplorer');

const app = express();
const port = 3000;
const { HOST, USER, PASSWORD, DATABASE } = process.env;

// Should be shifted out of this file later after more logic is added
const initialize = async (retries = 0) => {
    try {
        await DB.initialize({
            host: HOST,
            user: USER,
            password: PASSWORD,
            database: DATABASE
        });
    }
    catch(err) {
        console.log('error init db', err);
        //handle error. Maybe add retries for each initialization
    }
    // Add other initialization logic.
    // async await used since we might need to use sequential initialisation for some modules
    return true;
};

initialize().then(resp => {
    app.get('/', (req, res) => res.send('Use the URL /cost-explorer !'));
    app.get('/cost-explorer', async (req, res) => {
        console.log('req', req.query); // use logger
        const clients = req.query.clients ? req.query.clients : [];
        const projects = req.query.projects ? req.query.projects : [];
        const cost_types = req.query.cost_types ? req.query.cost_types : [];
        const retValue = await getCostForQuery(clients, projects, cost_types);
        res.json(retValue);
    });
    app.listen(port, () => console.log(`Example app listening on port ${port}!`));
})
.catch(err => {
    console.log('err', err);
    process.exit(1);
});
