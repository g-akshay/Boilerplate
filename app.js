let express = require('express');

let app = express();


let logger = (req, res, next) => {
    req.requestTime = Date.now()
        //console.log(req, res);
    next();
}

app.use(logger)

app.use((err, req, res, next) => {

    console.error(err.stack)
    res.status(500).send('Something broke!')

});

app.set('views', 'views');
app.set('port', process.env.PORT || 3000);
app.set('view engine', 'jade')
app.listen(app.get('port'), () => { // listen to port 3000

    console.log(`Listening to port ${app.get('port')}`);

});

/* ----------------  URI's ---------------------*/

app.get('/', (rew, res) => {
    /*
        var responseText = 'Hello World!<br>';
        responseText += '<small>Requested at: ' + req.requestTime + '</small>';
        res.send(responseText);*/

    res.render('index', { title: 'Hey', message: 'Hello there!' })

});


app.post('/', (rew, res) => {

    res.send('A post request');

});
