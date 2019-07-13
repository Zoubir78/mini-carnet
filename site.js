var express = require('express');
var router = express.Router();
const app = express();

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'Dinosaure';

var datas = {};

router.use(function(req,res,next) {
    datas = app.locals;
    datas.session = req.session;
    next();
});

router.get('/', function(req,res,next) {
    datas.title = 'Page d\'accueil';
    res.render('home',datas);
});

router.get('/connect',function(req,res,next) {
    if (req.session.identifiant) {
        app.locals.msg = {text:'Vous êtes déjà connecté',class:'primary'};
        res.redirect('/');
    } else {
        datas.title = 'Se connecter';
        res.render('connect',datas);
    }
});

router.get('/disconnect', function(req,res,next) {
    req.session.destroy(function(err) {
        app.locals.msg = {text:'Vous êtes déconnecté',class:'info'};
        res.redirect('/');
    });
});

router.get('/check', function(req,res,next) {
    MongoClient.connect(url,{useNewUrlParser: true}, function(err,client) {
        const db = client.db(dbName);
        const collection = db.collection('connexion');
        if (req.query.identifiant && req.query.mdp) {
            collection.find({identifiant:req.query.identifiant,mdp:req.query.mdp}).toArray(function(err,docs){
                client.close();
                if (docs.length) {
                    req.session.identifiant = docs[0].identifiant;
                    req.session.niveau = docs[0].niveau;
                    app.locals.msg = {text:'Vous êtes connecté',class:'success'};
                    res.redirect('/');
                } else {
                    app.locals.msg = {text:'Mauvaises informations',class:'danger'};
                    res.redirect('/connect');
                }
            });
        } else {
            app.locals.msg = {text:'Donnée(s) manquante(s)',class:'danger'};
            res.redirect('/connect');
        }
    });
});

module.exports = router;