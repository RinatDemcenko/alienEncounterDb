import axios from "axios";

const currentUrl = window.location.href;
let baseUrl = "https://alien-encounterdb-server.vercel.app";
if (currentUrl.includes("localhost")) {
  baseUrl = "http://localhost:3000";
}

const reportUfoButton = document.querySelector(".report-ufo-sighting");

const loginBtn = document.querySelector(".login-btn");
const signupBtn = document.querySelector(".signup-btn");
const accountManagementButtons = [loginBtn, signupBtn];
const logoutBtn = document.querySelector(".logout-btn");
const nameDisplay = document.querySelector(".user-name");
const emailDisplay = document.querySelector(".user-email");

const reportFormContainer = document.querySelector("#report-form-container");
const reportFormCloseBtn = reportFormContainer.querySelector(".close-btn");
const reportForm = reportFormContainer.querySelector("#report-form");
const locationInput = reportForm.querySelector("#location");
const shipTypeInput = reportForm.querySelector("#ship-type");
const encounterDateInput = reportForm.querySelector("#encounter-date");
const submitReportBtn = reportForm.querySelector(".submit-report-btn");

const accountFormContainer = document.querySelector("#account-form-container");
const accountForm = accountFormContainer.querySelector("#account-form");
const accountFormSubmitBtn = accountForm.querySelector("button");
const usernameInput = accountForm.querySelector("#username");
const emailInput = accountForm.querySelector("#email");
const passwordInput = accountForm.querySelector("#password");
const confirmPasswordInput = accountForm.querySelector("#confirm-password");

//! Account form
function updateAccountFormState(actionType) {
  if (actionType === "login") {
    usernameInput.hidden = true;
    emailInput.hidden = false;
    passwordInput.hidden = false;
    confirmPasswordInput.hidden = true;
    accountFormSubmitBtn.textContent = "Prihlásiť";
  } else if (actionType === "signUp") {
    usernameInput.hidden = false;
    emailInput.hidden = false;
    passwordInput.hidden = false;
    confirmPasswordInput.hidden = false;
    accountFormSubmitBtn.textContent = "Zaregistrovať sa";
  }
}

function showAccountForm(actionType) {
  accountForm.setAttribute("actionType", actionType);
  accountFormContainer.style.display = "flex";
  document.body.style.overflow = "hidden";
  updateAccountFormState(actionType);
  accountForm.reset();
}

function hideAccountForm() {
  accountFormContainer.style.display = "none";
  document.body.style.overflow = "auto";
}

function saveUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

accountManagementButtons.forEach((button) => {
  button.addEventListener("click", function (e) {
    showAccountForm(e.target.getAttribute("actionType"));
  });
});

function updateAccountInfo(user) {
  nameDisplay.textContent = user.username;
  emailDisplay.textContent = user.email;
  if (user.id !== null) {
    reportUfoButton.classList.remove("disabled");
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = emailInput.value;
  const password = passwordInput.value;
  if (!email || !password) {
    alert("Prosím, vyplňte všetky polia");
    return;
  }
  try {
    const response = await axios.post(`${baseUrl}/api/login`, {
      email,
      password,
    });
    if (response.status == 500) {
      throw new Error("Nie je možné prihlásiť sa");
    } else if (response.status !== 200) {
      throw new Error("Nesprávny email alebo heslo");
    }
    const user = response.data;
    updateAccountInfo(user);
    hideAccountForm();
    reportUfoButton.classList.remove("disabled");
    logoutBtn.classList.remove("disabled");
    saveUser(user);
  } catch (error) {
    console.error("Chyba v funkcie handleLogin:", error);
    alert("Nastala chyba pri prihlasovani sa. Skuste to znova neskôr.");
  }
}

async function handleSignUp(event) {
  event.preventDefault();
  const username = usernameInput.value;
  const email = emailInput.value;
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  if (!username || !email || !password || !confirmPassword) {
    alert("Prosím, vyplňte všetky polia");
    return;
  }
  if (password !== confirmPassword) {
    alert("Heslá sa nezhodujú");
    return;
  }
  try {
    const response = await axios.post(`${baseUrl}/api/register`, {
      username,
      email,
      password,
    });
    if (response.status == 500) {
      throw new Error("Chyba databázy");
    } else if (response.status !== 200) {
      throw new Error("Užívateľské meno alebo email už existuje");
    }
    const user = response.data;
    updateAccountInfo(user);
    hideAccountForm();
    reportUfoButton.classList.remove("disabled");
    logoutBtn.classList.remove("disabled");
    saveUser(user);
  } catch (error) {
    console.error("Chyba v funkcie handleSignUp:", error);
    alert("Nastala chyba pri zaregistrovaní sa. Skuste to znova neskôr.");
  }
}

function handleLogout() {
  if (localStorage.getItem("user")) {
    localStorage.removeItem("user");
    reportUfoButton.classList.add("disabled");
    logoutBtn.classList.add("disabled");
    nameDisplay.textContent = "Nie je prihlášený";
    emailDisplay.textContent = "nie je prihlášený";
  }
}

(function () {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    updateAccountInfo(user);
    reportUfoButton.classList.remove("disabled");
    logoutBtn.classList.remove("disabled");
  }
})();

