import { fetchTrips, showTrips } from "./export.js";
showTrips((await fetchTrips()).slice(0, 3));