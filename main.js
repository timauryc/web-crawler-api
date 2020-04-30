const express = require('express');
const app = express();
const crawler = require("./crawler.js")

var bodyParser = require('body-parser')

// parse application/json
app.use(bodyParser.json())

app.post('/query', (req, response) => {
    crawler.queryItems(req.body.search, req.body.limit).then((resultsArray) => {
        let result = resultsArray.reduce((acum, val) => acum.concat(val), []).slice(0,req.body.limit)
        response.status(200).json(result)
    })
});

app.listen(6000, () => console.log('Gator app listening on port 6000!'));