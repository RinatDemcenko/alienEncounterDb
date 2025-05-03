import "./css/entries.css";
import "./css/Forms.css";
import "./css/banner.css";
import "./css/searchMenu.css";
import "./css/footer.css";
import axios from "axios";
import "./css/base.css";

const mostObservations = document.querySelector(".most-observations");
const mostVisited = document.querySelector(".top-locations");
const activeSpecies = document.querySelector(".active-species");
const recentAbductions = document.querySelector(".abduction-stats");
const dataDisplay = document.querySelector(".displayed-info");
const limitslider = document.querySelector(".slider");
const sliderValue = document.querySelector(".slider-value");
const options = document.querySelectorAll(".option");
const orderSelect = document.querySelector("#order-select");
const setDefaultsBtn = document.querySelector(".set-defaults");

const currentUrl = window.location.href;
let baseUrl = "https://alien-encounterdb-server.vercel.app";
if (currentUrl.includes("localhost")) {
  baseUrl = "http://localhost:3000";
}

for (let option of options) {
  option.addEventListener("click", () => {
    for (let opt of options) {
      opt.classList.remove("selected");
    }
    option.classList.add("selected");
  });
}

let limit = 25;
let order = "DESC";
let isDefaultMode = false;
let savedLimit, savedOrder;

function refreshQueries() {
  const params = [];
  if (["ASC", "DESC"].includes(order)) {
    params.push(`order=${order}`);
  }
  if (limit > 0 && limit < 101) {
    params.push(`limit=${limit}`);
  }

  const queries = params.length > 0 ? `?${params.join("&")}` : "";

  return queries;
}

limitslider.addEventListener("input", (event) => {
  limit = event.target.value;
  sliderValue.innerHTML = `${limit}`;
});

orderSelect.addEventListener("input", () => {
  order = orderSelect.value;
  console.log(order);
  console.log(refreshQueries());
});

setDefaultsBtn.addEventListener("click", () => {
  if (!isDefaultMode) {
    savedLimit = limitslider.value;
    savedOrder = orderSelect.value.toLowerCase();

    limit = 0;
    order = "-";

    limitslider.classList.add("disabled");
    orderSelect.classList.add("disabled");

    setDefaultsBtn.textContent = "Obnoviť nastavenia";

    isDefaultMode = true;
  } else {
    limit = savedLimit;
    order = savedOrder;

    limitslider.classList.remove("disabled");
    orderSelect.classList.remove("disabled");

    sliderValue.innerHTML = `${limit}`;
    limitslider.value = limit;
    orderSelect.value = order.toUpperCase();
    setDefaultsBtn.textContent = "Nastaviť predvolené";

    isDefaultMode = false;
  }
});

mostObservations.addEventListener("click", async () => {
  const response = await axios.get(
    `${baseUrl}/api/mostObserved${refreshQueries()}`
  );
  console.log(`${baseUrl}/api/mostObserved${refreshQueries()}`);
  dataDisplay.innerHTML = "";
  for (let species of response.data) {
    let entry = document.createElement("div");
    entry.classList.add("most-encounters-entry", "entry");
    entry.innerHTML = `
      <div class="species-info">
        <h3 class="alien-name">${species.name}</h3>
        <div class="qualities">
          <p class="home-planet">z ${species.home_planet}</p>
          <p class="limbs-number">${species.limbs_number} končatín</p>
        </div>
      </div>
      <p class="observation-count">${species.observations_count} pozorovaní</p>
    `;
    dataDisplay.appendChild(entry);
  }
});

mostVisited.addEventListener("click", async () => {
  const response = await axios.get(
    `${baseUrl}/api/mostVisited${refreshQueries()}`
  );
  dataDisplay.innerHTML = "";
  for (let location of response.data) {
    let entry = document.createElement("div");
    entry.classList.add("loacation-entry", "entry");
    entry.innerHTML = `
      <div class="location-info">
        <h3 class="location">${location.location_name}</h3>
      </div>
      <p class="observation-count">${location.total_observations} pozorovaní</p>
      <p class="unique-species">${location.unique_species_count} unikátnych druhov</p>
    `;
    dataDisplay.appendChild(entry);
  }
});

activeSpecies.addEventListener("click", async () => {
  const response = await axios.get(
    `${baseUrl}/api/alienInteractions${refreshQueries()}`
  );
  dataDisplay.innerHTML = "";
  for (let species of response.data) {
    let entry = document.createElement("div");
    entry.classList.add("species-entry", "entry");
    entry.innerHTML = `
     <div class="species-info">
        <h3 class="alien-name">${species.name}</h3>
        <div class="qualities">
          <p class="home-planet">${species.home_planet}</p>
          <p class="limbs-number">${species.limbs_number} končatín</p>
        </div>
      </div>
      <div class="interactions">
        <p class="friendly">${species.positive_interactions} priateľ.</p>
        <p class="hostile">${
          species.interactions_count - species.positive_interactions
        } nepr.</p>
        <p class="total">${species.interactions_count} spolu</p>
      </div>
    `;
    dataDisplay.appendChild(entry);
  }
});

recentAbductions.addEventListener("click", async () => {
  const response = await axios.get(
    `${baseUrl}/api/recentAbductions${refreshQueries()}`
  );
  dataDisplay.innerHTML = "";
  for (let abduction of response.data) {
    let entry = document.createElement("div");
    entry.classList.add("abduction-entry", "entry");
    entry.innerHTML = `
      <div class="abduction-info">
        <h3 class="human-name"><p>unesený:</p> ${abduction.human_name}</h3>
        <p class="abduction-date">${abduction.abduction_date.slice(0, 10)}</p>
      </div>
      <div class="species-info">
        <h3 class="alien-name"><p>únosca:</p> ${abduction.abductor_name}</h3>
        <p class="home-planet">${abduction.home_planet}</p>
      </div>
    `;
    dataDisplay.appendChild(entry);
  }
});
