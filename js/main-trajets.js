
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