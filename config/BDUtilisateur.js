require('dotenv').config();
const mysql = require('mysql2/promise');

class DBUtilisateur {
    constructor() {
        this.db = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
    }

    // Vérifier si l'email est déjà pris
    async estEmailPris(email) {
        const [rows] = await this.db.query("SELECT * FROM utilisateur WHERE nom = ?", [email]);
        return rows.length > 0;
    }

    // Vérifier si la clé API existe déjà
    async estCleAPIExister(cle_api) {
        const [rows] = await this.db.query("SELECT * FROM utilisateur WHERE cle_api = ?", [cle_api]);
        return rows.length > 0;
    }

    // Ajouter un utilisateur
    async ajouterUtilisateur(email, pass, cle_api) {
        const hashPass = await require('bcrypt').hash(pass, 10);
        await this.db.query("INSERT INTO utilisateur (nom, password, cle_api) VALUES (?, ?, ?)", [email, hashPass, cle_api]);
    }

    // Vérifier si un compte existe avec un email et un mot de passe
    async estCompteExistant(email, pass) {
        const [rows] = await this.db.query("SELECT password FROM utilisateur WHERE nom = ?", [email]);
        if (rows.length === 0) return false;

        const match = await require('bcrypt').compare(pass, rows[0].password);
        return match;
    }
}

module.exports = DBUtilisateur;
