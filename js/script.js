const id = new URLSearchParams(location.search).get("id");

fetch("./data/trips.json")
    .then(function (res) { return res.json(); })
    .then(function (trips) {
        const trip = trips.find(function (t) { return String(t.id) === id; });
        if (!trip) {
            document.getElementById("main").innerHTML =
                "<p class='py-10 text-center'>Trajet introuvable. <a class='text-teal-600 underline' href='./index.html'>Retour</a></p>";
            return;
        }
        init(trip);
    });

function setText(el, text) {
    let cible = null;
    for (let j = el.childNodes.length - 1; j >= 0; j--) {
        const n = el.childNodes[j];
        if (n.nodeType === 3 && n.textContent.trim() !== "") {
            cible = n;
            break;
        }
    }
    if (cible) {
        cible.textContent = " " + text + " ";
    } else {
        el.appendChild(document.createTextNode(" " + text + " "));
    }
}

function init(trip) {
    const boutons = document.querySelectorAll('#seats-grid button');
    const pleinDiv = document.getElementById('bus-full-banner');

    const libresSpan = document.getElementById('stat-available');
    const occupesSpan = document.getElementById('stat-occupied');
    const prixSpan = document.getElementById('stat-revenue');

    const formRes = document.getElementById('reserve-form');
    const nomRes = document.getElementById('reserve-name');
    const placeRes = document.getElementById('reserve-seat');
    const msgRes = document.getElementById('reserve-notification');
    const boutonRes = document.getElementById('reserve-submit');

    const formMod = document.getElementById('modify-form');
    const choixMod = document.getElementById('modify-passenger');
    const nomMod = document.getElementById('modify-name');
    const placeMod = document.getElementById('modify-seat');
    const msgMod = document.getElementById('modify-notification');

    const formAnn = document.getElementById('cancel-form');
    const choixAnn = document.getElementById('cancel-passenger');
    const infoAnn = document.getElementById('cancel-details');
    const msgAnn = document.getElementById('cancel-notification');

    // ---------- Regex ----------
    // Name: letters (Latin, accented, Arabic), separated by space, apostrophe or hyphen
    const REGEX_NOM = /^[A-Za-zÀ-ÿ\u0600-\u06FF]+(?:[ '-][A-Za-zÀ-ÿ\u0600-\u06FF]+)*$/;
    // Moroccan mobile phone: 06 or 07 followed by 8 digits
    const REGEX_TEL = /^0[67]\d{8}$/;

    // ---------- Phone fields (created if missing in the HTML) ----------
    function creerChampTel(idChamp, apres) {
        const input = document.createElement('input');
        input.type = 'tel';
        input.id = idChamp;
        input.placeholder = 'Phone (06XXXXXXXX or 07XXXXXXXX)';
        input.maxLength = 10;
        input.inputMode = 'numeric';
        input.autocomplete = 'tel';
        input.className = apres.className;
        input.setAttribute('aria-label', 'Phone number');
        apres.insertAdjacentElement('afterend', input);
        return input;
    }
    const telRes = document.getElementById('reserve-phone') || creerChampTel('reserve-phone', nomRes);
    const telMod = document.getElementById('modify-phone') || creerChampTel('modify-phone', nomMod);

    const ancienne = document.getElementById('waiting-section');
    if (ancienne) ancienne.remove();
    const ancienneListe = document.getElementById('waiting-list');
    if (ancienneListe) ancienneListe.remove();
    const ancienCompteur = document.getElementById('waiting-count');
    if (ancienCompteur) ancienCompteur.remove();

    const sectionAttente = document.createElement('section');
    sectionAttente.id = 'waiting-section';
    sectionAttente.className =
        'mt-6 w-full overflow-hidden rounded-2xl border border-amber-200 bg-white shadow-sm';
    sectionAttente.innerHTML =
        '<div class="flex items-center justify-between gap-3 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-4 sm:px-6">' +
        '<div class="flex items-center gap-3">' +
        '<span class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400 text-xl shadow-sm">⏳</span>' +
        '<div>' +
        '<h2 class="text-base font-bold text-slate-900 sm:text-lg">Waiting list</h2>' +
        '<p class="text-xs text-slate-500">First in line gets the next free seat</p>' +
        '</div>' +
        '</div>' +
        '<span id="waiting-count" class="flex h-8 min-w-8 items-center justify-center rounded-full bg-amber-500 px-2.5 text-sm font-bold text-white shadow-sm">0</span>' +
        '</div>' +
        '<ul id="waiting-list" class="flex flex-col gap-2 p-4 sm:p-6"></ul>';

    // on la place SOUS toute la zone des formulaires (pas dans la même colonne que "cancel")
    const sectionAnn = formAnn.closest('section');
    const conteneurFormulaires = sectionAnn.parentNode;
    if (conteneurFormulaires && conteneurFormulaires.tagName !== 'MAIN') {
        conteneurFormulaires.after(sectionAttente);
    } else {
        sectionAnn.after(sectionAttente);
    }

    const listeAttenteUl = document.getElementById('waiting-list');
    const compteurAttente = document.getElementById('waiting-count');

    const NB_PLACES = Math.min(trip.capacity, boutons.length);
    const PRIX_NORMAL = trip.price;
    const NB_VIP = Math.min(4, NB_PLACES);
    const PRIX_VIP = Math.round(PRIX_NORMAL * 1.1);

    function peutEtreVip(i) {
        return i >= 1 && i <= NB_VIP;
    }

    for (let i = NB_PLACES; i < boutons.length; i++) {
        boutons[i].style.display = "none";
    }

    // les infos du trajet (titre, prix, horaires) viennent de trips.json
    const titreSpans = document.querySelectorAll('main h1 span');
    titreSpans[0].textContent = trip.departure;
    titreSpans[titreSpans.length - 1].textContent = trip.destination;

    const metaP = document.querySelector('main h1').parentNode.querySelector('p');
    metaP.textContent =
        NB_PLACES + "-seat coach · " + PRIX_NORMAL + " DH per seat · VIP seats 1-" + NB_VIP + ": " + PRIX_VIP + " DH · " +
        trip.departureTime + " → " + trip.arrivalTime;

    setText(boutonRes, "Reserve seat — " + PRIX_NORMAL + " DH");
    setText(pleinDiv, "The bus is full — all " + NB_PLACES + " seats are occupied. New reservations go to the waiting list.");
    document.title = "BusDirect — " + trip.departure + " → " + trip.destination;

    // les données de CE trajet : on lit le localStorage (clé trip_<id>), sinon trips.json
    const CLE = "trip_" + trip.id;
    let etat = null;
    try {
        etat = JSON.parse(localStorage.getItem(CLE));
    } catch (e) {
        etat = null;
    }
    if (!etat) {
        etat = {
            reservations: trip.reservations.map(function (r) {
                return { seat: r.seat, name: r.name, phone: r.phone || "", vip: false };
            }),
            waitingList: (trip.waitingList || []).map(function (w) {
                return { name: w.name, phone: w.phone || "" };
            })
        };
    }

    let tabPlaces = [];
    let telPlaces = [];
    let vipPlaces = [];
    for (let i = 1; i <= NB_PLACES; i++) {
        tabPlaces[i] = "";
        telPlaces[i] = "";
        vipPlaces[i] = false;
    }
    etat.reservations.forEach(function (r) {
        if (r.seat >= 1 && r.seat <= NB_PLACES) {
            tabPlaces[r.seat] = r.name;
            telPlaces[r.seat] = r.phone || "";
            vipPlaces[r.seat] = r.vip === true;
        }
    });

    let tabAttente = etat.waitingList || [];

    // ---------- Validators ----------
    // ignorerPlace = seat being modified (so it doesn't clash with itself), 0 otherwise
    function validerNom(nom, ignorerPlace) {
        if (nom === "") return "Name is required!";
        if (nom.length < 2 || !REGEX_NOM.test(nom)) return "Invalid name (letters only, min 2 characters).";
        const n = nom.toLowerCase();
        for (let i = 1; i <= NB_PLACES; i++) {
            if (i !== ignorerPlace && tabPlaces[i] !== "" && tabPlaces[i].toLowerCase() === n) {
                return "This name is already used on this trip.";
            }
        }
        if (tabAttente.some(function (w) { return w.name.toLowerCase() === n; })) {
            return "This name is already in the waiting list.";
        }
        return "";
    }

    function validerTel(tel, ignorerPlace) {
        if (!REGEX_TEL.test(tel)) return "Invalid phone: must start with 06 or 07 followed by 8 digits.";
        for (let i = 1; i <= NB_PLACES; i++) {
            if (i !== ignorerPlace && telPlaces[i] === tel) return "This phone number is already used on this trip.";
        }
        if (tabAttente.some(function (w) { return w.phone === tel; })) {
            return "This phone number is already in the waiting list.";
        }
        return "";
    }

    function estVip(i) {
        return vipPlaces[i] === true;
    }

    function prixPlace(i) {
        return estVip(i) ? PRIX_VIP : PRIX_NORMAL;
    }

    function nbOccupes() {
        let n = 0;
        for (let i = 1; i <= NB_PLACES; i++) {
            if (tabPlaces[i] !== "") n++;
        }
        return n;
    }

    function sauvegarder() {
        const reservations = [];
        for (let i = 1; i <= NB_PLACES; i++) {
            if (tabPlaces[i] !== "") {
                reservations.push({ seat: i, name: tabPlaces[i], phone: telPlaces[i], vip: vipPlaces[i] });
            }
        }
        localStorage.setItem(CLE, JSON.stringify({ reservations: reservations, waitingList: tabAttente }));
    }

    // liste "choose a seat" : Seat 1 à 4 affichés avec (VIP)
    function remplirChoixPlaces() {
        let code = '<option value="#">Choose a seat</option>';
        for (let i = 1; i <= NB_PLACES; i++) {
            code = code + '<option value="' + i + '">Seat ' + i + (peutEtreVip(i) ? ' (VIP)' : '') + '</option>';
        }
        placeRes.innerHTML = code;
    }

    function afficherAttente() {
        listeAttenteUl.innerHTML = "";
        compteurAttente.textContent = tabAttente.length;

        if (tabAttente.length === 0) {
            const vide = document.createElement("li");
            vide.className = "flex flex-col items-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-8 text-center";
            vide.innerHTML =
                '<span class="text-2xl">🪑</span>' +
                '<span class="text-sm font-medium text-slate-600">No one is waiting</span>' +
                '<span class="text-xs text-slate-400">Passengers will appear here when the bus is full</span>';
            listeAttenteUl.appendChild(vide);
            return;
        }

        for (let i = 0; i < tabAttente.length; i++) {
            const li = document.createElement("li");
            li.className = "group flex items-center gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-3 py-2.5 transition-colors hover:border-amber-300 hover:bg-amber-50";

            // numéro de position
            const num = document.createElement("span");
            num.className = "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-bold text-slate-900 shadow-sm";
            num.textContent = i + 1;
            li.appendChild(num);

            // avatar (initiale)
            const avatar = document.createElement("span");
            avatar.className = "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-600 text-xs font-bold uppercase text-white";
            avatar.textContent = tabAttente[i].name.trim().charAt(0);
            li.appendChild(avatar);

            // nom + statut
            const bloc = document.createElement("div");
            bloc.className = "min-w-0 flex-1";

            const nom = document.createElement("p");
            nom.className = "truncate text-sm font-semibold text-slate-800";
            nom.textContent = tabAttente[i].name;
            bloc.appendChild(nom);

            const statut = document.createElement("p");
            statut.className = "text-xs text-slate-500";
            statut.textContent = (i === 0 ? "Next in line" : "Position " + (i + 1)) +
                (tabAttente[i].phone ? " · " + tabAttente[i].phone : "");
            bloc.appendChild(statut);

            li.appendChild(bloc);

            if (i === 0) {
                const badge = document.createElement("span");
                badge.className = "hidden shrink-0 rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-semibold text-teal-700 sm:inline";
                badge.textContent = "Next";
                li.appendChild(badge);
            }

            const btn = document.createElement("button");
            btn.type = "button";
            btn.textContent = "✕ Remove";
            btn.className = "shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50 active:bg-red-100";
            btn.dataset.index = i;
            li.appendChild(btn);

            listeAttenteUl.appendChild(li);
        }
    }

    listeAttenteUl.onclick = function (event) {
        const btn = event.target.closest("button");
        if (!btn) return;
        tabAttente.splice(Number(btn.dataset.index), 1);
        actualiser();
    };

    for (let i = 1; i <= NB_PLACES; i++) {
        const bouton = boutons[i - 1];

        bouton.ondragstart = function (event) {
            if (tabPlaces[i] === "") {
                event.preventDefault();
                return;
            }
            event.dataTransfer.setData("text/plain", String(i));
            event.dataTransfer.effectAllowed = "move";
            bouton.style.opacity = "0.5";
        };

        bouton.ondragend = function () {
            bouton.style.opacity = "1";
        };

        bouton.ondragover = function (event) {
            if (tabPlaces[i] === "") {
                event.preventDefault();
                bouton.style.outline = "2px dashed #0d9488";
            }
        };

        bouton.ondragleave = function () {
            bouton.style.outline = "none";
        };

        bouton.ondrop = function (event) {
            event.preventDefault();
            bouton.style.outline = "none";

            const depuis = Number(event.dataTransfer.getData("text/plain"));
            if (!depuis || depuis === i || tabPlaces[i] !== "") return;

            const nom = tabPlaces[depuis];
            tabPlaces[i] = nom;
            telPlaces[i] = telPlaces[depuis];
            vipPlaces[i] = peutEtreVip(i);

            tabPlaces[depuis] = "";
            telPlaces[depuis] = "";
            vipPlaces[depuis] = false;

            actualiser();
            msgRes.textContent = nom + " moved from Seat " + depuis + " to Seat " + i + (estVip(i) ? " (VIP)" : "") + " — " + prixPlace(i) + " DH";
        };
    }

    // met à jour tout l'affichage + sauvegarde
    function actualiser() {
        let total = 0;
        let revenu = 0;
        let code = '<option value="">Select a passenger…</option>';

        for (let i = 1; i <= NB_PLACES; i++) {
            // bouton de la place
            if (tabPlaces[i] === "") {
                vipPlaces[i] = false;
                boutons[i - 1].draggable = false;
                boutons[i - 1].style.background = "white";
                boutons[i - 1].style.color = "black";
                boutons[i - 1].innerHTML = "<span>" + i + "</span><span>Libre</span>";
            } else {
                const etiquette = (estVip(i) ? "★ " : "") + i;
                boutons[i - 1].draggable = true;
                boutons[i - 1].style.background = estVip(i) ? "#d97706" : "#0d9488";
                boutons[i - 1].style.color = "white";
                boutons[i - 1].innerHTML = "<span>" + etiquette + "</span><span>" + tabPlaces[i] + "</span>";
                total = total + 1;
                revenu = revenu + prixPlace(i);
                code = code + '<option value="' + i + '">' + tabPlaces[i] + ' (Seat ' + i + (estVip(i) ? ' VIP' : '') + ')</option>';
            }
        }

        // sauvegarde
        sauvegarder();

        // statistiques
        occupesSpan.textContent = total;
        libresSpan.textContent = NB_PLACES - total;
        prixSpan.textContent = revenu + " DH";

        if (total === NB_PLACES) {
            pleinDiv.style.display = "block";

            // bus plein : le bouton ajoute à la waiting list
            setText(boutonRes, "Join waiting list");
            boutonRes.disabled = false;
            boutonRes.style.background = "#f59e0b";
            boutonRes.style.color = "#0f172a";
            placeRes.disabled = true;
        } else {
            pleinDiv.style.display = "none";

            // il reste des places : le bouton redevient normal
            setText(boutonRes, "Reserve seat — " + PRIX_NORMAL + " DH");
            boutonRes.disabled = false;
            boutonRes.style.background = "";
            boutonRes.style.color = "";
            placeRes.disabled = false;
        }

        // listes des passagers
        choixMod.innerHTML = code;
        choixAnn.innerHTML = code;

        afficherAttente();
    }

    // Réserver une place
    formRes.onsubmit = function () {
        let nom = nomRes.value.trim().replace(/\s+/g, " ");
        let tel = telRes.value.trim();
        let place = placeRes.value;
        let manuel = place !== "#";

        const erreur = validerNom(nom, 0) || validerTel(tel, 0);
        if (erreur) {
            msgRes.textContent = erreur;
            return false;
        }

        // bus plein -> liste d'attente (avec téléphone)
        if (nbOccupes() === NB_PLACES) {
            tabAttente.push({ name: nom, phone: tel });
            actualiser();
            msgRes.textContent = nom + " added to the waiting list (position " + tabAttente.length + ")";
            formRes.reset();
            return false;
        }

        // première place libre (non VIP d'abord)
        if (place === "#") {
            for (let i = NB_VIP + 1; i <= NB_PLACES; i++) {
                if (tabPlaces[i] === "") {
                    place = i;
                    break;
                }
            }
            if (place === "#") {
                for (let i = 1; i <= NB_VIP; i++) {
                    if (tabPlaces[i] === "") {
                        place = i;
                        break;
                    }
                }
            }
        }

        place = Number(place);

        if (tabPlaces[place] !== "") {
            msgRes.textContent = "This seat is already occupied!";
            return false;
        }

        tabPlaces[place] = nom;
        telPlaces[place] = tel;
        vipPlaces[place] = manuel && peutEtreVip(place);

        actualiser();
        msgRes.textContent = "Reservation successful! Seat " + place + (estVip(place) ? " (VIP)" : "") + " — " + prixPlace(place) + " DH";
        formRes.reset();
        return false;
    };

    // Modifier une réservation
    choixMod.onchange = function () {
        let place = choixMod.value;

        if (place === "") {
            nomMod.value = "";
            telMod.value = "";
            placeMod.innerHTML = '<option value="">No reservation selected</option>';
            return;
        }

        nomMod.value = tabPlaces[place];
        telMod.value = telPlaces[place];

        let code = '<option value="' + place + '">Seat ' + place + ' (Current)</option>';
        for (let i = 1; i <= NB_PLACES; i++) {
            if (tabPlaces[i] === "") {
                code = code + '<option value="' + i + '">Seat ' + i + (peutEtreVip(i) ? ' (VIP)' : '') + '</option>';
            }
        }
        placeMod.innerHTML = code;
    };

    formMod.onsubmit = function () {
        let anciennePlace = choixMod.value;
        let nouvellePlace = placeMod.value;
        let nouveauNom = nomMod.value.trim().replace(/\s+/g, " ");
        let nouveauTel = telMod.value.trim();

        if (anciennePlace === "") {
            msgMod.textContent = "Please select a passenger!";
            return false;
        }

        const erreur = validerNom(nouveauNom, Number(anciennePlace)) ||
                       validerTel(nouveauTel, Number(anciennePlace));
        if (erreur) {
            msgMod.textContent = erreur;
            return false;
        }

        if (String(anciennePlace) === String(nouvellePlace)) {
            tabPlaces[anciennePlace] = nouveauNom;
            telPlaces[anciennePlace] = nouveauTel;
        } else {
            tabPlaces[anciennePlace] = "";
            telPlaces[anciennePlace] = "";
            vipPlaces[anciennePlace] = false;

            tabPlaces[nouvellePlace] = nouveauNom;
            telPlaces[nouvellePlace] = nouveauTel;
            vipPlaces[nouvellePlace] = peutEtreVip(Number(nouvellePlace));
        }
        actualiser();

        msgMod.textContent = "Updated successfully!";
        formMod.reset();
        telMod.value = "";
        placeMod.innerHTML = '<option value="">No reservation selected</option>';
        return false;
    };

    // Supprimer une réservation
    choixAnn.onchange = function () {
        let place = choixAnn.value;

        if (place === "") {
            infoAnn.style.display = "none";
            return;
        }

        infoAnn.textContent = tabPlaces[place] + " — Seat " + place + (estVip(place) ? " (VIP)" : "") + " — " + prixPlace(place) + " DH";
        infoAnn.style.display = "block";
    };

    formAnn.onsubmit = function () {
        let place = choixAnn.value;

        if (place === "") {
            msgAnn.textContent = "Please select a passenger!";
            return false;
        }

        tabPlaces[place] = "";
        telPlaces[place] = "";
        vipPlaces[place] = false;
        let message = "Reservation cancelled. Seat " + place + " is free.";

        if (tabAttente.length > 0) {
            let suivant = tabAttente.shift();
            tabPlaces[place] = suivant.name;
            telPlaces[place] = suivant.phone || "";
            vipPlaces[place] = false;
            message = "Reservation cancelled. " + suivant.name + " (waiting list) took Seat " + place + ".";
        }

        actualiser();
        infoAnn.style.display = "none";
        msgAnn.textContent = message;
        return false;
    };

    remplirChoixPlaces();
    actualiser();
}
