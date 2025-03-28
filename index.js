const express = require('express');
const app = express();
const session = require('express-session');
const port = 3000;
const path = require('path');
const routesCompte = require('./routes/public/compte');
const routesMaison = require('./routes/public/information');
const routesAutre = require('./routes/prive/autre');
const routesSocket= require('./routes/prive/socketio-post');
const socketIO = require('./controleur/socketio-controleur')

// Pour recommencer votre base de donnees faire ca: 
// const baseDonne = require("./config/base-donne");
// baseDonne.recommencerTables();

//ejs 
app.set('views', './views'); 
app.set('view engine', 'ejs');

// pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// pour l'authentification
app.use(session({
    secret: 'keyboard cat cejhc kwehcgkwje hkejcgwjegc wjhecg wejcghw whegcjwegcj wgec jwegcwj egc jwegcj',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Mettre en place le boolean si utilisateur connecter/login ou pas
app.use((req, res, next) => {
    res.locals.estConnecter = req.session.estConnecter || false;
    next();
});

// commencer socketio connexion
socketIO.commencer(4545);

// mettre en place les routes / directions de navigation
app.use('/', routesCompte);
app.use('/',routesMaison);
app.use('/utilisateur', routesAutre);
app.use('/capteurs', routesSocket);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});