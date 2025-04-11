const express = require('express');
const router = express.Router();
const utilisateurControleur = require('../../controleur/utilisateur-controleur');
const socketIO = require('../../controleur/socketio-controleur');
const dbCapteur = require('../../config/bd-capteurs');

/**
 * Post request pour actioner le capteur choisi
 */
router.post('/actionner',utilisateurControleur.authentifier, async (req,res) => {
    try{
        const nomCapteur = req.body.nomCapteur;
        const sockets = await socketIO.getIO().in(req.session.cle_api).fetchSockets();
        const client = sockets[0];

        if(!client) return res.json({fini: false});
  
        const reponse = await client.timeout(5000).emitWithAck('commande', { commande: 'actionner' ,nom_capteur: nomCapteur});
        const jsonReponse = JSON.parse(reponse);


        return res.json(jsonReponse);
    }catch(e){
        return res.json({fini: false});
    }
});

/**
 * Post request qui retroune les donnees de la base de donnees. 
 */
router.post('/chercher-donnees',utilisateurControleur.authentifier, async (req,res) => {
    try{
        const donnees = await dbCapteur.recupererDonnees(req.session.cle_api);
        console.log("dans donnees")
        if(donnees && donnees.error){
            return res.json({success:false, donnees:donnees.error });
        }

        res.json({success:true, donnees: donnees});  

    }catch(e){
        res.json({success:false, donnees: e});
    }
});

/**
 * Post request qui retourne les donnees en temps reel des capteurs
 */
router.post('/chercher-donnees-live',utilisateurControleur.authentifier, async (req,res) => {
    const donnees = await chercherDonnees(req.session.cle_api);
    if(donnees != undefined){
        res.json({success:true, donnees: donnees});  
    }else{
        res.json({success:false, donnees: "undefined"});
    }
});


/**
 * Methode pour aller prendre des donnees en temps reel des capteurs
 * @param {*} cleAPI la cle api de l'utilisateur
 * @returns undefined si pas de donnees ou les donnees en forme json
 */
async function chercherDonnees(cleAPI){
    try {
        const sockets = await socketIO.getIO().in(cleAPI).fetchSockets();
        const client = sockets[0];
  
        const reponse = await client.timeout(5000).emitWithAck('commande', { commande: 'envoyer_donnees' });
        const jsonReponse = JSON.parse(reponse);
        return jsonReponse
      } catch (e) {
        return undefined;
      }
}

// Boolean qui permet de ne pas appeler ce methode 2 fois de suite
let estCeQueChercherDonnees = false;
/**
 * Methode pour aller chercher les donnees des capteurs et les enregistrer dans la base de donnees.
 * @returns rien
 */
async function enregistrerDonneesChaque() {
    console.log("dans enregistrerDonneesChaque")
    if(estCeQueChercherDonnees) return;
    estCeQueChercherDonnees = true;

    const toutSockets = await socketIO.getIO().fetchSockets();

    for (const socket of toutSockets){
        try{
            const reponse = await socket.timeout(5000).emitWithAck('commande', { commande: 'envoyer_donnees' });
            const jsonReponse = JSON.parse(reponse);

             // ajouter les capteurs dans bd
            const capteurs = jsonReponse.appareil.tous_les_capteurs;
            const cleAPI = jsonReponse.appareil.cle_api;

            if (Array.isArray(capteurs)) {
                capteurs.forEach(async (capteur) => {
                    console.log(capteur.nom_capteur);
                    await dbCapteur.ajouterCapteur(cleAPI,capteur.nom_capteur,capteur.nom_donnee, capteur.donnee_collectee, capteur.est_actionnable );
                });
            } else {
              console.log("Pas de capteurs actifs.");
            }
        }catch(e){

        }finally{
            // Une fois la tache fini, mettre le boolean false
            estCeQueChercherDonnees = false;
        }
    }
  

}
// recuperer et enregistrer donnees chaque 10 minutes
setInterval(enregistrerDonneesChaque, 600000);

module.exports = router;