
/**
 * Cette classe permet de contenir des méthodes statiques générales qui pourront être utilisées dans le projet.
 */
class Utilitaire {

     /**
     * Ca permet de génèrer une clé api aléatoire de 30 caractères.
     * 
     * @returns {string} la clé api.
     */
    // floor cest pour arrondir vers le bas pour que le caractere reste in bounds math random retourne un nombre entre 0 et 1
    // par le length et on refait sa 30 fois
    static creationCleAPI() {
        const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const longueurCle = 30;
        let cle = '';
 
        for (let i = 0; i < longueurCle; i++) {
            const randomIndex = Math.floor(Math.random() * caracteres.length);
            cle += caracteres[randomIndex];
        }
 
        return cle;
    }
}
 
module.exports = Utilitaire;
 