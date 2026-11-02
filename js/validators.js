import { fetchTrips, showTrips } from "./export.js";

const trips = await fetchTrips();
showTrips(trips);