accountFormSubmitBtn.addEventListener("click", function (e) {
  e.preventDefault();
  if (accountForm.getAttribute("actionType") === "login") {
    handleLogin(e);
  } else if (accountForm.getAttribute("actionType") === "signUp") {
    handleSignUp(e);
  }
});

logoutBtn.addEventListener("click", handleLogout);

//! Report form

function showReportForm(actionType) {
  reportFormContainer.style.display = "flex";
  document.body.style.overflow = "hidden";
  reportForm.setAttribute("actionType", actionType);
}

function hideReportForm() {
  reportFormContainer.style.display = "none";
  document.body.style.overflow = "auto";

  reportForm.reset();
}

function storeReportData() {
  localStorage.setItem(
    "reportData",
    JSON.stringify({
      location: locationInput.value,
      shipType: shipTypeInput.value,
      encounterDate: encounterDateInput.value,
    })
  );
}

function getStoredReportData() {
  let storedData = JSON.parse(localStorage.getItem("reportData"));
  if (storedData) {
    locationInput.value = storedData.location;
    shipTypeInput.value = storedData.shipType;
    encounterDateInput.value = storedData.encounterDate;
  }
}

async function submitReport(event) {
  event.preventDefault();

  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.id) {
    alert("Prosím, prihláste sa, aby ste mohli nahlásiť pozorovanie.");
    return;
  }

  const location = locationInput.value.trim();
  const shipType = shipTypeInput.value;
  const encounterDate = encounterDateInput.value;
  const speciesId = Math.floor(Math.random() * 25) + 1;
  const userId = JSON.parse(localStorage.getItem("user")).id;

  if (!location || !shipType || !encounterDate || !speciesId) {
    alert("Prosím, vyplňte všetky polia.");
    return;
  }

  try {
    const response = await axios.post(`${baseUrl}/api/reportUfoSighting`, {
      location,
      shipType,
      encounterDate,
      speciesId,
      userId,
    });

    if (response.status !== 200 && response.status !== 201) {
      throw new Error(
        response.data.error || `Chyba: status ${response.status}`
      );
    }

    storeReportData();
    alert(response.data.message || "Hlásenie bolo úspešne odoslané!");
    hideReportForm();
  } catch (error) {
    console.error("Chyba pri odosielaní hlásenia:", error);
    alert(
      error.message ||
        "Nastala chyba pri odosielaní hlásenia. Skúste to znova neskôr."
    );
  }
}

reportUfoButton.addEventListener("click", function () {
  showReportForm(reportUfoButton.getAttribute("actionType"));
  getStoredReportData();
});

reportFormCloseBtn.addEventListener("click", hideReportForm);

reportFormContainer.addEventListener("click", (event) => {
  if (event.target === reportFormContainer) {
    hideReportForm();
  }
});

submitReportBtn.addEventListener("click", (event) => {
  submitReport(event);
});
