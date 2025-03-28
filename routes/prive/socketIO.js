require('dotenv').config();
const http = require('http');
const socketIo = require('socket.io');
const BaseDonne = require('./BaseDonne'); // import de BaseDonne pour la vérification de la clé API

const server = http.createServer();

const io = socketIo(server);

server.listen(4545, () => {
  console.log("Server is listening on port 4545");
});

let lesAppareils = new Map();

io.on('connection', async (socket) => { 
  // On recupere la cle et on verifie si elle est presente sinon on deconnecte
  const apiKey = socket.handshake.headers['cle_api'];

  if (!apiKey) {
    socket.disconnect(true);
    return;
  }
  
  // On verifie la cle API dans la base de donnees
  try {
    const dbUtil = new DBUtilisateur();
    const cleExiste = await dbUtil.estCleAPIExister(apiKey);
    if (!cleExiste) {
      socket.disconnect(true);
      return;
    }
  } catch (err) {
    socket.disconnect(true);
    return;
  }
  
  // On ajoute l'appareil à la Map avec sa clé API
  lesAppareils.set(apiKey, socket);
  console.log(`[Server] Client connecté avec la cle_api: ${apiKey}`);

  // déconnexion et on enleve le socket de la map
  socket.on('disconnect', () => {
    console.log("[Server] Client disconnected");
    lesAppareils.delete(apiKey);
  });
});
