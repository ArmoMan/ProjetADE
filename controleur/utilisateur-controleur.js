const bdUtilisateur = require("../config/bd-utilisateur");
const utilisateur = new bdUtilisateur();
const { generateApiKey } = require('generate-api-key');

 /**
 * Classe responsable de la gestion de l'authentification (req, res, next), de la création de compte et de la connexion.
 * La esponsabilité principale est de gérer la logique, les erreurs et les sessions.
 * Contrairement à BDUtilisateur, elle gère les erreurs et les renvoie dans un format uniforme { estReussi: boolean, message: string }
 */
class UtilisateurControleur {

    
    /**
     * Vérifier que l'utilisateur existe dans la session et dans la base de données
     * 
     * @param {*} req requête express.
     * @param {*} res réponse express.
     * @param {*} next fonction suivante de express.
     * @returns vers /signup si le compte n'existe pas et fait fonction suivant si ca existe
     */
    async authentifier(req, res, next) {
        try{
            if (!req.session.email || !req.session.cle_api) {
                return res.redirect('/signup');
            }
    
            const estEmailPris = await utilisateur.estEmailPris(req.session.email);
            const estCleAPIExister = await utilisateur.estCleAPIExister(req.session.cle_api);

            if (estEmailPris && estCleAPIExister) {
                return next();
            }  

            return res.redirect('/signup');

        }catch(err){
            console.log(err);
            return res.redirect('/signup');
        }
    }


    /**
     * Methode pour creer un compte
     * 
     * @param {string} email est l'adresse email de l'utilisateur.
     * @param {string} pass est le mot de passe de l'utilisateur.
     * @returns  { estReussi: boolean, message: string , cle_api: string} ou echec: { estReussi: boolean, message: string};
     */
    async creerCompte(email, pass) {
        const CLE_API = await this.genererAPI(); 
        try {
            // Vérifier que le compte n'existe pas
            const estCompteExistant = await utilisateur.estCompteExistant(email, pass);
            if (estCompteExistant) {
                return { estReussi: false, message: "Échec de la création du compte" };
            }
    
            // Ajouter l'utilisateur
            await utilisateur.ajouterUtilisateur(email, pass, CLE_API);

            return { estReussi: true, message: "Compte créé avec succès" , cle_api: CLE_API};
    
        } catch (error) {
            return { estReussi: false, message: error.message };
        }
    }

    
    /**
     * Methode pour generer une cle api unique
     * @returns {string} la cle api
     */
    async genererAPI(){
        let cle_api_temp = generateApiKey({ method: 'bytes', min: 17, max: 40 });
        let estCleExsitant = await utilisateur.estCleAPIExister(cle_api_temp)
        while(estCleExsitant){
            cle_api_temp = generateApiKey({ method: 'bytes', min: 17, max: 40 });
            estCleExsitant = await utilisateur.estCleAPIExister(cle_api_temp)
        }
        return cle_api_temp;
    }

    /**
     * Methode pour le login
     * @param {string} email est l'adresse email de l'utilisateur.
     * @param {string} pass est le mot de passe de l'utilisateur.
     * @returns en cas d'echec: { estReussi: boolean, message:string } et en cas de reussite: { estReussi: boolean, cle_api: string }
     */

    async entrerCompte(email, pass) {
        try {
            // Vérifier que le compte n'existe pas
            const estCompteExistant = await utilisateur.estCompteExistant(email, pass);

            if (!estCompteExistant) {
                return { estReussi: false, message: "Impossible de se connecter" };
            }
    
            // Ajouter l'utilisateur
            const CLE_API = await utilisateur.recupererCleAPI(email);
            return { estReussi: true, cle_api: CLE_API };
    
        } catch (error) {
            return { estReussi: false, message: error.message };
        }
    }
}

module.exports = new UtilisateurControleur()