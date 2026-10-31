export const fetchTrips = () => fetch("./Data/trips.json").then((r) => r.json());

export function showTrips(trips) {
    const box = document.createElement("div");
    box.className = "mx-auto grid max-w-6xl gap-4 px-4 pb-10 sm:grid-cols-2 lg:grid-cols-3";
    box.innerHTML = trips.map((t) => {
        const n = t.reservations.length, full = n >= t.capacity;
        const c = full ? "rose" : "teal";
        return `<article class="rounded-2xl border bg-white p-5 shadow-sm">
            <div class="flex justify-between"><h3 class="font-bold">${t.departure} → ${t.destination}</h3>
            <span class="rounded-full bg-${c}-100 px-2 py-1 text-xs text-${c}-700">${n}/${t.capacity}</span></div>
            <p class="mt-2 text-sm text-slate-500">${t.departureTime} - ${t.arrivalTime}</p>
            <div class="mt-4 flex justify-between"><b class="text-${c}-600">${t.price} DH</b>
            <a href="./trip.html?id=${t.id}" class="rounded-lg bg-${c}-500 px-4 py-2 text-sm text-white">${full ? "Complet" : "Réserver"}</a></div></article>`;
    }).join("");
    document.querySelector(".recherche-categori").after(box);
}