const errorDiv = document.getElementById("error");
const options = document.getElementById("option");
const eventDiv = document.getElementById("eventDiv");

// when typeOfDonation is 'Food' make eventType visible
options.addEventListener("change", () => {
    if (options.value === "Food") {
        eventDiv.classList.remove("hidden");
    } else {
        eventDiv.classList.add("hidden");
    }
});

const checkBox = document.getElementById("currLoc");
const textArea = document.getElementById("addressTextArea");
const locResultDiv = document.getElementById("locResult");

// if checkBox is checked: clear textArea content and make the co-ordinates visible and calculated location visible to user
checkBox.addEventListener("change", () => {
    textArea.value = "";
    if (checkBox.checked) {
        locResultDiv.classList.remove("hidden");
        textArea.removeAttribute("required");
        checkBox.setAttribute("required", true);
        navigator.geolocation.watchPosition(success, error);
    } else {
        locResultDiv.classList.add("hidden");
        textArea.setAttribute("required", true);
    }
});
// when typing on textArea: uncheck the checkBox and hide calculated location from user
textArea.addEventListener("keyup", () => {
    checkBox.checked = false;
    locResultDiv.classList.add("hidden");
    textArea.setAttribute("required", true);
    checkBox.removeAttribute("required");
});

function reverseGeocode(lat, lng) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.display_name) {
                document.getElementById("humanReadableAddress").value = data.display_name;
            } else {
                alert("Location not found");
            }
        })
        .catch((error) => {
            console.log("Error fetching from Openstreetmap:", error)
        });
}

const lat = document.getElementById("lat");
const lng = document.getElementById("lng");
const Coordinates = document.getElementById("coordinates");

function success(position) {
    let positionObj = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
    };
    Coordinates.setAttribute("value", JSON.stringify(positionObj));
    lat.textContent = positionObj.latitude;
    lng.textContent = positionObj.longitude;
    reverseGeocode(positionObj.latitude, positionObj.longitude);
}
function error() {
    alert("Geolocation access blocked. Enter address manually or allow geolocation access.");
}