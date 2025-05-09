const bcrypt = require('bcrypt');
const baseDonne = require("./base-donne");

/**
 * Cette classe fait appel à BaseDonne, mais cette fois-ci pour interagir avec la table des utilisateurs. 
 * Elle permet de vérifier si un compte, une clé API ou un courriel existe déjà. 
 * Elle permet aussi d’ajouter un utilisateur et de récupérer sa clé API à partir de son courriel.
 */
class DBUtilisateur {

    // cherche un utilisateur par son email, this.db.query(...) retourne un tableau contenant les résultats,
    // Si rows.length > 0 = l'email existe deja = retourne true
    // Sinon email est libre = retourne false

    // Commentaire general : await empêche le programme de continuer tant que ces étapes ne sont pas finies 
    // meme chose pour async mais pour les fonctions
    
    /**
     * Méthode pour vérifier si un courriel existe dans la base de données, dans la table des utilisateurs.
     * @param {string} email est le mail à vérifier.
     * @returns {boolean} est true si trouvé et si non false.
     */
    async estEmailPris(email) {
        const [lignes] = await baseDonne.poolConnexion.query("SELECT * FROM utilisateur WHERE email = ?", [email]);
        return lignes.length > 0;
    }

    /**
     * Méthode pour vérifier si la clé API existe dans la table des "utilisateur" de la base de données.
     * @param {string} cle_api est la clé api à vérifier.
     * @returns {boolean} est true si trouvée et si non.
     */
    // meme concept que pour trouver un email deja existant pour pas que deux utilisateurs ai la meme cle api
    async estCleAPIExister(cle_api) {
        const [lignes] = await baseDonne.poolConnexion.query("SELECT * FROM utilisateur WHERE cle_api = ?", [cle_api]);
        return lignes.length > 0;
    }


    /**
     * Méthode pour ajouter un utilisateur dans la table des utilisateurs de la base de données.
     * @param {string} email est le mail de l'utilisateur.
     * @param {string} pass est le mot de passe.
     * @param {string} cle_api est la clé api.
     */
    async ajouterUtilisateur(email, pass, cle_api) {
        // on vien hacher le mot de passe pour le stocker dans la base de donnée 
        // et ? sont des parametres securise pour eviter les injections sql
        const hashPass = await bcrypt.hash(pass, 10);
        await baseDonne.poolConnexion.query("INSERT INTO utilisateur (email, password, cle_api) VALUES (?, ?, ?)", [email, hashPass, cle_api]);
    }

    /**
     * Méthode pour vérifier si un compte existe dans la base de données (table utilisateur)
     * @param {string} email est le mail de l'utilisateur.
     * @param {string} pass  est le mot de passe.
     * @returns {boolean} est true si réussi et false si non.
     */
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

    /**
     * Méthode pour récupérer la clé API associée à une adresse courriel.
     * @param {string} email est le courriel pour lequel on souhaite obtenir la clé api.
     * @returns {string ou null} true si trouvée et null en cas d’erreur.
     */
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
