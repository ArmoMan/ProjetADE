require('dotenv').config();
const mysql = require('mysql2/promise');

/**
 * Classe pour créer une connexion à la base de données et qui permet aussi de recommencer les tables
 */
class BaseDonne{
    
    constructor(){
        this.poolConnexion = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
    }

    /**
     * Methode pour effacer les tables capteur et utilisateur pour ensuite les recreer
     */
    async recommencerTables(){
        try{
            await this.poolConnexion.query("DROP TABLE IF EXISTS capteur;");
            await this.poolConnexion.query("DROP TABLE IF EXISTS utilisateur;");
            await this.poolConnexion.query(`
                CREATE TABLE IF NOT EXISTS utilisateur (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                cle_api VARCHAR(255) UNIQUE NOT NULL,
                date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            await this.poolConnexion.query(`
                CREATE TABLE IF NOT EXISTS capteur (
                id INT AUTO_INCREMENT PRIMARY KEY,
                cle_api VARCHAR(255) NOT NULL,
                capteur_nom VARCHAR(255) NOT NULL,
                donnee_nom VARCHAR(255) NOT NULL,
                donnee_valeur FLOAT NOT NULL,
                date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                est_actionnable BOOLEAN NOT NULL,
                FOREIGN KEY (cle_api) REFERENCES utilisateur(cle_api) ON DELETE CASCADE
                );
            `);
            
        }catch(err){
            console.log(err);
        }
    }
}

module.exports = new BaseDonne();