require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

class DBUtilisateur {

    //connexion sql via un pool de connexion
    constructor() {
        this.db = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });
    }

    // cherche un utilisateur par son email, this.db.query(...) retourne un tableau contenant les résultats,
    // Si rows.length > 0 = l'email existe deja = retourne true
    // Sinon email est libre = retourne false

    // Commentaire general : await empêche le programme de continuer tant que ces étapes ne sont pas finies 
    // meme chose pour async mais pour les fonctions
    
    async estEmailPris(email) {
        const [rows] = await this.db.query("SELECT * FROM utilisateur WHERE nom = ?", [email]);
        return rows.length > 0;
    }

    // meme concept que pour trouver un email deja existant pour pas que deux utilisateurs ai la meme cle api
    async estCleAPIExister(cle_api) {
        const [rows] = await this.db.query("SELECT * FROM utilisateur WHERE cle_api = ?", [cle_api]);
        return rows.length > 0;
    }

    // on vien hacher le mot de passe pour le stocker dans la base de donnée 
    // et ? sont des parametres securise pour eviter les injections sql

    async ajouterUtilisateur(email, pass, cle_api) {
        const hashPass = await bcrypt.hash(pass, 10);
        await this.db.query("INSERT INTO utilisateur (nom, password, cle_api) VALUES (?, ?, ?)", [email, hashPass, cle_api]);
    }

    // on recherche l'utilisateur par son email, si on trouve pas sa retourne false
    // sinon on compare le mot de passe hacher avec celui dans la base de donnée
    // si ils sont identique on retourne true sinon false 
    // comme sa sa evite qu un utilisateur rentre le mauvais mdp

    async estCompteExistant(email, pass) {
        const [rows] = await this.db.query("SELECT password FROM utilisateur WHERE nom = ?", [email]);
        if (rows.length === 0) return false;

        const match = await bcrypt.compare(pass, rows[0].password);
        return match;
    }
}

module.exports = DBUtilisateur;
