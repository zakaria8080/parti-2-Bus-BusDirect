
import { chargerTrajets, sauvegarderTrajets, trouverTrajet } from "./store.js";
import { estVip, prixSiege, trouverReservation, reserver, modifier, annuler, retirerAttente } from "./reservations.js";
import { afficherCabine, afficherNotification, remplirSiegesModif } from "./render.js";

async function demarrer() {
    let id = Number(new URLSearchParams(location.search).get("id"));
    let trajets = await chargerTrajets();
    let trip = trouverTrajet(trajets, id);

    if (trip === null) {
        document.getElementById("main").innerHTML =
            "<p class='py-10 text-center'>Trajet introuvable. <a class='text-teal-600 underline' href='./index.html'>Retour</a></p>";
        return;
    }

    let formRes = document.getElementById("reserve-form");
    let nomRes = document.getElementById("reserve-name");
    let telRes = document.getElementById("reserve-phone");
    let siegeRes = document.getElementById("reserve-seat");
    let msgRes = document.getElementById("reserve-notification");

    let formMod = document.getElementById("modify-form");
    let choixMod = document.getElementById("modify-passenger");
    let nomMod = document.getElementById("modify-name");
    let telMod = document.getElementById("modify-phone");
    let siegeMod = document.getElementById("modify-seat");
    let msgMod = document.getElementById("modify-notification");

    let formAnn = document.getElementById("cancel-form");
    let choixAnn = document.getElementById("cancel-passenger");
    let infoAnn = document.getElementById("cancel-details");
    let msgAnn = document.getElementById("cancel-notification");

    let msgAttente = document.getElementById("waiting-notification");

    function actualiser() {
        sauvegarderTrajets(trajets);
        afficherCabine(trip, function (index) {
            let resultat = retirerAttente(trip, index);
            actualiser();
            afficherNotification(msgAttente, resultat.message, resultat.ok);
        });
    }

    formRes.onsubmit = function (event) {
        event.preventDefault();
        let resultat = reserver(trip, nomRes.value.trim(), telRes.value.trim(), Number(siegeRes.value));
        if (resultat.ok) {
            actualiser();
            formRes.reset();
        }
        afficherNotification(msgRes, resultat.message, resultat.ok);
    };

    choixMod.onchange = function () {
        let seat = Number(choixMod.value);
        let reservation = trouverReservation(trip, seat);

        if (reservation === null) {
            nomMod.value = "";
            telMod.value = "";
        } else {
            nomMod.value = reservation.name;
            telMod.value = reservation.phone;
        }
        remplirSiegesModif(trip, seat);
    };

    formMod.onsubmit = function (event) {
        event.preventDefault();
        let seatActuel = Number(choixMod.value);

        if (seatActuel === 0) {
            afficherNotification(msgMod, "Please select a passenger!", false);
            return;
        }

        let resultat = modifier(trip, seatActuel, nomMod.value.trim(), telMod.value.trim(), Number(siegeMod.value));
        if (resultat.ok) {
            actualiser();
            formMod.reset();
            remplirSiegesModif(trip, 0);
        }
        afficherNotification(msgMod, resultat.message, resultat.ok);
    };

    choixAnn.onchange = function () {
        let seat = Number(choixAnn.value);
        let reservation = trouverReservation(trip, seat);

        if (reservation === null) {
            infoAnn.style.display = "none";
            return;
        }

        let vip = "";
        if (estVip(seat)) {
            vip = " (VIP)";
        }
        infoAnn.textContent = reservation.name + " — Seat " + seat + vip + " — " + prixSiege(trip, seat) + " DH";
        infoAnn.style.display = "block";
    };

    formAnn.onsubmit = function (event) {
        event.preventDefault();
        let seat = Number(choixAnn.value);

        if (seat === 0) {
            afficherNotification(msgAnn, "Please select a passenger!", false);
            return;
        }

        let resultat = annuler(trip, seat);
        actualiser();
        infoAnn.style.display = "none";
        afficherNotification(msgAnn, resultat.message, resultat.ok);
    };

    remplirSiegesModif(trip, 0);
    actualiser();
}

demarrer();