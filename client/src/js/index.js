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

        getStockInfo(url);
        
    })
})()


function showStockInfo(stock) {
   const name = document.querySelector('.stock-info__name--value'),
        upDays = document.querySelector('.stock-info__up--value'),
        downDays = document.querySelector('.stock-info__down--value'),
        upDaysAVG = document.querySelector('.stock-info__up-avg--value'),
        downDaysAVG = document.querySelector('.stock-info__down-avg--value'),
        timePeriod = document.querySelector('.stock-info__time-period--value'),
        upDays2 = document.querySelector('.graphs--one .num-up-days'),
        downDays2 = document.querySelector('.graphs--one .num-down-days');
    
    name.innerHTML = stock.symbol;
    upDays.innerHTML = stock.num_up_days;
    downDays.innerHTML = stock.num_down_days;
    upDaysAVG.innerHTML = stock.avg_pct_change_after_up;
    downDaysAVG.innerHTML = stock.avg_pct_change_after_down;
    timePeriod.innerHTML = stock.first_day + ' - ' + stock.last_day;
    upDays2.innerHTML = stock.num_up_days;
    downDays2.innerHTML = stock.num_down_days;
}

function getStockInfo(url) {

    axios.get(url)
        .then((res) => {

            const stock = new Stock(res.data);

            //showStockInfo(stock);

            stock.clearGraphs();

            stock.graphStockPrice();

            stock.graphAvgAfter();

            stock.graphWeekdays();

            stock.graphAbsWeekdays();

            stock.graphAfterHoursWeekdays();

            stock.graphAbsAfterHoursWeekdays();

            // stock.graphDailyPctChange();

            stock.graphDailyPctChangeBar();
            
        })
        .catch((err) => {
            console.log(err);
        })
}

