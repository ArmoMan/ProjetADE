const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const routesCompte = require('./routes/compte')
const routesAutre = require('./routes/accueil')

// pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// mettre en place les routes / directions de navigation
app.use('/personne', routesCompte);
app.use('/', routesAutre);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})