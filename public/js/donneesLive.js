class DonneesLive {
    // Méthode pour récupérer les données live et les afficher dans des boîtes
    async creeBoiteDonneesLive() {
      try {
        // On recupere les données en temps réel avec le POST
        const response = await fetch(`/capteurs/chercher-donnees-live`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        
        });
   
        const data = await response.json();
   
        if (data.success && data.donnees) {
          // On doit supprimer les anciennes boites avant de recréer les nouvelles
          document.getElementById('container').innerHTML = '';
   
          // On crée une boîte pour chaque capteur
          data.donnees.capteurs.forEach((capteur) => {
            const capteurDiv = document.createElement('div');
            capteurDiv.classList.add('capteur');
   
        
            const nomCapteurDiv = document.createElement('div');
            nomCapteurDiv.classList.add('nom-forme');
            nomCapteurDiv.textContent = capteur.nom_capteur;
            capteurDiv.appendChild(nomCapteurDiv);
   
            
            const nomDonneeDiv = document.createElement('div');
            nomDonneeDiv.classList.add('nom-forme');
            nomDonneeDiv.textContent = capteur.nom_donnee;
            capteurDiv.appendChild(nomDonneeDiv);
   
            
            const valeurDonneeDiv = document.createElement('div');
            valeurDonneeDiv.classList.add('valeur-donne');
            valeurDonneeDiv.textContent = capteur.donnee_collectee;
            capteurDiv.appendChild(valeurDonneeDiv);
   
            // On ajoute la boîte à la section des capteurs
            document.getElementById('container').appendChild(capteurDiv);
          });
        } else {
          console.error('Erreur dans les données reçues.');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    }
   
// On rafraichit les données à chaque 30 secondes
    startRafraichissement() {
      setInterval(() => {
        this.creeBoiteDonneesLive();
      }, 30000); //  = 30 secondes
    }
}