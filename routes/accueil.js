/*
 ici c'est pour les routes et logique pour la page des graphiques
 */

const express = require('express')
const router = express.Router()
const path = require('path');

/*
 ici c'est pour les routes et logique pour la creation et gestion des comptes
 */

 /* note le ../ c'est pour dire "retourne vers le dossier d'avant" 
  , car comme on est dans /routes, il faut retourner, et puis rentrer dans /views */
  
router.get('/accueil', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'accueil.html'))
})

module.exports = router;