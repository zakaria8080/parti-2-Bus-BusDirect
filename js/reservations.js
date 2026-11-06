import { fetchTrips, showTrips } from "./export.js";

async function start() {
    const trips = await fetchTrips();
    showTrips(trips);
}

start();
const URL_TRAJETS = "./Data/trips.json";
const PREFIXE_CLE = "trip_";

let trajets = [];

async function chargerTrajets() {
    const res = await fetch(URL_TRAJETS);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
}

function lireReservations(trip) {
    try {
        const etat = JSON.parse(localStorage.getItem(PREFIXE_CLE + trip.id));
        if (etat && Array.isArray(etat.reservations)) return etat.reservations;
    } catch (e) {
    }
    return trip.reservations || [];
}

function calculerTotaux() {
    let total = 0;
    let occupees = 0;
    let recette = 0;

    trajets.forEach(function (trip) {
        const capacite = Number(trip.capacity) || 0;
        const prixNormal = Number(trip.price) || 0;
        const prixVip = Math.round(prixNormal * 1.1);
        const reservations = lireReservations(trip).filter(function (r) {
            return r.seat >= 1 && r.seat <= capacite;
        });

        total += capacite;
        occupees += reservations.length;

        reservations.forEach(function (r) {
            recette += r.vip === true ? prixVip : prixNormal;
        });
    });

    return { total: total, occupees: occupees, libres: total - occupees, recette: recette };
}

function afficherDashboard() {
    const t = calculerTotaux();
    document.getElementById("stat-total").textContent = t.total;
    document.getElementById("stat-available").textContent = t.libres;
    document.getElementById("stat-occupied").textContent = t.occupees;
    document.getElementById("stat-revenue").textContent = t.recette + " DH";
}

async function demarrer() {
    try {
        trajets = await chargerTrajets();
        afficherDashboard();
    } catch (e) {
        console.error("Impossible de charger les trajets :", e);
    }
}

demarrer();

window.addEventListener("pageshow", function () {
    if (trajets.length) afficherDashboard();
});
window.addEventListener("storage", function () {
    if (trajets.length) afficherDashboard();
});