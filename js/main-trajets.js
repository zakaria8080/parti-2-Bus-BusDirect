
import { chargerTrajets } from "./store.js";
import { placesLibres } from "./reservations.js";
import { afficherCartes, afficherStats, afficherPagination } from "./render.js";

let trajets = [];
let page = 1;
let parPage = 6;

let grille = document.getElementById("trips-grid");
let pagination = document.getElementById("pagination");
let recherche = document.getElementById("search-input");
let filtre = document.getElementById("status-filter");

// kat-rje3 les trajets li kaysaw l-recherche (ville) u l-filtre (all / available / full)
function filtrer() {
    let texte = recherche.value.trim().toLowerCase();
    let statut = filtre.value;
    let resultat = [];

    for (let i = 0; i < trajets.length; i++) {
        let trip = trajets[i];
        let villes = (trip.departure + " " + trip.destination).toLowerCase();
        let complet = placesLibres(trip) === 0;

        let ok = villes.includes(texte);
        if (statut === "available" && complet) {
            ok = false;
        }
        if (statut === "full" && complet === false) {
            ok = false;
        }
        if (ok) {
            resultat.push(trip);
        }
    }
    return resultat;
}

// kat-affichi cartes dyal page l7aliya (6 f kol page), pagination u stats
function actualiser() {
    let liste = filtrer();
    let nbPages = Math.ceil(liste.length / parPage);
    if (nbPages === 0) {
        nbPages = 1;
    }
    if (page > nbPages) {
        page = nbPages;
    }

    let debut = (page - 1) * parPage;
    afficherCartes(liste.slice(debut, debut + parPage), grille);
    afficherPagination(pagination, nbPages, page, function (numero) {
        page = numero;
        actualiser();
    });
    afficherStats(trajets);
}

// kat-chargi les trajets (async/await) u kat-7el l-recherche u l-filtre
async function demarrer() {
    trajets = await chargerTrajets();

    recherche.oninput = function () {
        page = 1;
        actualiser();
    };
    filtre.onchange = function () {
        page = 1;
        actualiser();
    };

    actualiser();
}

demarrer();