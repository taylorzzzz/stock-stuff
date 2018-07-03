const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 8080;

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
            
        })
        .catch(err => {
            console.log(err);
        })

})


app.listen(PORT, (err) => {

    if (err) {
        console.log('error has occured with server');
    }

    console.log(`Server now listening on PORT ${PORT}`)
});

/* 
    This file sets up a server using node. What is happening is that
    on my computer I run node and pass this file to it. Node is a C++
    application which takes javascript as input and, using the 
    embedded v8 engine, compiles it to machine code and runs it 
    on the computer. We can use libraries like 'http' to set up a server
    on a specific port on this computer. We can write the code which handles 
    requests to the port & server. All this is done using javascript. This is possible because node is able to translate the javascript to machine code that the cpu can execute. 

    So we have a server set up on our computer. When we access the 
    specified port from our browser, our server will recieve that request.
    It's up to us how we want to handle that request. In order to make
    handling requests easier for us we will use a library called Express. 
    Express is just some javascript functions and objects which we can use 
    to make certain tasks easier. In order to use Express, we need to
    download it onto our computer. We can use npm for this. With the Express
    files on our computer and in our node_modules folder, we can require
    them in. What this means is that we import whichever object 
    (possibly a function object) express makes available via module.exports.
    This is one of the javascript 'add-ons' that Node makes available to us.
    
    Once we have required in the express object (which is really a function),
    we can make use of it's functionality. Executing the imported 
    function with express(), returns an object, which we'll call app, that
    has all sorts of methods and properties that are useful to us in setting 
    up a server. One of these is the listen function. All we need to give
    it is the port number we want to listen at and a server will be set up
    for us. We can also add middleware our server. Middleware are basically
    functions which we want to execute on incoming requests. Some of these 
    functions we might want to perform on all incoming requests, such as 
    parsing for cookies or something, and some we might want to perform 
    only for requests to specific routes. For instance, say our app
    requires data from a third-party API. We will probably want to send 
    out those requests to that API from the back-end, since we'll likely
    need to pass along some sort of API Key, which we would be exposing
    were we to send out our requests right from inside the users browser 
    i.e the frontend. Say that the specific data that we will be asking 
    for from that API is determined by some user input on the front end. 
    
    In the case of our app here, the data would be information about
    a specific stock. So the user inputs the ticker name of the stock
    they want data for, and then clicks enter. On the front-end will be 
    some javascript waiting for such a click. Upon hearing it, the 
    javascript will collect the input entered by the user (the name 
    of the stock) and then tell the back end that the user wants data
    about that stock. How does this happen?

    Well, what we can do is set up a route on our server, where requests
    of just this kind can be sent. The name of the stock could be passed 
    along with this request using either a query (thus it would be in url
    i.e getStock?stock=JNUG) or with a simple POST request. Either the route 
    handler on our server can then be set up to handle these requests, by 
    extracting the name of the stock, and then performing a request to the 
    third-party API. 
    
    In order to perform such a request we might use another library, just
    to make things easier. In this app we'll use one called axios. Just 
    like with express, all we have to do is download the files and then 
    require in the axios object. Then we can use the object to send out
    a GET request to the third party API. We'll also be able to handle 
    the response from this API, which might just involve passing along
    the returned data, as a response to the original request from the 
    front-end. 

    So that is all well and good, but if this express app is being used 
    as our server, that means that it should be serving the actual webpages
    too right? It's true. When a user enters the url for our site, our server,
    this express app as we call it, will recieve that request and is 
    responsible for sending back the appropriate html page. We can do this 
    using something called views which I haven't really looked into yet, or 
    we could just send back the html page that is requested, which is what 
    we'll do for our app here. So for instance, if the user sends a 
    request for the homepage at the root (/) path, we'll need to have an 
    route handler set up which recieves this requests and sends back
    index.html. We could then do the same thing for any other pages. 

    At this point we will need to run node app.js every time we change
    app.js and want to restart the server. Alternatively we could use
    npm scripts with node app.js run whenever we run npm start for instance.
    If we want to have our server restart autimatically each time we change
    app.js however, we could use another package called nodemon. Same as
    before we download the files with npm. This time however, we are not 
    going to be using nodemon inside of our javscript files. We won't 
    be running anything like require('nodemon') the way we did for 
    express and axios. What this means is that nodemon is going to be 
    used strictly for development - it won't be apart of our app itself.
    Instead we will use it by running it in the command line and passing
    app.js to it just like we did with node. In fact nodemon essentially
    will run node for us, passing along app.js, while also listening for 
    changes to app.js. When it hears one, it will stop the server and then
    restart it, basically rerunning node app.js for us.

    So now we have our server up and running. When we recieve a request
    to our root path, we send out index.html. In index.html we will
    probably have a link to a css file. What this means is that another
    request will be coming in to our server, this time for, say, style.css.
    How do we handle that? Normally we just send back which ever file is 
    requested, but here, in this server, we are doing the request 
    handling ourselves. After all index.html wasn't just automatically 
    sent back to the user, when it was requested. We had to listen for 
    that specific request and send it back manually. So how do we handle 
    all these other requests that usually come along with the html request
    (for .js and .css files for instance)? Well rather than setting up 
    handlers for each file that might be requested we can set up our server
    so that when we get requests to paths that match the paths of static
    files that we have (such as index.html, style.css, index.js, bg.jpg and
    so on) we simply send back that file as a response. To do this we use 
    the express.static() function. This function takes a path from which 
    to serve static assets. For instance, here we are putting all of our
    front-end code and assets in a folder called client. We want express
    to look in this folder each time it receives a request to a path, say
    index.html, and send back that asset or file if it finds it. After all,
    this is the same thing that a normal server would do right? We have a 
    file called index.html stored in our root directory, and if somebody goes
    to blahblah.com/index.html, the server just sends back that file. And then
    if that index.html file links to another file 'stylesheets/style.css', the 
    server just looks for that file from the root directory, and sends it back
    if it finds it. Similarly for js files and images. All we are doing here
    is basically moving our 'root' into a folder called client, and telling
    our server to use 'client' as the root from which it should look for files
    when requests for index.html, or style.css or any other path come in. This
    means that when we send back a request to that getStock?stock=JNUG path,
    which we mentioned earlier, our server will first go looking in the 
    client folder for a file matching that path, though it will not find 
    any matching file - Or will it? I'm not totally sure. The server may be 
    able to autimatically identify such a path as not belonging to 
    a static asset since it has no file extension. 

    At this point we are able to serve up static assets - html, js, css, etc. -
    and should be able to handle requests from our front end. Now we should 
    consider how the development of our front-end files, those static assets, 
    would go.

    Often we will have some sort of build step involved in the development
    of our front end. We may want to use babel to transpile our ES6 js to
    ECMA2015. Or we may want to compile our SASS files to a single CSS file.
    We might want to bundle together multiple JS files into one bundle.js file.
    Let's consider the second case, compiling SASS or SCSS into CSS. To do this,
    we might want to use a package like node-sass. This package gives us a 
    command line tool which we perform such a task with. Once again we'll
    need to download the packages files with npm. Like nodemon, node-sass
    is a dev tool meaning it won't actually be used 'inside' of our 
    application. Then to compile our SCSS or SASS we can just use the
    command line tool like so: node-sass <input.scss> <output.scss>. We can
    also create a script in package.json to run this command. We might also
    want to add the -w (watch) flag so that we don't have to keep 
    recompiling manually each time we change our sass.

    Similarly with babel we could download the babel-cli, babel-core,
    and babel-preset-es2015 packages and then use them to transpile our
    javascript into better-supported ECMA2015. Again, we could use npm
    scripts to execute the command to run the babel transpiler. Then we 
    would have node-sass running and compiling our sass into CSS, and we'd
    have babel ready to run and compile our ES6 javascript into EXMA2015.

    So let's return now to axios which we are using on both the front end 
    and the back end. On the back-end things work pretty easily. We require
    in 'axios' and node takes care of importing the axios object and making 
    it available for us to use. On the front-end however we don't have the 
    ability to just require in the library. We could do it the old fashioned 
    way and just link to the correct axios file in the node_modules directory
    using a script tag in our html. But we are already using tooling in
    our development flow, tooling which allows us to import axios in 
    clearer, simpler fashion. So lets do that.

    First things first; could we simply use import('axios') in the javascript 
    file where we will need it the way that we import other javascript files? 
    Will babel compile this correctly for us? If we try this and check the 
    outputted bundle.js, we will see that the import statement is turned
    into a require statement. Running the page in the browser we discover that
    require is not a valid function in javascript - only in node does it work.
    So it seems that although babel, with the help of our selected preset, is 
    turning arrow functions to normal functions and ternary operaters into 
    traditional conditional statements, all it can do with the import 
    statement is try to turn it into something that works in node. So the 
    probalem we are running up against is that babel works well as a 
    transpiler, translating one form of js to another, but its not able to
    do (or at least not the way we're using it) module bundling, which is 
    something else we need - that is we need to be able to bundle these 
    modules that we are using, axios for instance, with the rest of our 
    javascript so that we can use them together. We don't have this problem
    on the back end because node has added functionality that allows it to
    essentially fetch or bundle modules using the require keyword. Normal
    javascript has no such thing and so here we'll need to make use of another
    dev tool: Webpack.

    So consider for a moment what we are trying to do. We have some 
    javscript files that make up the axios library in our node_modules 
    directory. We want to use those files which basically means we want 
    to put them into our html file along with our other javscript. The 
    traditional way to do this, linking to the library with a script tag
    involves making a request from inside the users browser to some server
    or location where the code is kept and grabbing it from there. The other 
    way, the way that we are trying to do it, involves grabbing the axios 
    javascript and putting it together with our own javascript before we even
    send it off to the users browser. Now think about that require statement
    that babel transpiled out from our import. Why wouldn't something like that 
    work? To see the answer you have to realize that all this javscript will
    only be executed once it is inside the users browser. And that means that
    this 'axios' code that we want to import is still over on the server, not
    on the browser with the executing javascript. Thus for import or require 
    to work, they would have to basically be commands to request a file. Even
    if the browser understood that require was an instruction to go fetch a 
    certain file, it would need that file's path, not just it's name, axios, 
    if it was gonna go get it. And if we were gonna go ahead and list out 
    the full path to the file we want, why not just bypass all this and do it 
    in the html file with a script tag? All this is to say that it's not 
    surprising that things like import or require are not available for us 
    since they would be executed on the browser where theres no filesystem. 

    The answer then is to do all this bundling before we even send anything 
    to the server, while we still have access to the file system where 
    these bundles are held. The tool we are gonna use for this is called 
    webpack. To use it we'll once again download it via npm and again as 
    a dev dependency since we'll only be using it during development. 

    Once we have done this we can use the command line to run the tool. We just
    have to access it from the node_modules directory at:
        ./node_modules/.bin/webpack
    and then pass it the input js file and the name of the output js file. Then
    we just need to update our index.html so that it reads in this outputted
    bundle.js file rather than the original js file. We can make this process
    easier by creating a config file in our root called webpack.config.js and 
    placing our configuration options for our build in there. When webpack is run
    it will automatically go looking for this file and if it finds it will use 
    the options specified in there to determine what to do. Now all we have to 
    do is execute the webpack command with out specifying any arguments. 

    Viola. We are now able to bundle in a module like axios into our javascript.
    We could also split up our own javscript into seperate files or modules and
    bundle all of them together too. We would just require or import them into
    index.js the same way we did with axios - notice that we have the option to
    use either require or import for grabbing modules, they both work. 

    We are already using this webpack build step to bundle modules together. 
    However we can actually make use of it to perform other build tasks such 
    as those tasks we are already performing seperately - namely transpiling 
    js with babel and compiling scss with node-sass. To do this we need some 
    babel tools. We already have babel-core and babel-preset-es2015 so all we 
    need is a package called babel-loader. Once we have these packages we just
    need to configure our webpack.config file so that js files are also
    transpiled using babel in addition to being bundled. 

    So now with babel transpilation a part of our webpack build step we 
    can do away with that previous babel transpilation step we were using. 
    We could also create an npm script for this build step. 

    At this point we have most of what we need for front-end development
    integrated into a single build step with webpack. However there is still
    the case sass compilation. Right now we are running a seperate task using
    the node-sass tool which is watching for changes to our scss files and 
    upon a change, re compiles everything to style.css. This works fine, and 
    we are already in a good spot as far as having modern tools available for 
    development - Babel and Webpack for JS and SASS for CSS - however, why not
    integrate this sass compilation build step in with webpack so that everything 
    is contained in one spot and we don't need to have multiple build processes 
    running at once. ~~ Acutally ~~ I think I'll wait on this and continue 
    just using node-sass as a seperate build step. I don't understand 
    webpack well yet and I don't want to get tied into some solution that
    I don't understand.


*/