const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 8080;

const API_KEY = require('./config/API_KEY.js')

app.use(express.static('client'));

app.get('/search', (req, res) => {
    
    const symbol = req.query.symbol;
    const size = req.query.size;

    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&outputsize=${size}&symbol=${symbol}&apikey=${API_KEY}`;
    
    axios.get(url)
        .then(response => {
            
            const days = [];

            const data = response.data['Time Series (Daily)'];

            if (!data) { res.json({'Error': 'Invalid API call'})}
            else {

                for (let day in data) {

                    days.push({

                        day: new Date(day),
                        open: +data[day]['1. open'],
                        high: +data[day]['2. high'],
                        low: +data[day]['3. low'],
                        close: +data[day]['4. close'],
                        volume: +data[day]['5. volume']
                    })

                }

                const stockObj = {
                    meta: response.data['Meta Data'],
                    data: days
                } 

                res.json(stockObj);
            }
            
        })
        .catch(err => {
            console.log('err');
            console.log(err);
        })

})


app.listen(PORT, (err) => {

    if (err) {
        console.log('error has occured with server');
    }

    console.log(`Server now listening on PORT ${PORT}`)
});
