const bcrypt = require('bcrypt');
const baseDonne = require("./base-donne");

class DBUtilisateur {

    // cherche un utilisateur par son email, this.db.query(...) retourne un tableau contenant les résultats,
    // Si rows.length > 0 = l'email existe deja = retourne true
    // Sinon email est libre = retourne false

    // Commentaire general : await empêche le programme de continuer tant que ces étapes ne sont pas finies 
    // meme chose pour async mais pour les fonctions
    
    async estEmailPris(email) {
        const [lignes] = await baseDonne.poolConnexion.query("SELECT * FROM utilisateur WHERE email = ?", [email]);
        return lignes.length > 0;
    }

    // meme concept que pour trouver un email deja existant pour pas que deux utilisateurs ai la meme cle api
    async estCleAPIExister(cle_api) {
        const [lignes] = await baseDonne.poolConnexion.query("SELECT * FROM utilisateur WHERE cle_api = ?", [cle_api]);
        return lignes.length > 0;
    }

    // on vien hacher le mot de passe pour le stocker dans la base de donnée 
    // et ? sont des parametres securise pour eviter les injections sql

    async ajouterUtilisateur(email, pass, cle_api) {
        const hashPass = await bcrypt.hash(pass, 10);
        await baseDonne.poolConnexion.query("INSERT INTO utilisateur (email, password, cle_api) VALUES (?, ?, ?)", [email, hashPass, cle_api]);
    }

    // on recherche l'utilisateur par son email, si on trouve pas sa retourne false
    // sinon on compare le mot de passe hacher avec celui dans la base de donnée
    // si ils sont identique on retourne true sinon false 
    // comme sa sa evite qu un utilisateur rentre le mauvais mdp

    async estCompteExistant(email, pass) {
        try{
            const [lignes] = await baseDonne.poolConnexion.query("SELECT password FROM utilisateur WHERE email = ?", [email]);
            if (lignes.length === 0) return false;
            const match = await bcrypt.compare(pass, lignes[0].password);
            return match;
        }catch(err){
            console.log(err)
        }
        return false;
    }

    async recupererCleAPI(email){
        try{
            const [lignes] = await baseDonne.poolConnexion.query("SELECT cle_api FROM utilisateur WHERE email = ?", [email]);
            return lignes[0].cle_api;
        }catch(err){
            return null;
        }
    }
}

module.exports = DBUtilisateur;
