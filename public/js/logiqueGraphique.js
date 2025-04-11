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
                        creerSectionGraphique("bar", capteur_nom, donnee_nom, date, donnee_valeur)

                    })
                }
            }
        })

}

function creerSectionGraphique(typeGraphique, capteur_nom, donnee_nom, donneeX, donneeY) {
    // Container general
    const {arrierePlan, boiteDuContenu} = creerContainerGraphique();

    const {canvasGraph, containerContenu} = creerCanvasEtBoutons(donneeX.length);

    boiteDuContenu.appendChild(containerContenu);

    // Tableau des statistiques
    const tableauStats = creerTableauStats(donneeY);
    boiteDuContenu.appendChild(tableauStats);
    
    const graphique = creerGraphique(canvasGraph, typeGraphique,capteur_nom,donnee_nom,donneeX,donneeY);

    containerGraphSimple.appendChild(arrierePlan);
}

function creerTableauStats(donneesY){
    var tableauStats = document.createElement("div");
    tableauStats.className = "graph-stats";
    return tableauStats;
}

function creerContainerGraphique(){
    // Container general
    var arrierePlan = document.createElement("div");
    arrierePlan.className = "graph-section";

    // div pour placer au milieux les elements
    var boiteDuContenu = document.createElement("div");
    boiteDuContenu.className = "graph-container-all";

    arrierePlan.appendChild(boiteDuContenu);

    return {arrierePlan,boiteDuContenu}
}

function creerCanvasEtBoutons(nbDonneesX){
    // canvas avec les buttons
    var containerContenu = document.createElement("div");
    containerContenu.className = "graph-container-1";

    // canvas
    var canvasContainer = document.createElement("div");
    canvasContainer.className = "canvas-container";

    var canvasGraph = document.createElement("canvas");
    canvasGraph.id = "graphique";
    canvasGraph.width = nbDonneesX * 50;
    canvasGraph.height = 300;
    canvasGraph.style.width = nbDonneesX * 50+ "px"; 
    canvasGraph.style.height = 300+ "px";

    canvasContainer.appendChild(canvasGraph);

    // Buttons
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

    return {canvasGraph, containerContenu}
}


function creerGraphique(canvasGraph, typeGraphique, capteur_nom, donnee_nom, donneeX, donneeY){
 // creation du graophique
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
    label.innerText = "Activer le capteur "+capteur_nom;


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