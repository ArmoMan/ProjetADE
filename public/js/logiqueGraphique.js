const { response } = require("express");

const barCanvas = document.getElementById("graphiqueSimple");
const containerGraphSimple = document.getElementById("containerGraphSimple");
window.onload = recupererDonnees();

function recupererDonnees() {
    fetch("/capteurs/chercher-donnees", {
        method: "POST"
    })
        .then((response) => {
            if (response.success == true) {
                if (Array.isArray(response.donnees)) {
                    response.donnees.forEach((donnee) => {
                        const capteur_nom = donnee.capteur_nom;
                        const donnee_nom = donnee.donnee_nom;
                        const est_actionnable = donnee.est_actionnable;
                        const donnee_valeur = donnee.donnee_valeur;
                        const date = donnee.date;


                        
                        if (est_actionnable) {
                            creerToggleSwitch()
                        }

                        // Creer un graphique avec les donnees
                        creerGraphique("bar", capteur_nom, donnee_nom, date, donnee_valeur)

                    })
                }
            }
        })

}

function creerGraphique(typeGraphique, capteur_nom, donnee_nom, donneeX, donneeY) {
    var canvasGraph = document.createElement("canvas");
    canvasGraph.className = "graphe-lineaire";
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

    })
    containerGraphSimple.appendChild(canvasGraph)
}

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