import d3 from './d3-modules';

module.exports = class Stock {

    constructor(data) {

        this.getStats(data);     
        
    }

    clearGraphs() {
        // Clear any preexisting charts after user loads up a new stock.
        d3.selectAll("svg > *").remove();
        
        // Also remove the hidden class which hides the empty graphs 
        // when the user first comes to the page
        document.querySelector('.graphs').classList.remove('hidden');
    }

    getStats(data) {
        
        const days = data.data;

        let numUpDays = 0,          
            numDownDays = 0,       
            avgAfterUpDay = 0,      
            avgAfterDownDay = 0,
            avgAfterHours = 0,
            avgAbsAfterHours = 0;

        let afterUpDayChange = 0,   
            afterDownDayChange = 0,
            numAfterUpDays = 0,
            numAfterDownDays = 0,
            closeMax = 0,
            closeMin = 0,
            afterHoursTotal = 0,
            absAfterHoursTotal = 0,
            totalChange = 0,
            totalAbsChange = 0;

        const weekdays = [
            {
                totalChange: 0,
                totalAbsChange: 0,
                numDays: 0,
                avgChange: 0,
                avgAbsChange: 0,
                totalAfterHrsChange: 0,
                avgAfterHrsChange: 0,   // Avg change from Fri close
                totalAbsAfterHrsChange: 0,
                avgAbsAfterHrsChange: 0,
                day: 'Monday'  
            },
            {
                totalChange: 0,
                totalAbsChange: 0,
                numDays: 0,
                avgChange: 0,
                avgAbsChange: 0,
                totalAfterHrsChange: 0,
                avgAfterHrsChange: 0,
                totalAbsAfterHrsChange: 0,
                avgAbsAfterHrsChange: 0,
                day: 'Tuesday'
            },
            {
                totalChange: 0,
                totalAbsChange: 0,
                numDays: 0,
                avgChange: 0,
                avgAbsChange: 0,
                totalAfterHrsChange: 0,
                avgAfterHrsChange: 0,
                totalAbsAfterHrsChange: 0,
                avgAbsAfterHrsChange: 0,
                day: 'Wednesday'
            },
            {
                totalChange: 0,
                totalAbsChange: 0,
                numDays: 0,
                avgChange: 0,
                avgAbsChange: 0,
                totalAfterHrsChange: 0,
                avgAfterHrsChange: 0,
                totalAbsAfterHrsChange: 0,
                avgAbsAfterHrsChange: 0,
                day: 'Thursday'
            },
            {
                totalChange: 0,
                totalAbsChange: 0,
                numDays: 0,
                avgChange: 0,
                avgAbsChange: 0,
                totalAfterHrsChange: 0,
                avgAfterHrsChange: 0,
                totalAbsAfterHrsChange: 0,
                avgAbsAfterHrsChange: 0,
                day: 'Friday'
            }
        ]

        const wd = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];


        let pctChangeYesterday = 0;
        for (let i = days.length-1; i >= 0; i--) {

            const today = days[i];
            const yesterday = i < days.length - 1 ? days[i+1] : null;

            const rawChange = yesterday ? today.close - yesterday.close : 0;
            const pctChange = yesterday ? 100 * (rawChange / yesterday.close) : 0;
            
            totalChange += pctChange;
            totalAbsChange += Math.abs(pctChange);

            days[i].rawChange = rawChange;
            days[i].pctChange = pctChange;
            days[i].day = new Date (days[i].day);
            // Now we want to register the day as either up or down
            if (rawChange > 0) numUpDays++;
            else if (rawChange < 0) numDownDays++;

            if (pctChangeYesterday > 0) {
                afterUpDayChange += pctChange;
                numAfterUpDays++;

            } else if (pctChangeYesterday < 0) {

                afterDownDayChange += pctChange;
                numAfterDownDays++;

            }   

            if (today.close > closeMax) closeMax = today.close;
            if (today.close < closeMin) closeMin = today.close;

            // After Hours Calculations
            const yesterdayClose = yesterday ? yesterday.close : 0;
            const todayOpen = today.open;
            const afterHoursChange = yesterday 
                ? (todayOpen - yesterdayClose) / yesterdayClose 
                : 0; 
            
            afterHoursTotal += 100 * afterHoursChange;
            absAfterHoursTotal += 100 * Math.abs(afterHoursChange);

            // Update our weekday totals
            const day = today.day.getDay();  
            weekdays[day].numDays++;
            weekdays[day].totalChange += pctChange;  
            weekdays[day].totalAbsChange += Math.abs(pctChange);
            weekdays[day].totalAfterHrsChange += afterHoursChange * 100;
            weekdays[day].totalAbsAfterHrsChange += afterHoursChange 
                ? Math.abs(afterHoursChange) * 100
                : 0;            
            
            pctChangeYesterday = pctChange;

        };

        // Calculate Averages
        let avgAfterUp = afterUpDayChange / numAfterUpDays,
            avgAfterDown = afterDownDayChange / numAfterDownDays;
        
        const firstDay = days[days.length -1].day,
            lastDay = days[0].day;

        weekdays.forEach((day, i) => {
            day.avgChange = day.totalChange / day.numDays;

            day.avgAbsChange = day.totalAbsChange / day.numDays;

            day.avgAfterHrsChange = day.totalAfterHrsChange / day.numDays;
            
            day.avgAbsAfterHrsChange = day.totalAbsAfterHrsChange / day.numDays;
        });


        avgAfterHours = afterHoursTotal / (days.length - 1);
        avgAbsAfterHours = absAfterHoursTotal / (days.length - 1);

        this.avg_abs_after_hrs_change = avgAbsAfterHours;
        this.avg_after_hrs_change = avgAbsAfterHours;
        this.weekday_avgs = weekdays;
        this.first_day = firstDay;
        this.last_day = lastDay;
        this.days = days;
        this.num_up_days = numUpDays;
        this.num_down_days = numDownDays;
        this.avg_pct_change_after_up = avgAfterUp.toFixed(2) + "%";
        this.avg_pct_change_after_down = avgAfterDown.toFixed(2) + "%";
        this.symbol = data.meta['2. Symbol'];
        this.max_close = closeMax;
        this.min_close = closeMin;

    }

    graphStockPrice() {

        // Now start
        const svg = d3.select('.daily-price-chart');

        const margin = {top: 20, right: 20, bottom: 50, left: 70},
            g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`),
            width = +svg.style('width').replace('px', '') - margin.left - margin.right,
            height = +svg.style("height").replace('px','') - margin.top - margin.bottom;
        
        //Scales
        const yExtent = d3.extent(this.days, function(d) {return d.close});

        const x = d3.scaleTime()
            .domain([this.first_day, this.last_day])
            .rangeRound([0, width]);

        const y = d3.scaleLinear()
            .domain(yExtent)
            .rangeRound([height, 0]);
        
        const line = d3.line()
            .x(function(d) { return x(d.day)})
            .y(function(d) { return y(d.close)});

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(4));

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(4))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", 0 - height/2)
            //.attr("dy", "0.71em")
            .attr("text-anchor", "middle")
            .attr("class", "graph-label")
            .text("Price ($)");

        g.append("path")
            .datum(this.days)
            .attr("fill", "none")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", .5)
            .attr("d", line);           
    
    }

    graphAvgAfter() {

        const avgAfterUp = +this.avg_pct_change_after_up.replace('%', '');
        const avgAfterDown = +this.avg_pct_change_after_down.replace('%', '');
        const data = [
            {
                'after': 'up',
                'value': avgAfterUp
            },
            {
                'after': 'down',
                'value': avgAfterDown
            }
        ];

        const svg = d3.select('svg.avg-after');

        const margin = {top: 20, right: 20, bottom: 50, left: 20},
            g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`),
            width = +svg.style('width').replace('px', '') - margin.left - margin.right,
            height = +svg.style("height").replace('px','') - margin.top - margin.bottom;

        const y = d3.scaleBand()
                    .domain(['up', 'down'])
                    .rangeRound([height, 0])
                    .padding(0.5);

        const xExtent = d3.extent(data, function(d) {return d.value});
        let domain = [-1, 1];
        
        if (Math.abs(xExtent[0]) > xExtent[1]) {
            domain[0] = Math.floor(xExtent[0]);
            domain[1] = Math.ceil(Math.abs(xExtent[0]));
        } else {
            domain[0] = Math.floor(-xExtent[1]);
            domain[1] = Math.ceil(xExtent[1]);
        }

        const x = d3.scaleLinear()
                    .domain(domain)
                    .rangeRound([0, width]);

        const tooltip = d3.select("body")
            .append("div")
            .attr('class', 'tooltip')
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
            .ticks(3)
            .tickFormat(function(d){return d+ "%"}))
            .append("text")
            .attr("y", 40)
            .attr("x", width/2)
            .attr("text-anchor", "middle")
            .attr("class", "graph-label")
            .text("AVG Price Change");

        
        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { 
                return d.value < 0 ? x(d.value) : x(0); 
            })
            .attr("y", function(d) { return y(d.after); })
            .attr("height", y.bandwidth())
            .attr("width", function(d) { 
                return d.value < 0 
                    ? width/2 - x(d.value) 
                    : x(d.value) - width/2; 
            })
            .attr('class', function(d) {
                return d.value < 0
                    ? 'neg-avg'
                    : 'pos-avg'
            })
            .on('mouseover', (d) => { 
                return tooltip.style("visibility", "visible").text(d.value + '%');
            })
            .on('mousemove', (d) => { 
                return tooltip.style("top", `${event.pageY - 30}px`)
                    .style('left', `${event.pageX + 5}px`);})
            .on('mouseout', () => {return tooltip.style('visibility', 'hidden');});
        
        g.append("line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("class", "mid-axis")
            .attr("stroke-width", ".5px");

        g.selectAll(".avg-after--name")
                .data(data)
            .enter().append("text")
                .attr("class", "avg-after--name")
                .attr("x", function(d){ return d.value < 0 ? x(0) + 2.55 : x(0) - 2.55 })
                .attr("y", function(d){ return y(d.after); })
                .attr("dy", y.bandwidth()/2 + 2.55)
                .attr("text-anchor", function(d){ return d.value < 0 ? "start" : "end"; })
                .text(function(d){ return `After ${d.after} day`; });

    }

    graphWeekdays() {
        const data = this.weekday_avgs;

        const svg = d3.select('svg.weekday-avg');

        const margin = {top: 20, right: 20, bottom: 50, left: 20},
            g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`),
            width = +svg.style('width').replace('px', '') - margin.left - margin.right,
            height = +svg.style("height").replace('px','') - margin.top - margin.bottom;

        const y = d3.scaleBand()
            .domain(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
            .rangeRound([0, height])
            .padding(0.2);
        
        const xExtent = d3.extent(data, function(d) {return d.avgChange});
        let domain = [-1, 1];
        
        if (Math.abs(xExtent[0]) > xExtent[1]) {
            domain[0] = Math.floor(xExtent[0]);
            domain[1] = Math.ceil(Math.abs(xExtent[0]));
        } else {
            domain[0] = Math.floor(-xExtent[1]);
            domain[1] = Math.ceil(xExtent[1]);
        }

        const x = d3.scaleLinear()
            .domain(domain)
            .rangeRound([0, width]);

        const tooltip = d3.select("body")
            .append("div")
            .attr('class', 'tooltip')
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
            .ticks(3)
            .tickFormat(function(d){return d + "%"}))
            .append("text")
            .attr("y", 40)
            .attr("x", width/2)
            .attr("text-anchor", "middle")
            .attr("class", "graph-label")
            .text("AVG Price Change");

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { 
                return d.avgChange < 0 ? x(d.avgChange) : x(0); 
            })
            .attr("y", function(d) { return y(d.day); })
            .attr("height", y.bandwidth())
            .attr("width", function(d) { 
                return d.avgChange < 0 
                    ? width/2 - x(d.avgChange) 
                    : x(d.avgChange) - width/2; 
            })
            .attr('class', function(d) {
                return d.avgChange < 0
                    ? 'neg-avg'
                    : 'pos-avg'
            })
            .on('mouseover', (d) => { 
                    
                return tooltip.style("visibility", "visible").text(d.avgChange.toFixed(2) + '%');
            })
            .on('mousemove', (d) => { 
                return tooltip.style("top", `${event.pageY - 30}px`)
                    .style('left', `${event.pageX + 5}px`);})
            .on('mouseout', () => {return tooltip.style('visibility', 'hidden');});


        g.append("line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("class", "mid-axis")
            .attr("stroke-width", ".5px");

        g.selectAll(".weekday-avg--name")
                .data(data)
            .enter().append("text")
                .attr("class", "weekday-avg--name")
                .attr("x", function(d){ return d.avgChange < 0 ? x(0) + 2.55 : x(0) - 2.55 })
                .attr("y", function(d){ return y(d.day); })
                .attr("dy", y.bandwidth()/2 + 2.55)
                .attr("text-anchor", function(d){ return d.avgChange < 0 ? "start" : "end"; })
                .text(function(d){ 
                    if (d.day === 'Thursday') return d.day.substr(0,2);
                    return d.day.substr(0,1);
                });

    }

    graphAbsWeekdays() {
        
        const data = this.weekday_avgs;

        const svg = d3.select('svg.abs-weekday-avg');

        const margin = {top: 20, right: 20, bottom: 50, left: 90},
            g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`),
            width = +svg.style('width').replace('px', '') - margin.left - margin.right,
            height = +svg.style("height").replace('px','') - margin.top - margin.bottom;

        const y = d3.scaleBand()
            .domain(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
            .rangeRound([0, height])
            .padding(0.2);
        
        const xExtent = d3.extent(data, function(d) {return d.avgAbsChange});
        let domain = [0, 1];
        let max = 1;

        while (xExtent[0] < -max || xExtent[1] > max) {
            max++;
            domain[1] = max;

        }

        const x = d3.scaleLinear()
            .domain(domain)
            .rangeRound([0, width]);
        
        const tooltip = d3.select("body")
            .append("div")
            .attr('class', 'tooltip')
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
            .ticks(3)
            .tickFormat(function(d){return d + "%"}))
            .append("text")
            .attr("y", 40)
            .attr("x", width/2)
            .attr("text-anchor", "middle")
            .attr("class", "graph-label")
            .text("AVG Absolute Price Change");

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", function(d) { return y(d.day); })
            .attr("height", y.bandwidth())
            .attr("width", function(d) { 
                return  x(Math.abs(d.avgAbsChange)); 
            })
            .on('mouseover', (d) => { 
                    
                return tooltip.style("visibility", "visible").text(d.avgAbsChange.toFixed(2) + '%');
            })
            .on('mousemove', (d) => { 
                return tooltip.style("top", `${event.pageY - 30}px`)
                    .style('left', `${event.pageX + 5}px`);})
            .on('mouseout', () => {return tooltip.style('visibility', 'hidden');});

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));

    }

    graphAfterHoursWeekdays() {
        const data = this.weekday_avgs;

        const svg = d3.select('svg.weekday-after-hrs-avg');

        const margin = {top: 20, right: 20, bottom: 50, left: 20},
            g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`),
            width = +svg.style('width').replace('px', '') - margin.left - margin.right,
            height = +svg.style("height").replace('px','') - margin.top - margin.bottom;

        const y = d3.scaleBand()
            .domain(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
            .rangeRound([0, height])
            .padding(0.2);
        
        const xExtent = d3.extent(data, function(d) {return d.avgAfterHrsChange});
        let domain = [-1, 1];
        
        if (Math.abs(xExtent[0]) > xExtent[1]) {
            // bigger min then max
            domain[0] = Math.floor(xExtent[0]);
            domain[1] = Math.ceil(Math.abs(xExtent[0]));
        } else {
            domain[0] = Math.floor(-xExtent[1]);
            domain[1] = Math.ceil(xExtent[1]);
        }

        const x = d3.scaleLinear()
            .domain(domain)
            .rangeRound([0, width]);
        
        const tooltip = d3.select("body")
            .append("div")
            .attr('class', 'tooltip')
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
            .ticks(3)
            .tickFormat(function(d){return d + "%"}))
            .append("text")
            .attr("y", 40)
            .attr("x", width/2)
            .attr("text-anchor", "middle")
            .attr("class", "graph-label")
            .text("AVG After Hours Price Change");

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { 
                return d.avgAfterHrsChange < 0 ? x(d.avgAfterHrsChange) : x(0); 
            })
            .attr("y", function(d) { return y(d.day); })
            .attr("height", y.bandwidth())
            .attr("width", function(d) { 
                return d.avgAfterHrsChange < 0 
                    ? width/2 - x(d.avgAfterHrsChange) 
                    : x(d.avgAfterHrsChange) - width/2; 
            })
            .attr('class', function(d) {
                return d.avgAfterHrsChange < 0
                    ? 'neg-avg'
                    : 'pos-avg'
            })
            .on('mouseover', (d) => { 
                    
                return tooltip.style("visibility", "visible").text(d.avgAfterHrsChange.toFixed(2) + '%');
            })
            .on('mousemove', (d) => { 
                return tooltip.style("top", `${event.pageY - 30}px`)
                    .style('left', `${event.pageX + 5}px`);})
            .on('mouseout', () => {return tooltip.style('visibility', 'hidden');});


        g.append("line")
            .attr("x1", x(0))
            .attr("x2", x(0))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("class", "mid-axis")
            .attr("stroke-width", ".5px");

        g.selectAll(".weekday-avg--name")
                .data(data)
            .enter().append("text")
                .attr("class", "weekday-avg--name")
                .attr("x", function(d){ return d.avgAfterHrsChange < 0 ? x(0) + 2.55 : x(0) - 2.55 })
                .attr("y", function(d){ return y(d.day); })
                .attr("dy", y.bandwidth()/2 + 2.55)
                .attr("text-anchor", function(d){ return d.avgAfterHrsChange < 0 ? "start" : "end"; })
                .text(function(d){ 
                    if (d.day === 'Thursday') return d.day.substr(0,2);
                    return d.day.substr(0,1);
                });
    }

    graphAbsAfterHoursWeekdays() {
        const data = this.weekday_avgs;

        const svg = d3.select('svg.weekday-abs-after-hrs-avg');

        const margin = {top: 20, right: 20, bottom: 50, left: 90},
            g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`),
            width = +svg.style('width').replace('px', '') - margin.left - margin.right,
            height = +svg.style("height").replace('px','') - margin.top - margin.bottom;
        
        const y = d3.scaleBand()
            .domain(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])
            .rangeRound([0, height])
            .padding(0.2);
        
        const xExtent = d3.extent(data, function(d) {return d.avgAbsAfterHrsChange});
        let domain = [0, 1];
        let max = 1;

        while (xExtent[0] < -max || xExtent[1] > max) {
            max++;
            domain[1] = max;
        }

        const x = d3.scaleLinear()
            .domain(domain)
            .rangeRound([0, width]);

        const tooltip = d3.select("body")
            .append("div")
            .attr('class', 'tooltip')
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");
        

        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
            .ticks(3)
            .tickFormat(function(d){return d + "%"}))
            .append("text")
            .attr("y", 40)
            .attr("x", width/2)
            .attr("text-anchor", "middle")
            .attr("class", "graph-label")
            .text("AVG Absolute After Hours Price Change");

        g.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", 0)
            .attr("y", function(d) { return y(d.day); })
            .attr("height", y.bandwidth())
            .attr("width", function(d) { 
                return  x(Math.abs(d.avgAbsAfterHrsChange)); 
            })
            .on('mouseover', (d) => { 
                    
                return tooltip.style("visibility", "visible").text(d.avgAbsAfterHrsChange.toFixed(2) + '%');
            })
            .on('mousemove', (d) => { 
                return tooltip.style("top", `${event.pageY - 30}px`)
                    .style('left', `${event.pageX + 5}px`);})
            .on('mouseout', () => {return tooltip.style('visibility', 'hidden');});

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y));

    }

    graphDailyPctChange() {

        const svg = d3.select('svg.daily-pct-change');

        const margin = {top: 20, right: 20, bottom: 50, left: 70},
            g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`),
            width = +svg.style('width').replace('px', '') - margin.left - margin.right,
            height = +svg.style("height").replace('px','') - margin.top - margin.bottom;
        
        //Scales
        const yExtent = d3.extent(this.days, function(d) {return d.pctChange});
        let domain = [-10, 10];
        let max = 1;
        
        if (yExtent[0] < -10 || yExtent[0] > 10) {
            if (Math.abs(yExtent[0]) > yExtent[1]) {
                // bigger min then max
                domain[0] = Math.floor(yExtent[0]);
                domain[1] = Math.ceil(Math.abs(yExtent[0]));
            } else {
                domain[0] = Math.floor(-yExtent[1]);
                domain[1] = Math.ceil(yExtent[1]);
            }
        }
        

        const x = d3.scaleTime()
            .domain([this.first_day, this.last_day])
            .rangeRound([0, width]);

        const y = d3.scaleLinear()
            .domain(domain)
            .rangeRound([height, 0]);
        
        const line = d3.line()
            .x(function(d) { return x(d.day)})
            .y(function(d) { return  y(d.pctChange)});

        
        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(4));

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", 0 - height/2)
            .attr("text-anchor", "middle")
            .attr("class", "graph-label")
            .text("Price Change");

        g.append("path")
            .datum(this.days)
            .attr("fill", "none")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", .5)
            .attr("d", line);  
            
    }

    graphDailyPctChangeBar() {

        const svg = d3.select('svg.daily-pct-change--bar');

        const margin = {top: 20, right: 20, bottom: 50, left: 70},
            g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`),
            width = +svg.style('width').replace('px', '') - margin.left - margin.right,
            height = +svg.style("height").replace('px','') - margin.top - margin.bottom;
        
        //Scales
        const yExtent = d3.extent(this.days, function(d) {return d.pctChange});
        let domain = [-10, 10];
        let max = 1;
        
        if (yExtent[0] < -10 || yExtent[1] > 10) {
            if (Math.abs(yExtent[0]) > yExtent[1]) {
                // bigger min then max
                domain[0] = Math.floor(yExtent[0]);
                domain[1] = Math.ceil(Math.abs(yExtent[0]));
            } else {
                domain[0] = Math.floor(-yExtent[1]);
                domain[1] = Math.ceil(yExtent[1]);
            }
        }
        
        const x = d3.scaleBand()
            .domain(this.days.map(function(d) { return d.day; }))
            .rangeRound([width, 0])
            .padding(0.2);

        const y = d3.scaleLinear()
            .domain(domain)
            .rangeRound([height, 0]);

        const tooltip = d3.select("body")
            .append("div")
            .attr('class', 'tooltip')
            .style("position", "absolute")
            .style("z-index", "10")
            .style("visibility", "hidden");
        
        g.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%B"))
            .tickValues(x.domain().filter(function(d,i){ 
                return !(i%20)}) )
            );

        g.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + "%"))
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", -60)
            .attr("x", 0 - height/2)
            .attr("text-anchor", "middle")
            .attr("class", "graph-label")
            .text("Price Change(%)");

        g.selectAll(".bar")
                .data(this.days)
            .enter().append("rect")
                .attr("class", "bar")
                .attr("y", function(d) { 
                    return d.pctChange > 0 ? y(d.pctChange) : y(0); 
                })
                .attr("x", function(d) { return x(d.day); })
                .attr("width", x.bandwidth())
                .attr("height", function(d) { 
                    return d.pctChange > 0 
                        ?  height/2 - y(d.pctChange)
                        : y(d.pctChange) - height/2;
                })
                .attr('class', function(d) {
                    return d.pctChange < 0
                        ? 'neg-avg'
                        : 'pos-avg'
                })
                .on('mouseover', (d) => { 
                    return tooltip.style("visibility", "visible").text(d.pctChange.toFixed(2) + '%');
                })
                .on('mousemove', (d) => { 
                    return tooltip.style("top", `${event.pageY - 30}px`)
                        .style('left', `${event.pageX + 5}px`);})
            
                .on('mouseout', () => {return tooltip.style('visibility', 'hidden');});


        g.append("line")
            .attr("x1", 0)
            .attr("x2", width)
            .attr("y1", y(0))
            .attr("y2", y(0))
            .attr("class", "mid-axis")
            .attr("stroke-width", ".5px");

        
        
        
            
    }


}

/*
    So at this point we have our graphs. One problem might be 
    that we don't have enough info about the stock itself 
    
*/