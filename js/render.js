import { estVip, prixSiege, placesLibres, recette, trouverReservation } from "./reservations.js";

// kat-affichi message f bloc (khdra ila nja7, hamra ila error) u kat-khbbih mn ba3d 3 tawani
export function afficherNotification(element, message, ok) {
    clearTimeout(element.minuteur);
    element.textContent = message;
    if (ok) {
        element.className = "mt-2 text-sm font-medium text-teal-700";
    } else {
        element.className = "mt-2 text-sm font-medium text-red-600";
    }
    element.style.display = "block";
    element.minuteur = setTimeout(function () {
        element.style.display = "none";
    }, 3000);
}

// kat-zid option f select
function ajouterOption(select, valeur, texte) {
    let option = document.createElement("option");
    option.value = valeur;
    option.textContent = texte;
    select.appendChild(option);
}

// kat-affichi les cartes dyal les trajets f l-page index
export function afficherCartes(trajets, conteneur) {
    conteneur.innerHTML = "";

    if (trajets.length === 0) {
        conteneur.innerHTML = '<p class="col-span-full py-10 text-center text-slate-500">No trip found.</p>';
        return;
    }

    for (let i = 0; i < trajets.length; i++) {
        let trip = trajets[i];
        let libres = placesLibres(trip);

        let badge = '<span class="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-700">Disponible</span>';
        if (libres === 0) {
            badge = '<span class="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">Complet</span>';
        }

        let carte = document.createElement("article");
        carte.className = "flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
        carte.innerHTML =
            '<div class="flex items-center justify-between gap-2">' +
            '<h2 class="text-lg font-bold text-slate-900">' + trip.departure + ' → ' + trip.destination + '</h2>' + badge +
            '</div>' +
            '<p class="text-sm text-slate-600">' + trip.departureTime + ' → ' + trip.arrivalTime + '</p>' +
            '<p class="text-sm text-slate-600">' + trip.price + ' DH per seat</p>' +
            '<p class="text-sm text-slate-600">Free seats: <strong>' + libres + '</strong> · Waiting: <strong>' + trip.waitingList.length + '</strong></p>' +
            '<a class="mt-auto rounded-lg bg-teal-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-teal-700" href="./cabine.html?id=' + trip.id + '">Open cabin</a>';
        conteneur.appendChild(carte);
    }
}

// kat-affichi l-recette totale u nombre de passagers dyal koll l-reseau
export function afficherStats(trajets) {
    let total = 0;
    let passagers = 0;
    for (let i = 0; i < trajets.length; i++) {
        total = total + recette(trajets[i]);
        passagers = passagers + trajets[i].reservations.length;
    }
    document.getElementById("stat-revenue").textContent = total + " DH";
    document.getElementById("stat-passengers").textContent = passagers;
}

// kat-affichi les boutons dyal pagination; mli tclicki kat-t3ayet quandClic(numero)
export function afficherPagination(conteneur, nbPages, pageActuelle, quandClic) {
    conteneur.innerHTML = "";
    for (let n = 1; n <= nbPages; n++) {
        let bouton = document.createElement("button");
        bouton.type = "button";
        bouton.textContent = n;
        if (n === pageActuelle) {
            bouton.className = "rounded-lg bg-teal-600 px-3 py-1.5 text-sm font-semibold text-white";
        } else {
            bouton.className = "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50";
        }
        bouton.onclick = function () {
            quandClic(n);
        };
        conteneur.appendChild(bouton);
    }
}

// kat-affichi l-titre, l-prix u l-horaires dyal trajet f l-page cabine
function afficherEntete(trip) {
    let titreSpans = document.querySelectorAll("main h1 span");
    titreSpans[0].textContent = trip.departure;
    titreSpans[titreSpans.length - 1].textContent = trip.destination;

    let meta = document.querySelector("main h1").parentNode.querySelector("p");
    meta.textContent =
        trip.capacity + "-seat coach · " + trip.price + " DH per seat · VIP seats 01-04: " + prixSiege(trip, 1) + " DH · " +
        trip.departureTime + " → " + trip.arrivalTime;
    document.title = "BusDirect — " + trip.departure + " → " + trip.destination;
}

// kat-rsem plan dyal les sieges: libre, VIP, occupé
function afficherSieges(trip) {
    let grille = document.getElementById("seats-grid");
    grille.innerHTML = "";

    for (let i = 1; i <= trip.capacity; i++) {
        let reservation = trouverReservation(trip, i);

        let numero = i;
        if (i < 10) {
            numero = "0" + i;
        }

        let nom = "Libre";
        let classes = "flex h-16 flex-col items-center justify-center rounded-lg border text-xs font-semibold ";

        if (reservation === null) {
            if (estVip(i)) {
                classes = classes + "border-amber-400 bg-amber-50 text-amber-900";
            } else {
                classes = classes + "border-slate-300 bg-white text-slate-900";
            }
        } else {
            nom = reservation.name;
            if (estVip(i)) {
                classes = classes + "border-amber-600 bg-amber-600 text-white";
            } else {
                classes = classes + "border-teal-600 bg-teal-600 text-white";
            }
        }

        if (estVip(i)) {
            numero = "★ " + numero;
        }

        let bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = classes;

        let spanNumero = document.createElement("span");
        spanNumero.textContent = numero;
        let spanNom = document.createElement("span");
        spanNom.textContent = nom;

        bouton.appendChild(spanNumero);
        bouton.appendChild(spanNom);
        grille.appendChild(bouton);
    }
}

