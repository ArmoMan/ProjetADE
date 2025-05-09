// const server = require('http').createServer(app);
const { Server } = require("socket.io");
const bdUtilisateur = require("../config/bd-utilisateur");
const utilisateur = new bdUtilisateur();
const http = require("http");

/**
 * Classe pour commencer une connexino socketio sur le port voulu 
 */
class SocketIOControleur{
    constructor(){
        this.io = null;
    }

    /**
     * Methode pour commencer la connexion. Si utilisaqteur cle existant, alors le faire entrer dans un room avec le nom de cle.
     * @param {number} portNumero  est le numero du port pour le socketio. Ex: 4545
     */
    commencer(portNumero){
        const socketServeur = http.createServer();
        this.io = new Server(socketServeur);

        this.io.on('connection', async (socket)=> {
            console.log("connexion")
            try{
                const cleApi = socket.handshake.headers['cle_api'];

                if (!cleApi) {
                    socket.disconnect(true);
                    return;
                }
                
                // verifier que la cle existe
                const EST_EXISTANT = await utilisateur.estCleAPIExister(cleApi)
                if(EST_EXISTANT){
                    // Le faire rejoindre "un room"
                    socket.join(cleApi);
                    console.log('client a rejoint la chambre ' + cleApi)
                }else{
                    socket.disconnect(true);
                }
            }catch(e){
                console.log(e)
                socket.disconnect(true);
            }

            socket.on('disconnect', () => {

            });
        })     
        socketServeur.listen(portNumero, () => {
            console.log("port " + portNumero);
        });
    }

    /**
     * Methode pour recuperer le Serveur
     * @returns le Serveur
     */
    getIO(){
        return this.io;
    }

}

module.exports = new SocketIOControleur();