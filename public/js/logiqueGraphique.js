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

                        // Trier les donnees et dates
                        const {datesEnOrdre, donneesEnOrdre} = mettreOrdreCroissant(date, donnee_valeur);

                        // Creer un graphique avec les donnees
                        creerSectionGraphique("line", capteur_nom, donnee_nom, datesEnOrdre, donneesEnOrdre)

                    })
                }
            }
        })

}

/**
 * Méthode pour prendre deux tableaux, les combiner en une structure intermédiaire,
 * les trier en ordre croissant selon les dates, puis retourner deux tableaux triés.
 *
 * @param {*} datesDesordre est le tableau des dates en désordre.
 * @param {*} donneesDesordre c'est le tableau des données du capteur en désordre.
 * @returns un tableau contenant d'abord les dates triées, puis les données correspondantes triées.
 */
function mettreOrdreCroissant(datesDesordre, donneesDesordre){
    // Creer une map 
    const mapRecu = creerUneMap(datesDesordre, donneesDesordre);

    // mettre le map en ordre croissant de date
    mapRecu.sort((a,b) => new Date(a.date) - new Date(b.date));

    // Separer en array
    const datesEnOrdre = [];
    const donneesEnOrdre = [];
    for(let i = 0; i< mapRecu.length; i++){
        datesEnOrdre.push(mapRecu[i].date);
        donneesEnOrdre.push(mapRecu[i].donnee);
    }

    return { datesEnOrdre, donneesEnOrdre }
}

/**
 * Méthode pour transformer deux tableaux, dans ce cas les dates et les données, en un seul tableau combiné.
 * @param {*} datesDesordre - Le tableau des dates en désordre.
 * @param {*} donneesDesordre - Le tableau des données en désordre.
 * @returns Un tableau combiné associant chaque date à sa donnée correspondante.
 */
function creerUneMap(datesDesordre, donneesDesordre){
    const mapDateDonnees = []

   // Si pas la meme taille, alors retrouner vide
   if(datesDesordre.length != datesDesordre.length) return mapDateDonnees;

   // Creer une map des deux
   for(let i = 0; i < datesDesordre.length; i++ )  {
       mapDateDonnees.push({
           date: datesDesordre[i],
           donnee: donneesDesordre[i]
       });
   }

   return mapDateDonnees;
}

function creerSectionGraphique(typeGraphique, capteur_nom, donnee_nom, donneesX, donneesY) {
    // Container general
    const { arrierePlan, boiteDuContenu } = creerContainerGraphique();

    //titre du capteur
    var texteTitre = document.createElement("h2");
    texteTitre.textContent = capteur_nom;
    texteTitre.className = "titre-graphs";
    arrierePlan.insertBefore(texteTitre, boiteDuContenu);

    // canvas avec les boutons
    var containerContenu = document.createElement("div");
    containerContenu.className = "graph-container-1";

    // Canvas et chartjs
    var {canvasContainer,canvasGraph} = creerCanvas(donneesX.length);
    const graphique = creerGraphiqueStatique(canvasGraph, typeGraphique, capteur_nom, donnee_nom, donneesX, donneesY);

    // buttons
    var containerButtons = creerButtons(graphique, donneesY);

    containerContenu.appendChild(canvasContainer);
    containerContenu.appendChild(containerButtons);
    boiteDuContenu.appendChild(containerContenu);

    // Tableau des statistiques
    const tableauStats = creerTableauStats(donneesY);
    boiteDuContenu.appendChild(tableauStats);

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


/**
 * Crée la structure de base HTML pour accueillir un graphique Chart.js.
 *
 * @returns un fond (arrierePlan) et un conteneur centré (boiteDuContenu)
 */
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


/**
 * Crée dynamiquement un élément <canvas> pour afficher un graphique Chart.js,
 * avec une largeur adaptative selon le nombre de données x.
 *
 * @param {*} nbDonneesX  c'est le nombre de points sur l'axe X 
 * @returns un conteneur div du canvas (canvasContainer) et le canvas (canvasGraph)
 */
function creerCanvas(nbDonneesX){
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

    return {canvasContainer, canvasGraph};
}


/**
 * Crée les boutons d'interaction pour ajouter/supprimer des données sur un graphique Chart.js.
 *
 * @param {*} chartJSGraph c'est le graphique Chart.js auquel les annotations seront ajoutées.
 * @param {*} donneesY c'est les données numériques à partir desquelles les calculs seront effectués.
 * @returns le conteneur div contenant les boutons (containerButtons).
 */
function creerButtons(chartJSGraph, donneesY){

    // Boutons
    var containerButtons = document.createElement("div");
    containerButtons.className = "graph-buttons";

    // mediane
    var btnMediane = document.createElement("button");
    btnMediane.id = "btnMediane";
    btnMediane.textContent = "Voir la mediane";
    const medianeCalculee = calculerMediane(donneesY)
    btnMediane.addEventListener('click', () => {
        ajouterLigneChartjs('mediane','red', medianeCalculee,medianeCalculee,chartJSGraph);
    })

    // moyenne
    var btnMoyenne = document.createElement("button");
    btnMoyenne.id = "btnMoyenne";
    btnMoyenne.textContent = "Voir la moyenne";
    
    const moyenneCalculee = calculerMoyenne(donneesY)
    btnMoyenne.addEventListener('click', () => {
        ajouterLigneChartjs('moyenne', 'black',moyenneCalculee,moyenneCalculee,chartJSGraph);
    })

    containerButtons.appendChild(btnMediane);
    containerButtons.appendChild(btnMoyenne);

    return containerButtons;
}


/**
 * Ajoute ou retire dynamiquement une ligne horizontale d'annotation sur un graphique Chart.js.
 * 
 *  Si la ligne est déjà présente, elle sera supprimée. Sinon, elle sera ajoutée.
 *
 * @param {string} nomAnnotation c'est le nom unique de l'annotation à ajouter ou supprimer (clé dans annotations)
 * @param {string} couleur de la ligne d'annotation ex: black
 * @param {number} valeurAffichee c'est la valeur sur l'axe Y où tracer la ligne 
 * @param {string} titre est le texte affiché sur la ligne 
 * @param {Chart} chartJSGraph est le graphique Chart.js sur lequel ajouter ou retirer l'annotation
 */
function ajouterLigneChartjs(nomAnnotation, couleur, valeurAffichee, titre, chartJSGraph){

    // Si la ligne est déjà présente, elle sera supprimée. Sinon, elle sera ajoutée.
    if(chartJSGraph.options.plugins.annotation.annotations[nomAnnotation]){
        delete chartJSGraph.options.plugins.annotation.annotations[nomAnnotation];
    }else{
        chartJSGraph.options.plugins.annotation.annotations[nomAnnotation] = {
            type: 'line',
            borderColor:couleur,
            borderDash: [2,2],
            label:{
                enabled: true,
                content:  titre,
                position:'center'
            },
            scaleID: 'y',
            value: valeurAffichee
        }
    }

    chartJSGraph.update();
}


function creerGraphiqueStatique(canvasGraph, typeGraphique, capteur_nom, donnee_nom, donneeX, donneeY) {
    // création du graphique
    return new Chart(canvasGraph, {
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
                },
                annotation: {
                    annotations:{}
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
