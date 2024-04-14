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
        locationData.dataDonation.forEach(donation => {
            const locationArray = Object.values(donation.user_pickup_address);
            let reliableAddress = donation["user_pickup_address"].humanReadableAddress;
            if (locationArray[2] === 1) {
                reliableAddress = JSON.stringify(locationArray[1]);
            }
            const donationLat = donation["user_pickup_address"].coordinates["latitude"];
            const donationLng = donation["user_pickup_address"].coordinates["longitude"];
            const type_of_donation = donation["type_of_donation"];
            if (type_of_donation === "Food") {
                const foodPoint = L.marker([donationLat, donationLng], { icon: customIconFood }).addTo(map);
                foodPoint.bindPopup(`Food (${donation["type_of_event"]}) donation at ${reliableAddress}`);
            } else if (type_of_donation === "Books") {
                const bookPoint = L.marker([donationLat, donationLng], { icon: customIconBooks }).addTo(map);
                bookPoint.bindPopup(`Book donation at ${reliableAddress}`);
            } else if (type_of_donation === "Clothes") {
                const clothPoint = L.marker([donationLat, donationLng], { icon: customIconClothes }).addTo(map);
                clothPoint.bindPopup(`Clothes donation at ${reliableAddress}`);
            } else if (type_of_donation === "Toys") {
                const toyPoint = L.marker([donationLat, donationLng], { icon: customIconToys }).addTo(map);
                toyPoint.bindPopup(`Toy donation at ${reliableAddress}`);
            }
        }); 
        locationData.dataNGO.forEach(NGO => {
            const locationArray = Object.values(NGO.NGO_address);
            let reliableAddress = NGO["NGO_address"].humanReadableAddress;
            if (locationArray[2] === 1) {
                reliableAddress = JSON.stringify(locationArray[1]);
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