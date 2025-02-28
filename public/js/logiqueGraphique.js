
const barCanvas = document.getElementById("graphiqueSimple");
const containerGraphSimple = document.getElementById("containerGraphSimple");
// const barChart = new Chart(barCanvas, {
//     type: "bar",
//     data: {
//         labels: ["test1", "test2", "test2"],
//         datasets: [{
//             data: [240,120,140],

//         }]
//     }
// })
creerGraphique("bar", "Graphique UN", ["test1", "test2", "test3"], [240, 120, 140])
creerGraphique("doughnut", "Graphique DEUX", ["test1", "test2", "test3", "test4"], [13, 62, 92, 32])
creerGraphique("line", "Graphique TROIS", ["test1", "test2", "test3"], [213, 543, 432])

function creerGraphique(typeGraphique, titre, donneX, donneY) {
    var canvasGraph = document.createElement("canvas");
    canvasGraph.className = "graphe-lineaire";
    new Chart(canvasGraph, {
        type: typeGraphique,
        data: {
            labels: donneX,
            datasets: [{
                label: "exemple de nom de dataset",
                data: donneY,

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