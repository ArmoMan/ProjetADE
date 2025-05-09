const baseDonne = require("./base-donne");
 
/**
 * DBCapteur est une classe qui fait appel à BaseDonne pour interagir avec la table des capteurs.
 * Elle permet d’ajouter, de supprimer et de récupérer les données des capteurs.
 */
class DBCapteur {
 
    /**
     * Méthode pour ajouter dans la base de données les données récupérées par un capteur.
     * @param {string} cle_api est la clé apu de l'utilisateur
     * @param {string} capteur_nom est le nom du capteur
     * @param {string} donnee_nom est nom de la donnée (exemple : Temperature C)
     * @param {number} donnee_valeur est la valeur récupérée par le capteur
     * @param {boolean} est_actionnable true pour un capteur actionnable, false pour les autres
     * @returns {boolean} true si l’ajout a été réussi et sinon false. 
     */
    async ajouterCapteur(cle_api, capteur_nom, donnee_nom, donnee_valeur, est_actionnable) {
        try {
            // Vérifier si la clé API existe avant d’insérer un capteur
            const [lignes] = await baseDonne.poolConnexion.query("SELECT cle_api FROM utilisateur WHERE cle_api = ?", [cle_api]);
            if (lignes.length === 0) {
                console.error("Clé API invalide :", cle_api);
                return false;
            }
 
            await baseDonne.poolConnexion.query(
                "INSERT INTO capteur (cle_api, capteur_nom, donnee_nom, donnee_valeur, est_actionnable) VALUES (?, ?, ?, ?, ?)",
                [cle_api, capteur_nom, donnee_nom, donnee_valeur, est_actionnable]
            );
            return true;
        } catch (err) {
            console.error("Erreur lors de l'ajout du capteur :", err);
            return false;
        }
    }
 
    
    /**
     * Méthode pour supprimer un capteur spécifique en fonction de son nom et de la clé API.
     * @param {string} capteur_nom est le nom du capteur qu’on veut supprimer
     * @param {string} cle_api est la clé API que le capteur utilise et qu’on veut supprimer
     * @returns {boolean} true si cela a été réussi, sinon false.
     */
    async supprimerCapteur(capteur_nom, cle_api) {
        try {
            const [result] = await baseDonne.poolConnexion.query("DELETE FROM capteur WHERE capteur_nom = ? AND cle_api = ?", [capteur_nom, cle_api]);
            return result.affectedRows > 0;
        } catch (err) {
            console.error("Erreur lors de la suppression du capteur :", err);
            return false;
        }
    }
 
    /**
     * Méthode pour récupérer les données des capteurs associées à une clé API donnée.
     * Ça regroupe toutes les valeurs et leurs dates de création par capteur, puis retourne un tableau.
     * 
     * Chaque élément du tableau contient :
     * le nom du capteur, le nom de la donnée, un boolean qui indique si le capteur est actionnable, 
     * une liste des valeurs collectées, une liste des dates de la collecte de chaque valeur.
     * 
     * @param {string} cle_api est la clé api du client dont on veut récupérer les données.
     * @returns un tableau d’objets contenant les données des capteurs si la requête réussit ou un { error: "Impossible de récupérer les données des capteurs." }; en cas d’échec.
     */
    async recupererDonnees(cle_api) {
        try {
            const [rows] = await baseDonne.poolConnexion.query(`
                SELECT
                    capteur_nom,
                    donnee_nom,
                    est_actionnable,
                    JSON_ARRAYAGG(donnee_valeur) AS donnee_valeur,
                    JSON_ARRAYAGG(date_creation) AS date
                FROM capteur
                WHERE cle_api = ?
                GROUP BY capteur_nom, donnee_nom, est_actionnable
                ORDER BY MIN(date_creation) ASC
            `, [cle_api]);
 
            return rows;
        } catch (err) {
            console.error("Erreur lors de la récupération des données du capteur :", err);
            return { error: "Impossible de récupérer les données des capteurs." };
        }
    }
}
 
module.exports = new DBCapteur();