// kat-affichi places libres, occupées, recette, banner "bus full" u l-button Reserve/Join
function afficherStatsCabine(trip) {
    let libres = placesLibres(trip);
    document.getElementById("stat-available").textContent = libres;
    document.getElementById("stat-occupied").textContent = trip.reservations.length;
    document.getElementById("stat-revenue").textContent = recette(trip) + " DH";

    let banner = document.getElementById("bus-full-banner");
    let bouton = document.getElementById("reserve-submit");
    let selectSiege = document.getElementById("reserve-seat");

    if (libres === 0) {
        banner.style.display = "block";
        banner.textContent = "The bus is full — all " + trip.capacity + " seats are occupied. New reservations go to the waiting list.";
        bouton.textContent = "Join waiting list";
        selectSiege.disabled = true;
    } else {
        banner.style.display = "none";
        bouton.textContent = "Reserve seat — " + trip.price + " DH";
        selectSiege.disabled = false;
    }
}

// kat-3emmer les selects: les places libres (reserve) u les passagers (modify / cancel)
function afficherSelects(trip) {
    let selectSiege = document.getElementById("reserve-seat");
    let selectModif = document.getElementById("modify-passenger");
    let selectAnnul = document.getElementById("cancel-passenger");

    selectSiege.innerHTML = "";
    selectModif.innerHTML = "";
    selectAnnul.innerHTML = "";
    ajouterOption(selectSiege, "0", "Choose a seat");
    ajouterOption(selectModif, "0", "Select a passenger…");
    ajouterOption(selectAnnul, "0", "Select a passenger…");

    for (let i = 1; i <= trip.capacity; i++) {
        let reservation = trouverReservation(trip, i);
        let vip = "";
        if (estVip(i)) {
            vip = " (VIP)";
        }

        if (reservation === null) {
            ajouterOption(selectSiege, i, "Seat " + i + vip);
        } else {
            ajouterOption(selectModif, i, reservation.name + " (Seat " + i + vip + ")");
            ajouterOption(selectAnnul, i, reservation.name + " (Seat " + i + vip + ")");
        }
    }
}

// kat-3emmer select dyal blasa f form Modify: blasa l7aliya + les places khawyin (seatActuel = 0 ila ma khtar 7ed)
export function remplirSiegesModif(trip, seatActuel) {
    let select = document.getElementById("modify-seat");
    select.innerHTML = "";

    if (seatActuel === 0) {
        ajouterOption(select, "0", "No reservation selected");
        return;
    }

    ajouterOption(select, seatActuel, "Seat " + seatActuel + " (Current)");
    for (let i = 1; i <= trip.capacity; i++) {
        if (trouverReservation(trip, i) === null) {
            let vip = "";
            if (estVip(i)) {
                vip = " (VIP)";
            }
            ajouterOption(select, i, "Seat " + i + vip);
        }
    }
}

// kat-affichi waiting list: compteur, message ila khawya, wla kol passager (position, ism, Remove). quandRetirer(index) kat-t3ayet mli tclicki Remove
function afficherAttente(trip, quandRetirer) {
    let liste = document.getElementById("waiting-list");
    document.getElementById("waiting-count").textContent = trip.waitingList.length;
    liste.innerHTML = "";

    if (trip.waitingList.length === 0) {
        liste.innerHTML =
            '<li class="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-6 text-center text-sm text-slate-500">No one is waiting</li>';
        return;
    }

    for (let i = 0; i < trip.waitingList.length; i++) {
        let li = document.createElement("li");
        li.className = "flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5";

        let position = document.createElement("span");
        position.className = "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-slate-900";
        position.textContent = i + 1;

        let nom = document.createElement("span");
        nom.className = "flex-1 truncate text-sm font-semibold text-slate-800";
        nom.textContent = trip.waitingList[i].name;

        let bouton = document.createElement("button");
        bouton.type = "button";
        bouton.className = "rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50";
        bouton.textContent = "✕ Remove";
        bouton.onclick = function () {
            quandRetirer(i);
        };

        li.appendChild(position);
        li.appendChild(nom);
        li.appendChild(bouton);
        liste.appendChild(li);
    }
}

// kat-3awd t-affichi koll l-page cabine
export function afficherCabine(trip, quandRetirer) {
    afficherEntete(trip);
    afficherSieges(trip);
    afficherStatsCabine(trip);
    afficherSelects(trip);
    afficherAttente(trip, quandRetirer);
}