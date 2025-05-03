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
                        creerSectionGraphique("line", capteur_nom, donnee_nom, datesEnOrdre, donneesEnOrdre);

                    })
                }
            }
        })

}

/**
 * Méthode pour prendre deux tableaux, les combiner en une structure intermédiaire,
 * les trier en ordre croissant selon les dates, puis retourner deux tableaux triés.
 *
 * @param {number[]} datesDesordre est le tableau des dates en désordre.
 * @param {number[]} donneesDesordre c'est le tableau des données du capteur en désordre.
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
 * @param {number[]} datesDesordre est le tableau des dates en désordre.
 * @param {number[]} donneesDesordre est le tableau des données en désordre.
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
    containerContenu.className = "graph-container-button-canvas";

    // Canvas et chartjs
    var {canvasContainer,canvasGraph} = creerCanvas(donneesX.length);
    const graphique = creerGraphiqueStatique(canvasGraph, typeGraphique, capteur_nom, donnee_nom, donneesX, donneesY);

    // Ajouter l’option pour agrandir le graphique lorsque le canvas est cliqué
    canvasContainer.addEventListener('click', () => {
        var divAgrandirGraphique = creerDivAgrandirGraphique(graphique);
        document.body.appendChild(divAgrandirGraphique);
    });

    // buttons
    var containerButtons = creerButtons(graphique, donneesY, donnee_nom);

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
 * Méthode pour calculer la moyenne des données sur des intervalles de 24 heures
* 
* @param {string[]} donneesX les dates
* @param {number[]} donneesY les données numériques correspondantes
* @returns un tableau contenant les dates de début de chaque intervalle de 24h et la moyenne correspondante
*/
function calculerMoyenneParJour(donneesX, donneesY) {

    var { datesEnOrdre, donneesEnOrdre } = mettreOrdreCroissant(donneesX, donneesY);
 
    const mapDateDonnees = creerUneMap(datesEnOrdre, donneesEnOrdre);
 
    const groupesParJour = {};
 
    mapDateDonnees.forEach(({ date, donnee }) => {
        var dateChoisi = new Date(date);
        var jourChoisi = dateChoisi.getDate();
        var moisChoisi = dateChoisi.getMonth() + 1;
        var anneeChoisi = dateChoisi.getFullYear();
 

        // Clé + ajout de zéros devant les mois et jours pour un meilleur affichage
        const cleJour = `${anneeChoisi}-${moisChoisi.toString().padStart(2, '0')}-${jourChoisi.toString().padStart(2, '0')}`;
 
        if (!groupesParJour[cleJour]) {
            groupesParJour[cleJour] = [];
        }
        groupesParJour[cleJour].push(donnee);
    });
 
 
    const resultats = Object.entries(groupesParJour).map(([date, donnees]) => {
        const moyenne = calculerMoyenne(donnees);
        return { date, moyenne };
    });
 
    return resultats;
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
 * @param {number} nbDonneesX  c'est le nombre de points sur l'axe X 
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
 * @param {Chart} chartJSGraph c'est le graphique Chart.js auquel les annotations seront ajoutées.
 * @param {number[]} donneesY c'est les données numériques à partir desquelles les calculs seront effectués.
 * @returns le conteneur div contenant les boutons (containerButtons).
 */
function creerButtons(chartJSGraph, donneesY,nomDonneesY){

    // Boutons
    var containerButtons = document.createElement("div");
    containerButtons.className = "graph-buttons-container";

    // mediane
    var btnMediane = document.createElement("button");
    btnMediane.id = "btnMediane";
    btnMediane.textContent = "Voir la mediane";
    btnMediane.classList.add("graph-button-bas");

    btnMediane.addEventListener('click', () => {
        const medianeCalculee = calculerMediane(recupererDonneesYGraphiqueCanvas(chartJSGraph))
        ajouterLigneChartjs('mediane','red', medianeCalculee,medianeCalculee,chartJSGraph);
    })

    // moyenne
    var btnMoyenne = document.createElement("button");
    btnMoyenne.id = "btnMoyenne";
    btnMoyenne.textContent = "Voir la moyenne";
    btnMoyenne.classList.add("graph-button-bas");

    btnMoyenne.addEventListener('click', () => {
        const moyenneCalculee = calculerMoyenne(recupererDonneesYGraphiqueCanvas(chartJSGraph))
        ajouterLigneChartjs('moyenne', 'black',moyenneCalculee,moyenneCalculee,chartJSGraph);
    });

    containerButtons.appendChild(btnMediane);
    containerButtons.appendChild(btnMoyenne);

    // Ajouter les bouttons de conversion
    const tableauButtonsConversion = creerButtonsConversionUnite(nomDonneesY, donneesY, chartJSGraph);
    tableauButtonsConversion.forEach((button) => {
        button.classList.add("graph-button-bas");
        containerButtons.appendChild(button);
    });

    // Ajouter dropbox converssion graph
    var listeTypeGraphique = document.createElement("select");
    listeTypeGraphique.classList.add("graph-button-bas");

    const listeDesNomDesTypesGraphiques = ["line", "bar"];
    listeDesNomDesTypesGraphiques.forEach((typeGraphique) => {
        var option = document.createElement("option");
        option.value = typeGraphique;
        option.textContent = typeGraphique;

        listeTypeGraphique.appendChild(option);
    });

    listeTypeGraphique.onchange = () => {
        changerTypeGraphique(chartJSGraph, listeTypeGraphique.value);
    };

    containerButtons.appendChild(listeTypeGraphique);

    //////////// Ajouter un bouton pour afficher les donnees de 24h ////////////////
    var boutonDonneesParJour = creerBoutonAfficherDonneesParJour(chartJSGraph);
    containerButtons.appendChild(boutonDonneesParJour);

    return containerButtons;
}

/**
 * Methode pour créer un bouton permettant de basculer l'affichage du graphique entre les données originales et les moyennes calculées par jour.
 *
 * @param {Chart} chartJSGraph graphique Chart.js à modifier.
 * @returns le bouton en question
 */
function creerBoutonAfficherDonneesParJour(chartJSGraph){
    // Sauvegarder les données originales pour pouvoir les restaurer plus tard
    const donneesXOriginales = chartJSGraph.data.labels;
    const donneesYOriginales = chartJSGraph.data.datasets[0].data;
    const nomDonneesY = chartJSGraph.data.datasets[0].label;

    //////////// Ajouter un bouton pour afficher les donnees de 24h ////////////////
    var boutonDonneesParJour = document.createElement("button");
    boutonDonneesParJour.textContent = "Afficher au format 24h";
    boutonDonneesParJour.classList.add("graph-button-bas");

    // Calculer la moyenne
    const tableauDeMoyenneParJour = calculerMoyenneParJour(donneesXOriginales, donneesYOriginales);

    // Créer deux tableaux. Un pour les dates et un pour les moyennes.
    const dates = tableauDeMoyenneParJour.map(dict => dict.date);
    const moyennes = tableauDeMoyenneParJour.map(dict => dict.moyenne);

    // Afficher
    var estBoutonDonneesParJourActif = false;
    boutonDonneesParJour.addEventListener('click', () => {
        
        if(estBoutonDonneesParJourActif){
            // Revenir aux données originales
            changerXYDonneesGraphique(chartJSGraph, nomDonneesY,donneesXOriginales,donneesYOriginales);

        }else{
            // Afficher les moyennes par jour
            changerXYDonneesGraphique(chartJSGraph, nomDonneesY, dates, moyennes);
        }

        estBoutonDonneesParJourActif = !estBoutonDonneesParJourActif;
    });

    return boutonDonneesParJour;
}


/**
 * Méthode pour créer une div affichée par-dessus tout, contenant un graphique.
 * @param {Chart} chartJSGraph est le graphique Chart.js à afficher dans la div.
 * @returns une div contenant le graphique.
 */
function creerDivAgrandirGraphique(chartJSGraph){
    const fenetreZoom = document.createElement('div');
    fenetreZoom.className = 'fenetre-zoom-graphique';

    const fermerBtn = document.createElement('p');
    fermerBtn.className = 'fenetre-zoom-fermer-bouton';
    fermerBtn.textContent = 'fermer';
    fermerBtn.addEventListener('click', () => {
        fenetreZoom.remove();
    });

    const canvasContainer = document.createElement('div');
    canvasContainer.className = 'container-zoom-canvas';

    const canvas = document.createElement('canvas');
    canvasContainer.appendChild(canvas);

    // Cloner le graphique dans un canvas différent
    const typeGraphique = chartJSGraph.config.type;
    const capteurNom = chartJSGraph.options.plugins.title.text;
    const donneeNom = chartJSGraph.data.datasets[0].label;
    const donneeX = chartJSGraph.data.labels;
    const donneeY = chartJSGraph.data.datasets[0].data;
    const cloneGraphiqueCanvas = creerGraphiqueStatique(canvas, typeGraphique, capteurNom, donneeNom, donneeX, donneeY);

    // Changer de taille 
    cloneGraphiqueCanvas.config.options.responsive = true;

    // Activer le zoom et la navigation sur le graphique
    cloneGraphiqueCanvas.options.plugins.zoom.pan.enabled = true;
    cloneGraphiqueCanvas.options.plugins.zoom.zoom.wheel.enabled = true;
    cloneGraphiqueCanvas.options.plugins.zoom.zoom.pinch.enabled = true;


    cloneGraphiqueCanvas.resize();  
    cloneGraphiqueCanvas.update();

    
    fenetreZoom.appendChild(fermerBtn);
    fenetreZoom.appendChild(canvasContainer);

    return fenetreZoom;
}


// fonction de modifier le type de graph a partir du dropbox

function changerTypeGraphique(chartJSGraph, typeGraphique){
  chartJSGraph.config.type = typeGraphique;
  chartJSGraph.update();
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

/**
 * Méthode pour changer les données y d'un graphique Chart.js
 * @param {Chart} graphChartJS est le graphique Chart.js à modifier
 * @param {string} label est le nom de la série de données
 * @param {number[]} data est la liste des nouvelles valeurs en y
 */
function changerYDonneesGraphique(chartJSGraph, label, data){

    // changer de datasheet
    if (chartJSGraph.data.datasets.length > 0) {
        chartJSGraph.data.datasets[0].label = label;
        chartJSGraph.data.datasets[0].data = data;
    }

    chartJSGraph.update()
}

/**
 * Méthode pour changer les données x d'un graphique Chart.js
 * @param {Chart} chartJSGraph est le graphique Chart.js à modifier
 * @param {number[]} data est la liste des nouvelles valeurs en x
 */
function changerXDonneesGraphique(chartJSGraph, data){
    // changer de donnees x
    if (chartJSGraph.data.labels.length > 0) {
        chartJSGraph.data.labels = data;
    }
    chartJSGraph.update()
}

/**
 * Méthode pour changer les données x et y d'un graphique Chart.js
 * @param {Chart} graphChartJS est le graphique Chart.js à modifier
 * @param {string} label est le nom de la série de données
 * @param {number[]} dataX est la liste des nouvelles valeurs en x
 * @param {number[]} dataY est la liste des nouvelles valeurs en y
 */
function changerXYDonneesGraphique(chartJSGraph, label, dataX, dataY){
    changerXDonneesGraphique(chartJSGraph, dataX);
    changerYDonneesGraphique(chartJSGraph, label, dataY);
}

/**
 * Méthode pour détecter les données à convertir selon le titre de l'axe Y et créer un bouton de conversion avec sa logique
 * @param {string} nomDonneesY Le nom des données de l'axe Y
 * @param {number[]} donneesY Le tableau des données en Y
 * @param {Chart} chartJSGraph Le graphique Chart.js
 * @returns Un tableau de boutons de conversion
 */
function creerButtonsConversionUnite(nomDonneesY, donneesY, chartJSGraph){
    var tableauButtons = [];


    switch (nomDonneesY) {
        case "Temperature (C)":
            var btnKevin = document.createElement("button");
            btnKevin.id = "btnKevin";
            btnKevin.textContent = "Voir en K";
            btnKevin.addEventListener('click', () => {
                const voirEnC = btnKevin.textContent === "Voir en C";
    
                btnKevin.textContent = voirEnC ? "Voir en K" : "Voir en C";
    
                // Choisir les bonnes données à afficher
                const donneesAfficher = voirEnC ? donneesY : convertirCenK(donneesY);
                const nomDonneesAfficher = voirEnC ? nomDonneesY : "Temperature (K)";

                changerYDonneesGraphique(chartJSGraph, nomDonneesAfficher, donneesAfficher);
            });

            tableauButtons.push(btnKevin);
            break;
        default:
    }

    return tableauButtons;
}

/**
 * Méthode pour convertir un tableau de données de C vers K
 * @param {number[]} tableauDonnees Le tableau de données à convertir en Kelvin
 * @returns Un tableau de nombres convertis en Kelvin
 */
function convertirCenK(tableauDonnnees){
    nouveauTableau = [];
    tableauDonnnees.forEach((valeurActuel)=> {
        nouveauTableau.push(valeurActuel + 273.15);
    });

    return nouveauTableau;
}

function recupererDonneesYGraphiqueCanvas(chartJSGraph){
    return chartJSGraph.data.datasets[0].data;
}

function creerGraphiqueStatique(canvasGraph, typeGraphique, capteur_nom, donnee_nom, donneeX, donneeY) {
    // création du graphique
    const notreChart = new Chart(canvasGraph, {
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
                },
                zoom: {
                    pan:{
                        enabled: true,
                        mode:"xy"
                    },
                    zoom:{
                        pinch: { enabled: true },
                        wheel: {enabled: true},
                        mode: "xy"
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

    /*
    Commencer avec ces options à true afin de pouvoir les désactiver et les réactiver plus tard si nécessaire.
    Si on les définit à false dès la création, elles ne fonctionneront plus par la suite.
    */
    notreChart.options.plugins.zoom.pan.enabled = false;
    notreChart.options.plugins.zoom.zoom.wheel.enabled = false;
    notreChart.options.plugins.zoom.zoom.pinch.enabled = false;
    notreChart.update();

    return notreChart;
}
