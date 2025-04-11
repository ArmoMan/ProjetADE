const containerGraphSimple = document.getElementById("containerGraphSimple");
window.onload = recupererDonnees;

function recupererDonnees() {
    fetch("/capteurs/chercher-donnees", {
        method: "POST"
    })
        .then((response) => response.json())
        .then((donnees) => {
            if (donnees.success == true) {
                if (Array.isArray(donnees.donnees)) {
                    donnees.donnees.forEach((donnees) => {
                        const capteur_nom = donnees.capteur_nom;
                        const donnee_nom = donnees.donnee_nom;
                        const est_actionnable = donnees.est_actionnable;
                        const donnee_valeur = donnees.donnee_valeur;
                        const date = donnees.date;


                        // Creer un graphique avec les donnees
                        creerSectionGraphique("line", capteur_nom, donnee_nom, date, donnee_valeur)

                    })
                }
            }
        })

}

function creerSectionGraphique(typeGraphique, capteur_nom, donnee_nom, donneesX, donneesY) {
    // Container general
    const { arrierePlan, boiteDuContenu } = creerContainerGraphique();

    const { canvasGraph, containerContenu } = creerCanvasEtBoutons(donneesX.length);

    boiteDuContenu.appendChild(containerContenu);

    // Tableau des statistiques
    const tableauStats = creerTableauStats(donneesY);
    boiteDuContenu.appendChild(tableauStats);

    const graphique = creerGraphiqueStatique(canvasGraph, typeGraphique, capteur_nom, donnee_nom, donneesX, donneesY);

    containerGraphSimple.appendChild(arrierePlan);
}

function creerTableauStats(donneesY) {
    // Calcul des statistiques
    const moyenne = calculerMoyenne(donneesY);
    const mediane = calculerMediane(donneesY);
    const max = Math.max(...donneesY);
    const min = Math.min(...donneesY);


    var tableauStats = document.createElement("div");
    tableauStats.className = "graph-stats";

    // Ajout des statistiques au conteneur
    tableauStats.innerHTML = `
        <p>Moyenne: ${moyenne.toFixed(2)}</p>
        <p>Médiane: ${mediane.toFixed(2)}</p>
        <p>Max: ${max.toFixed(2)}</p>
        <p>Min: ${min.toFixed(2)}</p>
        `;


    return tableauStats;
}

// Fonction pour calculer la moyenne
function calculerMoyenne(donneesY) {
    const somme = donneesY.reduce((acc, val) => acc + val, 0);
    return somme / donneesY.length;
}

// Fonction pour calculer la médiane
function calculerMediane(donneesY) {
    const donneesTriees = [...donneesY].sort((a, b) => a - b);
    const milieu = Math.floor(donneesTriees.length / 2);

    if (donneesTriees.length % 2 === 0) {
        return (donneesTriees[milieu - 1] + donneesTriees[milieu]) / 2;
    } else {
        return donneesTriees[milieu];
    }
}

function creerContainerGraphique() {
    // Container general
    var arrierePlan = document.createElement("div");
    arrierePlan.className = "graph-section";

    // div pour placer au milieux les elements
    var boiteDuContenu = document.createElement("div");
    boiteDuContenu.className = "graph-container-all";

    arrierePlan.appendChild(boiteDuContenu);

    return { arrierePlan, boiteDuContenu }
}

function creerCanvasEtBoutons(nbDonneesX) {
    // canvas avec les boutons
    var containerContenu = document.createElement("div");
    containerContenu.className = "graph-container-1";

    // Canvas
    var canvasContainer = document.createElement("div");
    canvasContainer.className = "canvas-container";

    var canvasGraph = document.createElement("canvas");
    canvasGraph.id = "graphique";
    canvasGraph.width = nbDonneesX * 50;
    canvasGraph.height = 300;
    canvasGraph.style.width = nbDonneesX * 50 + "px";
    canvasGraph.style.height = 300 + "px";

    canvasContainer.appendChild(canvasGraph);

    // Boutons
    var containerButtons = document.createElement("div");
    containerButtons.className = "graph-buttons";

    var btnMediane = document.createElement("button");
    btnMediane.id = "btnMediane";
    btnMediane.textContent = "Voir la mediane";

    var btnNormal = document.createElement("button");
    btnNormal.id = "btnNormal";
    btnNormal.textContent = "Voir le graphique normal";

    containerButtons.appendChild(btnMediane);
    containerButtons.appendChild(btnNormal);

    containerContenu.appendChild(canvasContainer);
    containerContenu.appendChild(containerButtons);

    return { canvasGraph, containerContenu }
}


function creerGraphiqueStatique(canvasGraph, typeGraphique, capteur_nom, donnee_nom, donneeX, donneeY) {
    // création du graphique
    new Chart(canvasGraph, {
        type: typeGraphique,
        data: {
            labels: donneeX,
            datasets: [{
                label: donnee_nom,
                data: donneeY,

            }]
        },
        options: {
            responsive: false,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: capteur_nom,
                    padding: {
                        top: 10,
                        bottom: 30
                    }
                }
            },

            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }

    });
}















// Methodes a effacer !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function creerToggleSwitch(capteur_nom) {
    var toggleSwitch = document.createElement("input");
    toggleSwitch.type = "checkbox";
    toggleSwitch.className = "toggle-switch";
    toggleSwitch.id = capteur_nom;
    toggleSwitch.onchange = activerCapteur(capteur_nom);

    var label = document.createElement("label");
    label.htmlFor = "toggle-switch";
    label.className = "switch-label";
    label.innerText = "Activer le capteur " + capteur_nom;


    containerGraphSimple.appendChild(toggleSwitch);
    containerGraphSimple.appendChild(label);
}

function activerCapteur(nomCapteur) {
    fetch("/capteurs/actionner", {
        method: "POST",
        body: JSON.stringify({ nomCapteur: nomCapteur }),
        headers: {
            "Content-Type": "application/json"
        }
    })
        .then((response) => {
            if (response.fini == true) {
                console.log("Capteur activé avec succès");
            } else {
                console.log("Impossible d'activer le capteur");
            }
        })
}