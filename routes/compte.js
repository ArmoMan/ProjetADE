const express = require('express')
const router = express.Router()
const path = require('path');

/*
 ici c'est pour les routes et logique pour la creation et gestion des comptes
 */

 /* note le ../ c'est pour dire "retourne vers le dossier d'avant" 
  , car comme on est dans /routes, il faut retourner, et puis rentrer dans /views */
  
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'login.html'))
})

router.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '../views', 'signup.html'))
})

module.exports = router;