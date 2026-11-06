
export const regexTelephone = /^0[67][0-9]{8}$/;

export function validerNom(nom, trip, seatIgnore) {
    if (nom === "") {
        return "Name is required!";
    }
    let minuscule = nom.toLowerCase();
    for (let i = 0; i < trip.reservations.length; i++) {
        let r = trip.reservations[i];
        if (r.seat !== seatIgnore && r.name.toLowerCase() === minuscule) {
            return "This name already exists on this trip!";
        }
    }
    for (let i = 0; i < trip.waitingList.length; i++) {
        if (trip.waitingList[i].name.toLowerCase() === minuscule) {
            return "This name already exists on this trip!";
        }
    }
    return "";
}

export function validerTelephone(tel, trip, seatIgnore) {
    if (regexTelephone.test(tel) === false) {
        return "Phone must start with 06 or 07 followed by 8 digits!";
    }
    for (let i = 0; i < trip.reservations.length; i++) {
        let r = trip.reservations[i];
        if (r.seat !== seatIgnore && r.phone === tel) {
            return "This phone number already exists on this trip!";
        }
    }
    for (let i = 0; i < trip.waitingList.length; i++) {
        if (trip.waitingList[i].phone === tel) {
            return "This phone number already exists on this trip!";
        }
    }
    return "";
}