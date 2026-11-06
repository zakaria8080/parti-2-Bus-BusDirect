
export async function chargerTrajets() {
    let texte = localStorage.getItem("busdirect_trips");
    if (texte !== null) {
        return JSON.parse(texte);
    }
    let reponse = await fetch("./data/trips.json");
    let trajets = await reponse.json();
    sauvegarderTrajets(trajets);
    return trajets;
}

export function sauvegarderTrajets(trajets) {
    localStorage.setItem("busdirect_trips", JSON.stringify(trajets));
}

export function trouverTrajet(trajets, id) {
    for (let i = 0; i < trajets.length; i++) {
        if (trajets[i].id === id) {
            return trajets[i];
        }
    }
    return null;
}