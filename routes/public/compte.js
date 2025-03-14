const express = require('express');
const router = express.Router();
const utilisateurControleur = require('../../controleur/utilisateur-controleur');
/*
 ici c'est pour les routes et logique pour la creation et gestion des comptes
 */

 /* note le ../ c'est pour dire "retourne vers le dossier d'avant" 
  , car comme on est dans /routes, il faut retourner, et puis rentrer dans /views */
  
router.get('/login', (req, res) => {
    res.render('login',{erreur: null});
});

router.get('/signup', (req, res) => {
    res.render('signup', {erreur: null});
});

router.post('/signup', async (req, res)=> {
    const { email, password } = req.body;

    // creer un compte
    const resultatConnexion = await utilisateurControleur.creerCompte(email, password);
    if(resultatConnexion.estReussi){
        req.session.cle_api = resultatConnexion.cle_api;
        req.session.email = email;
        req.session.estConnecter = true;

        // Attendre que c'est enregsitre
        req.session.save(function(err) { 
            res.redirect('/utilisateur/pageAPI');
        })
       
    }else{
        return res.render('signup', {erreur: resultatConnexion.message});
    }
});

router.post('/login', async (req, res)=> {
    const { email, password } = req.body;

    // se connecter
    const resultatConnexion = await utilisateurControleur.entrerCompte(email, password);
    if(resultatConnexion.estReussi){
        req.session.email = email;
        req.session.cle_api = resultatConnexion.cle_api;
        req.session.estConnecter = true;
        // Attendre que c'est enregsitre
        req.session.save(function(err) { 
            res.redirect('/utilisateur/accueil');
        })
    }else{
        return res.render('login', {erreur: resultatConnexion.message});
    }
});

module.exports = router;