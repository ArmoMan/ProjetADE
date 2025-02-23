const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const routes = require('./routes/compte')

// pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// mettre en place les routes / directions de navigation
app.use('/', routes);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})