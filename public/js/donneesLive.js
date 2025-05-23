/**
 * Classe responsable de la récupération périodique (toutes les 30 secondes) des données des capteurs et de leur affichage dans des boîtes.
 * Fournit également les fonctionnalités de contrôle des capteurs actionnables.
 */
class DonneesLive {

  /**
   * Méthode pour récupérer les données live et les afficher dans des boîtes
   */
  async #creeBoiteDonneesLive() {
    try {
      // On recupere les données en temps réel avec le POST
      const response = await fetch("/capteurs/chercher-donnees-live", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success && data.donnees) {
        // On doit supprimer les anciennes boites avant de recréer les nouvelles
        document.getElementById("containerCapteur").innerHTML = "";

        // On crée une boîte pour chaque capteur
        data.donnees.appareil.tous_les_capteurs.forEach((capteur) => {
          const capteurDiv = document.createElement("div");
          capteurDiv.classList.add("capteur");

          const nomCapteurDiv = document.createElement("h1");
          nomCapteurDiv.classList.add("nom-forme");
          nomCapteurDiv.textContent = capteur.nom_capteur;
          capteurDiv.appendChild(nomCapteurDiv);

          const nomDonneeDiv = document.createElement("div");
          nomDonneeDiv.classList.add("nom-forme");
          nomDonneeDiv.textContent = capteur.nom_donnee;
          capteurDiv.appendChild(nomDonneeDiv);

          const valeurDonneeDiv = document.createElement("div");
          valeurDonneeDiv.classList.add("valeur-donne");
          valeurDonneeDiv.style.textAlign = "center";
          valeurDonneeDiv.textContent = capteur.donnee_collectee.toFixed(2);
          capteurDiv.appendChild(valeurDonneeDiv);

          // Si le capteur est actionnable, ajouter un button actioner
          if (capteur.est_actionnable) {
            const button =  this.#creerButtonAction(capteur.donnee_collectee,capteur.nom_capteur,valeurDonneeDiv);
            capteurDiv.appendChild(button);
          }

          // On ajoute la boîte à la section des capteurs
          document.getElementById("containerCapteur").appendChild(capteurDiv);
        });
      } else {
        console.error("Erreur dans les données reçues.");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    }
  }

  /**
  * Méthode pour créer un bouton permettant d'allumer ou d'éteindre un capteur.
  * @param {number} estActionner est de 1 pour éteindre, 0 pour allumer.
  * @param {string} nomCapteur set le nom du capteur concerné.
  * @param {HTMLDivElement} valeurDonneeDiv -est le div dans lequel afficher la valeur selon le clic du bouton.
  * @returns {HTMLButtonElement} Le bouton HTML créé.
  */
  #creerButtonAction(estActionner, nomCapteur,valeurDonneeDiv) {
    const button = document.createElement("button");
    button.className = "button-normal";

    if (estActionner == 1) {
      button.textContent = "Éteindre";
    } else {
      button.textContent = "Allumer";
    }

    // changer de texte lorsqu'on appuie dessus
    button.addEventListener("click",   async () => {
      const estReussi =  await this.#activerCapteur(nomCapteur);
      if(estReussi){
        valeurDonneeDiv.textContent = "Réussi. Dans quelques secondes, les résultats seront mis à jour."
        button.textContent = button.textContent === "Éteindre" ? "Allumer" : "Éteindre";
      }else{
        valeurDonneeDiv.textContent = "Échec"
      }
      
    });

    return button;
  }

/**
 * Méthode pour envoyer une requête post afin d'activer ou d'éteindre un capteur.
 * @param {string} nomCapteur est le nom du capteur à activer ou désactiver.
 * @returns {boolean} true si l'action a réussi, false en cas d'échec.
 */
  async #activerCapteur(nomCapteur) {
    const response = await fetch("/capteurs/actionner", {
      method: "POST",
      body: JSON.stringify({ nomCapteur: nomCapteur }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const donnees = await response.json();
    
    if (donnees.fini == true) {
      console.log("Capteur activé avec succès");
      return true;
    } else {
      console.log("Impossible d'activer le capteur");
      return false;
    }
  }

  /**
  * Méthode pour rafraîchir les données et mettre à jour l'affichage toutes les 30 secondes.
  */
  startRafraichissement() {
    // appeler une premiere fois
    this.#creeBoiteDonneesLive();

    setInterval(() => {
      this.#creeBoiteDonneesLive();
    }, 30000);
  }
}
