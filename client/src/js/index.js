import Stock from './Stock.js';

import axios from 'axios';

// Basically sets up event listener to go fetch stock that is entered
// into the search box.
(function() {

    const searchBtn = document.querySelector('.ticker__search--btn');
    const searchInput = document.querySelector('.ticker__search--input');

    searchBtn.addEventListener('click', () => {
        

        const inputVal = searchInput.value;
        const size = 'compact';
        const url = `/search?symbol=${inputVal}&size=${size}`;

        // start the loader
        initLoader();

        getStockInfo(url);
        
    })
})()


function initLoader() {
    const loader = document.querySelector('.loader');
    
    loader.classList.add('active');
}
function removeLoader() {
    const loader = document.querySelector('.loader');
    
    loader.classList.remove('active');
}

function getStockInfo(url) {

    axios.get(url)
        .then((res) => {

            // Hide loader
            removeLoader();

            const data = res.data;

            if (data.Error) {
                // There was an invalid API call.
                console.log(res);
                console.log('there was an error with the API call');
                
            } else {
                const stock = new Stock(data);
                
                stock.clearGraphs();
                
                stock.setName();

                stock.graphStockPrice();

                stock.graphAvgAfter();

                stock.graphWeekdays();

                stock.graphAbsWeekdays();

                stock.graphAfterHoursWeekdays();

                stock.graphAbsAfterHoursWeekdays();

                // stock.graphDailyPctChange();

                stock.graphDailyPctChangeBar();
            }
            
            
        })
        .catch((err) => {
            console.log(err);
        })
}

