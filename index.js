const express = require('express');
const app = express();

const session = require('express-session');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:false}));

app.set('view engine','pug');
app.use('/src',express.static(__dirname + '/src'));

app.use(session({
    secret: 'my secret text',
    resave: false,
    saveUninitialized: true
}));

app.use('/',require('./site'));
app.use('/admin/',require('./admin'));

app.use(function(req,res,next) {
    res.render('404',{titles:'Erreur 404',session:req.session});
});

const port = 8000;
app.listen(port, function () {
    console.log(`Écoute sur le port: ${port}`);
});