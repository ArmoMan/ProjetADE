const express = require('express');
const router = express.Router();
const utilisateurControleur = require('../../controleur/utilisateur-controleur');

/*
 Ici, c'est pour les routes et la logique des pages de l'utilisateur privé
  */

router.get('/pageAPI', utilisateurControleur.authentifier, (req, res) => {
    res.render('page-api', { cle_api: req.session.cle_api });
});

router.get('/accueil',utilisateurControleur.authentifier, (req, res) => {
    res.render('accueil', {estConnecter: req.session.estConnecter || false})
});

module.exports = router;