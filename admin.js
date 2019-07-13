const express = require('express');
const router = express.Router();
const app = express();

const MongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';
const dbName = 'Dinosaure';
const ObjectId = require('mongodb').ObjectId;

var datas = {};

router.use(function(req,res,next) {
    datas = app.locals;
    datas.session = req.session;
    next();
});

router.get('/', function(req,res,next) {
    datas.title = 'Page d\'accueil de l\'administration';
    res.render('home-admin',datas);
});

router.get('/add-dinosaures',function(req,res,next) {
    datas.title = 'Ajout d\'un Dinosaure';
    res.render('admin-dinosaures',datas);
});

router.post('/check-dinosaures',function(req,res,next) {
    MongoClient.connect(url,{useNewUrlParser: true}, function(err,client) {
        const db = client.db(dbName);
        const collection = db.collection('dinosaures');
        if (req.body.age && req.body.famille) {
            collection.insert({age:req.body.age,famille:req.body.famille}, function(err) {
                app.locals.msg = {text:'Dinosaure ajouté',class:'success'};
            res.redirect('/admin/add-dinosaures');
            });
        } else {
            app.locals.msg = {text:'Titre et/ou contenu vide(s)',class:'danger'};
            res.redirect('/admin/add-dinosaures');
        }
    });
});

router.get('/list-dinosaures',function(req,res,next) {
    MongoClient.connect(url,{useNewUrlParser: true}, function(err,client) {
        const db = client.db(dbName);
        const collection = db.collection('dinosaures');
        collection.find().toArray(function(err,docs) {
            datas.docs = docs;
            datas.title = 'Administration des dinosaures';
            res.render('list-dinosaures',datas);
        });
    });
});

router.get('/modify-dinosaure/:id',function(req,res,next) {
    if (req.params.id) {
        MongoClient.connect(url,{useNewUrlParser: true}, function(err,client) {
            const db = client.db(dbName);
            const collection = db.collection('dinosaures');
            const id = new ObjectId(req.params.id);
            collection.find({_id:id}).toArray(function(err,docs) {
                datas.docs = docs;
                datas.title = 'Modification d\'un Dinosaure';
                res.render('modify-dinosaure',datas);
            });
        });
    } else {
        app.locals.msg = {text:'Le Dinosaure n\'existe pas',class:'danger'};
        res.redirect('/admin/list-dinosaures');
    }
});

router.post('/change-dinosaures',function(req,res,next) {
    MongoClient.connect(url,{useNewUrlParser: true}, function(err,client) {
        const db = client.db(dbName);
        const collection = db.collection('dinosaures');
        const id = new ObjectId(req.body.id);
        collection.find({_id:id}).toArray(function(err,docs) {
            if (docs.length) {
                collection.updateOne({_id:id},{$set:{age:req.body.age,famille:req.body.famille,race:req.session.identifiant}}, function(err) {
                    app.locals.msg = {text:'Dinosaure modifié',class:'success'};
                res.redirect('/admin/list-dinosaures');
                });
            } else {
                app.locals.msg = {text:'Le Dinosaure n\'existe pas',class:'danger'};
                res.redirect('/admin/list-dinosaures');
            }
        });
    });
});

router.get('/supprimer-dinosaure/:id',function(req,res,next) {
    MongoClient.connect(url,{useNewUrlParser: true}, function(err,client) {
        const db = client.db(dbName);
        const collection = db.collection('dinosaures');
        const id = new ObjectId(req.body.id);
        collection.find({_id:id}).toArray(function(err,docs) {
            if (docs[0]._id) {
                collection.remove({_id:$oid},{$set:{age:req.body.age,famille:req.body.famille,race:req.session.identifiant}}, function(err){
                app.locals.msg = {text:'Dinosaure à été supprimé',class:'success'};
                res.redirect('/admin/list-dinosaures');
                });
            } else {
                app.locals.msg = {text:'Le Dinosaure n\'existe pas',class:'danger'};
                res.redirect('/admin/list-dinosaures');
            }
        });
    });
});

module.exports = router;