const { response } = require("express");

const barCanvas = document.getElementById("graphiqueSimple");
const containerGraphSimple = document.getElementById("containerGraphSimple");
window.onload = recupererDonnees();


// const barChart = new Chart(barCanvas, {
//     type: "bar",
//     data: {
//         labels: ["test1", "test2", "test2"],
//         datasets: [{
//             data: [240,120,140],

//         }]
//     }
// })

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

                        // Creer un graphique avec les donnees
                        creerGraphique("bar", capteur_nom, donnee_nom, donnee_valeur, date)


                    })
                }
            }
        })

}

// creerGraphique("bar", "Graphique UN", ["test1", "test2", "test3"], [240, 120, 140])
// creerGraphique("doughnut", "Graphique DEUX", ["test1", "test2", "test3", "test4"], [13, 62, 92, 32])
// creerGraphique("line", "Graphique TROIS", ["test1", "test2", "test3"], [213, 543, 432])


function creerGraphique(typeGraphique, capteur_nom, donnee_nom, donneeX, donneeY) {
    var canvasGraph = document.createElement("canvas");
    canvasGraph.className = "graphe-lineaire";
    new Chart(canvasGraph, {
        type: typeGraphique,
        data: {
            labels: donneeX,
            datasets: [{
                label: "exemple de nom de dataset",
                data: donneeY,

            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: titre,
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