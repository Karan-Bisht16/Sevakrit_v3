// for title-card at the bottom of the page to fade-in slowly 
$(document).ready(function () {
    $(window).scroll(function () {
        $(".title-card").each(function () {
            var elementTop = $(this).offset().top;
            var viewportTop = $(window).scrollTop();
            if (elementTop < viewportTop + window.innerHeight / 1.25) {
                $(this).addClass("fade-in");
            }
        });
    });
});

let lat = 28.6139, lng = 77.2090, marker, circle, zoomed;
var map = L.map("map").setView([lat, lng], 13);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 16,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// different view layers for the map
const streetsLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
const terrainLayer = L.tileLayer("https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}", {
    attribution: '&copy; <a href="https://stamen.com">Stamen Design</a> contributors',
    maxZoom: 14,
    ext: "png"
});
const osmHOT = L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
    maxZoom: 14,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});
const baseLayers = {
    "Streets": streetsLayer,
    "Terrain": terrainLayer,
    "OSM": osmHOT
};

L.control.layers(baseLayers).addTo(map);
// to constantly monitor position
navigator.geolocation.watchPosition(success, error);

// different icon for different types of donations and ngo
const customIconFood = L.divIcon({
    className: "custom-icon",
    html: `<div class="iconMarker food"></div>`,
});
const customIconBooks = L.divIcon({
    className: "custom-icon",
    html: `<div class="iconMarker book"></div>`,
});
const customIconToys = L.divIcon({
    className: "custom-icon",
    html: `<div class="iconMarker toys"></div>`,
});
const customIconClothes = L.divIcon({
    className: "custom-icon",
    html: `<div class="iconMarker clothes"></div>`,
});
const customIconMine = L.divIcon({
    className: "custom-icon",
    html: `<div class="iconMarker mine"></div>`,
});
const customIconAccepted = L.divIcon({
    className: "custom-icon",
    html: `<div class="iconMarker"><i class="fa-regular fa-circle-check accepted"></i></div>`,
});
const customIconExpired = L.divIcon({
    className: "custom-icon",
    html: `<div class="iconMarker"><i class="fa-regular fa-circle-xmark expired"></i></div>`,
});
const customIconNGO = L.divIcon({
    className: "custom-icon",
    html: `<div class="iconMarker ngo"></div>`,
});

async function sendPostionToServer(object) {
    // to get current URL
    const currentURL = window.location.href;
    try {
        // post request to server with current location
        const response = await fetch(currentURL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(object)
        });
        // all information regarding nearby ngos and donations [based on user type and donation visibility]
        const locationData = await response.json();
        const one = { 0: "", 1: "Your " };
        const two = { 0: "Food ", 1: "Books ", 2: "Clothes ", 3: "Toys " };
        const three = { 0: "is open.", 1: "has been accpeted.", 2: "has expired." };
        let foodPoint, bookPoint, clothPoint, toyPoint, accepted, expired;
        locationData.dataDonation.forEach(donation => {
            const locationArray = Object.values(donation.user_pickup_address);
            let reliableAddress = donation["user_pickup_address"].humanReadableAddress;
            if (locationArray[2] === 1) {
                reliableAddress = JSON.stringify(locationArray[1]);
                reliableAddress = `<a target="_blank" href='https://maps.google.com/?q=${donation.user_pickup_address.coordinates.latitude}, ${donation.user_pickup_address.coordinates.longitude}'>${reliableAddress}</a>`
            }
            const donationLat = donation["user_pickup_address"].coordinates["latitude"];
            const donationLng = donation["user_pickup_address"].coordinates["longitude"];
            const type_of_donation = donation["type_of_donation"];
            
            let message = [0, 0, 0];
            // if my donation then use a base icon to make it more visible
            if (donation.donar_email === locationData.donarID) {
                L.marker([donationLat, donationLng], { icon: customIconMine }).addTo(map);
                message[0] = 1;
            }
            if (type_of_donation === "Food") {
                foodPoint = L.marker([donationLat, donationLng], { icon: customIconFood }).addTo(map);
            } else if (type_of_donation === "Books") {
                bookPoint = L.marker([donationLat, donationLng], { icon: customIconBooks }).addTo(map);
                message[1] = 1;
            } else if (type_of_donation === "Clothes") {
                clothPoint = L.marker([donationLat, donationLng], { icon: customIconClothes }).addTo(map);
                message[1] = 2;
            } else if (type_of_donation === "Toys") {
                toyPoint = L.marker([donationLat, donationLng], { icon: customIconToys }).addTo(map);
                message[1] = 3;
            }
            if (donation.donar_email === locationData.donarID) {
                if (donation.donation_status.status === 1) {
                    accepted = L.marker([donationLat, donationLng], { icon: customIconAccepted }).addTo(map);
                    message[2] = 1;
                } else if (donation.donation_status.status === 2) {
                    expired = L.marker([donationLat, donationLng], { icon: customIconExpired }).addTo(map);
                    message[2] = 2;
                }
            }
            let string = one[message[0]] + two[message[1]] + `donation at ${reliableAddress} ` + three[message[2]];
            if (message[2] === 0) {
                if (message[1] === 0) { foodPoint.bindPopup(string); }
                else if (message[1] === 1) { bookPoint.bindPopup(string); }
                else if (message[1] === 2) { clothPoint.bindPopup(string); }
                else if (message[1] === 3) { toyPoint.bindPopup(string); }
            } 
            else if (message[2] === 1) { accepted.bindPopup(string); } 
            else if (message[2] === 2) { expired.bindPopup(string); }
        });
        locationData.dataNGO.forEach(NGO => {
            const locationArray = Object.values(NGO.NGO_address);
            let reliableAddress = NGO["NGO_address"].humanReadableAddress;
            if (locationArray[2] === 1) {
                reliableAddress = JSON.stringify(locationArray[1]);
                reliableAddress = `<a target="_blank" href='https://maps.google.com/?q=${NGO.NGO_address.coordinates.latitude}, ${NGO.NGO_address.coordinates.longitude}'>${reliableAddress}</a>`
            }
            const NGOLat = NGO["NGO_address"].coordinates["latitude"];
            const NGOLng = NGO["NGO_address"].coordinates["longitude"];
            const NGOPoint = L.marker([NGOLat, NGOLng], { icon: customIconNGO }).addTo(map);
            NGOPoint.bindPopup(`${NGO.name} (Registered NGO) at ${reliableAddress}`);
        });
    } catch (error) {
        console.log("Error in adding to server ", error);
    }
}

function success(position) {
    // only make post request when change in a position happens
    if (Math.abs(lat - position.coords.latitude) || Math.abs(lng - position.coords.longitude)) {
        let positionObj = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        sendPostionToServer(positionObj);
    }
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    const acc = position.coords.accuracy;

    if (marker) {
        map.removeLayer(marker);
        map.removeLayer(circle);
    }
    marker = L.marker([lat, lng]).addTo(map);
    circle = L.circle([lat, lng, { radius: acc }]).addTo(map);

    if (!zoomed) {
        zoomed = map.fitBounds(circle.getBounds());
    }
}

function error() {
    if (error.code === 1) {
        alert("Allow geolocation access");
    } else {
        console.log("Cannot get current location");
    }
}

const originalPosBtn = document.getElementById("originalPosition");
// to bring back current position in focus
originalPosBtn.addEventListener("click", () => {
    map.setView([lat, lng]);
});