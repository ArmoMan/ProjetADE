const baseDonne = require("./base-donne");
 
class DBCapteur {
 
    // Ajouter un capteur avec ses données
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
 
    // Supprimer un capteur spécifique en fonction de son nom et de la clé API
    async supprimerCapteur(capteur_nom, cle_api) {
        try {
            const [result] = await baseDonne.poolConnexion.query("DELETE FROM capteur WHERE capteur_nom = ? AND cle_api = ?", [capteur_nom, cle_api]);
            return result.affectedRows > 0; // Retourne `true` si suppression réussie, sinon `false`
        } catch (err) {
            console.error("Erreur lors de la suppression du capteur :", err);
            return false;
        }
    }
 
    // Récupérer les données des capteurs pour une clé API donnée
    async recupererDonnees(cle_api) {
        try {
            const [rows] = await baseDonne.poolConnexion.query(`
                SELECT
                    capteur_nom,
                    donnee_nom,
                    est_actionnable,
                    JSON_ARRAYAGG(donnee_valeur ORDER BY date_creation ASC) AS donne_valeur,
                    JSON_ARRAYAGG(date_creation ORDER BY date_creation ASC) AS date
                FROM capteur
                WHERE cle_api = ?
                GROUP BY capteur_nom, donnee_nom
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