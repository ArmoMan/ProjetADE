const bdUtilisateur = require("../config/bd-utilisateur");
const utilisateur = new bdUtilisateur();
const { generateApiKey } = require('generate-api-key');

class UtilisateurControleur {

    // Vérifier que l'utilisateur existe dans la session et dans la base de données
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


    // methode pour creer un compte
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

    // Generer une cle api unique
    async genererAPI(){
        let cle_api_temp = generateApiKey({ method: 'bytes', min: 17, max: 40 });
        let estCleExsitant = await utilisateur.estCleAPIExister(cle_api_temp)
        while(estCleExsitant){
            cle_api_temp = generateApiKey({ method: 'bytes', min: 17, max: 40 });
            estCleExsitant = await utilisateur.estCleAPIExister(cle_api_temp)
        }
        return cle_api_temp;
    }

    // methode pour login
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