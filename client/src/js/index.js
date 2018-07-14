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

        removeErrMsg();

        getStockInfo(url);
        
    })

})()

// We want to redraw the charts on resize so
// we first need to set up an event listener on
// the resize event. Because we don't want to try
// a redraw each time the resize event triggers, we'll
// set up a timer that waits 1 second or so after 
// each resize event to execute the redraw. Each 
// subsequent resize trigger will clear the previous
// timeout and start a new one. This way the redraw will
// only occur after the last resize event occurs and 
// 1 second passes.

// The next thing to consider is how we will perform 
// the redraw. Consider that all of our stock data 
// and methods are stored on the Stock object which
// we have created over in getStockInfo. Thus if we were
// to have some kind of draw charts method on our stock
// object which drew all of the charts, we would not 
// actually be able to access it.




function initLoader() {
    const loader = document.querySelector('.loader');
    
    loader.classList.add('active');
}
function removeLoader() {
    const loader = document.querySelector('.loader');
    
    loader.classList.remove('active');
}
function displayErrorMsg() {

    const errMsg = document.querySelector('.errMessage');

    errMsg.classList.add('show');
}

function removeErrMsg() {

    const errMsg = document.querySelector('.errMessage');

    errMsg.classList.remove('show');
}

function getStockInfo(url) {

    axios.get(url)
        .then((res) => {

            removeLoader();

            const data = res.data;

            if (data.Error) {
                // There was an invalid API call.
                console.log(res);
                console.log('there was an error with the API call');
                displayErrorMsg();
                
            } else {
                const stock = new Stock(data);
                
                stock.setName();

                stock.drawGraphs();


                let timer;
                window.addEventListener('resize', () => {

                    clearTimeout(timer);

                    timer = setTimeout(() => {
                        stock.drawGraphs();
                    }, 1000);

                })
            }
            
            
        })
        .catch((err) => {
            console.log(err);
        })
}

