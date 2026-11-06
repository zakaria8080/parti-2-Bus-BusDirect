export async function fetchTrips() {
    const response = await fetch("./data/trips.json");
    const trips = await response.json();

    for (const trip of trips) {
        if (trip.waitingList === undefined) {
            trip.waitingList = [];
        }

        const saved = JSON.parse(localStorage.getItem("trip_" + trip.id));
        if (saved !== null) {
            trip.reservations = saved.reservations;
            trip.waitingList = saved.waitingList;
        }
    }
    return trips;
}

const perPage = 6;
let page = 1;

function seatPrice(trip, seat) {
    if (seat >= 1 && seat <= 4) {
        return Math.round(trip.price * 1.1);
    }
    return trip.price;
}

function showStats(trips) {
    let revenue = 0;
    let passengers = 0;

    for (const trip of trips) {
        for (const r of trip.reservations) {
            revenue = revenue + seatPrice(trip, r.seat);
        }
        passengers = passengers + trip.reservations.length;
    }

    const revenueSpan = document.getElementById("stat-revenue");
    const passengersSpan = document.getElementById("stat-passengers");
    if (revenueSpan !== null) {
        revenueSpan.textContent = revenue + " DH";
    }
    if (passengersSpan !== null) {
        passengersSpan.textContent = passengers;
    }
}

export function showTrips(trips) {
    const section = document.querySelector(".recherche-categori");
    const input = section.querySelector("input");
    const select = section.querySelector("select");
    const wrapper = document.createElement("div");
    wrapper.className = "mx-auto max-w-6xl px-4 pb-10";
    section.after(wrapper);

    function showCards() {
        const search = input.value.toLowerCase();
        const status = select.value;
        const results = [];

        for (const trip of trips) {
            const text = (trip.departure + " " + trip.destination).toLowerCase();
            const full = trip.reservations.length >= trip.capacity;

            const matchStatus =
                status === "all" ||
                (status === "available" && !full) ||
                (status === "full" && full);

            if (text.includes(search) && matchStatus) {
                results.push(trip);
            }
        }

        if (results.length === 0) {
            wrapper.innerHTML = "<p class='py-10 text-center'>Aucun trajet trouvé</p>";
            return;
        }

        const start = (page - 1) * perPage;
        const end = start + perPage;
        const pageTrips = results.slice(start, end);

        let cards = "";
        for (const trip of pageTrips) {
            const reserved = trip.reservations.length;
            let color = "teal";
            let text = "Réserver";

            if (reserved >= trip.capacity) {
                color = "rose";
                text = "Complet";
            }

            cards += `
                <article class="rounded-2xl border bg-white p-5 shadow-sm">
                    <div class="flex justify-between">
                        <h3 class="font-bold">${trip.departure} → ${trip.destination}</h3>
                        <span class="rounded-full bg-${color}-100 px-2 py-1 text-xs text-${color}-700">${reserved}/${trip.capacity}</span>
                    </div>
                    <p class="mt-2 text-sm text-slate-500">${trip.departureTime} - ${trip.arrivalTime}</p>
                    <p class="mt-1 text-sm text-slate-500">Attente : ${trip.waitingList.length}</p>
                    <div class="mt-4 flex justify-between">
                        <b class="text-${color}-600">${trip.price} DH</b>
                        <a href="./cabine.html?id=${trip.id}" class="rounded-lg bg-${color}-500 px-4 py-2 text-sm text-white">${text}</a>
                    </div>
                </article>`;
        }

        const totalPages = Math.ceil(results.length / perPage);
        let buttons = "";

        for (let i = 1; i <= totalPages; i++) {
            let style = "bg-white";
            if (i === page) {
                style = "bg-teal-500 text-white";
            }
            buttons += `<button data-page="${i}" class="rounded-lg border px-4 py-2 text-sm ${style}">${i}</button>`;
        }

        wrapper.innerHTML = `
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">${cards}</div>
            <nav class="mt-8 flex flex-wrap justify-center gap-2">${buttons}</nav>`;
    }

    input.addEventListener("input", function () {
        page = 1;
        showCards();
    });

    select.addEventListener("change", function () {
        page = 1;
        showCards();
    });

    wrapper.addEventListener("click", function (event) {
        const button = event.target.closest("button");
        if (!button) return;
        page = Number(button.dataset.page);
        showCards();
    });

    showStats(trips);
    showCards();
}
