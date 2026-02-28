const loanAmountInput = document.getElementById('loanAmount');
const interestRateInput = document.getElementById('interestRate');
const tenureInput = document.getElementById('tenure');

const loanAmountDisplay = document.getElementById('loanAmountDisplay');
const interestRateDisplay = document.getElementById('interestRateDisplay');
const tenureDisplay = document.getElementById('tenureDisplay');

const incomeInput = document.getElementById('income');
const loanTypeSelect = document.getElementById('loanType');

const monthlyEMIDisplay = document.getElementById('monthlyEMI');
const principalAmountDisplay = document.getElementById('principalAmount');
const totalInterestDisplay = document.getElementById('totalInterest');
const loanCategoryDisplay = document.getElementById('loanCategory');

const chart = document.getElementById("emiChart");
const chartCenter = document.getElementById("chartCenter");
const historyBody = document.getElementById("historyBody");

const tabCalculator = document.getElementById("tabCalculator");
const tabHistory = document.getElementById("tabHistory");
const tabAbout = document.getElementById("tabAbout");

const calculatorSection = document.getElementById("emicalculator");
const historySection = document.getElementById("history");
const aboutSection = document.getElementById("about");

let lastCalculatedData = null;

/* ------------------ Populate Tenure Dropdown ------------------ */
for (let i = 6; i <= 60; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = i;
  tenureDisplay.appendChild(option);
}
tenureDisplay.value = tenureInput.value;

/* ------------------ TAB SWITCH ------------------ */
tabCalculator.onclick = (e) => { e.preventDefault(); showCalculator(); };
tabHistory.onclick = (e) => { e.preventDefault(); showHistory(); };
tabAbout.onclick = (e) => { e.preventDefault(); showAbout(); };

function showCalculator() {
  calculatorSection.classList.add("active");
  historySection.classList.remove("active");
  aboutSection.classList.remove("active");

  tabCalculator.classList.add("active");
  tabHistory.classList.remove("active");
  tabAbout.classList.remove("active");
}

function showHistory() {
  historySection.classList.add("active");
  calculatorSection.classList.remove("active");
  aboutSection.classList.remove("active");

  tabHistory.classList.add("active");
  tabCalculator.classList.remove("active");
  tabAbout.classList.remove("active");
}

function showAbout() {
  aboutSection.classList.add("active");
  calculatorSection.classList.remove("active");
  historySection.classList.remove("active");

  tabAbout.classList.add("active");
  tabCalculator.classList.remove("active");
  tabHistory.classList.remove("active");
}

/* ------------------ SLIDER SYNC ------------------ */
function updateSliderFill(slider) {
  const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
  slider.style.background =
    `linear-gradient(to right, #4CAF50 ${value}%, #ddd ${value}%)`;
}

function sync(range, number) {

  // When slider moves → update number field
  range.addEventListener("input", () => {
    number.value = range.value;
    updateSliderFill(range);
  });

  // When typing → update slider (without forcing min/max immediately)
  number.addEventListener("input", () => {
    const val = parseFloat(number.value);

    if (!isNaN(val)) {
      range.value = val;
      updateSliderFill(range);
    }
  });

  // When user leaves input field → enforce limits
  number.addEventListener("blur", () => {
    let val = parseFloat(number.value);

    if (isNaN(val)) val = parseFloat(range.min);

    if (val < parseFloat(range.min)) val = parseFloat(range.min);
    if (val > parseFloat(range.max)) val = parseFloat(range.max);

    number.value = val;
    range.value = val;
    updateSliderFill(range);
  });

  updateSliderFill(range);
}

sync(loanAmountInput, loanAmountDisplay);
sync(interestRateInput, interestRateDisplay);

tenureInput.oninput = () => {
  tenureDisplay.value = tenureInput.value;
  updateSliderFill(tenureInput);
};

tenureDisplay.onchange = () => {
  tenureInput.value = tenureDisplay.value;
  updateSliderFill(tenureInput);
};

updateSliderFill(tenureInput);

/* ------------------ CALCULATE EMI ------------------ */
document.getElementById("calculateBtn").onclick = calculateEMI;

function calculateEMI() {

  const P = parseFloat(loanAmountInput.value);
  const rate = parseFloat(interestRateInput.value);
  const months = parseInt(tenureInput.value);
  const income = parseFloat(incomeInput.value);

  // Validation
  if (isNaN(P) || P <= 0) {
    alert("Enter valid Loan Amount");
    return;
  }

  if (isNaN(rate) || rate <= 0) {
    alert("Interest rate must be greater than 0");
    return;
  }

  if (isNaN(months) || months < 6) {
    alert("Tenure must be at least 6 months");
    return;
  }

  if (isNaN(income) || income <= 0) {
    alert("Enter valid Monthly Income");
    return;
  }

  const r = rate / 12 / 100;

  let emi;
  if (r === 0) {
    emi = P / months;
  } else {
    emi = (P * r * Math.pow(1 + r, months)) /
          (Math.pow(1 + r, months) - 1);
  }

  if (!isFinite(emi)) {
    alert("Calculation error. Check inputs.");
    return;
  }

  const total = emi * months;
  const interest = total - P;

  monthlyEMIDisplay.value =
    Number(emi.toFixed(2)).toLocaleString('en-IN');

  principalAmountDisplay.textContent =
    P.toLocaleString('en-IN');

  totalInterestDisplay.textContent =
    Number(interest.toFixed(2)).toLocaleString('en-IN');

  /* ----- Loan Category ----- */
  const emiPercent = (emi / income) * 100;

  let category;
  if (emiPercent <= 30) category = "Safe Loan";
  else if (emiPercent <= 50) category = "Moderate Loan";
  else category = "Risky Loan";

  loanCategoryDisplay.textContent = category;

  drawChart(P, interest);

  lastCalculatedData = {
    loan: P.toLocaleString('en-IN'),
    rate: rate,
    months: months,
    income: income.toLocaleString('en-IN'),
    type: loanTypeSelect.value,
    emi: monthlyEMIDisplay.value,
    category: category
  };
}

/* ------------------ CHART ------------------ */
function drawChart(principal, interest) {
  const total = principal + interest;
  const angle = (principal / total) * 360;

  chart.style.background = `conic-gradient(
    #3498db 0deg,
    #3498db ${angle}deg,
    #e74c3c ${angle}deg,
    #e74c3c 360deg
  )`;

  chartCenter.textContent =
    Math.round((principal / total) * 100) + "% Principal";
}

/* ------------------ SAVE HISTORY ------------------ */
document.getElementById("save").onclick = () => {

  if (!lastCalculatedData) {
    alert("Please calculate EMI before saving.");
    return;
  }

  let historyData =
    JSON.parse(localStorage.getItem("emiHistory")) || [];

  historyData.push(lastCalculatedData);

  localStorage.setItem(
    "emiHistory",
    JSON.stringify(historyData)
  );

  addRow(lastCalculatedData);
  showHistory();
};

/* ------------------ LOAD HISTORY ------------------ */
window.onload = () => {
  const historyData =
    JSON.parse(localStorage.getItem("emiHistory")) || [];

  historyData.forEach(addRow);
};

function addRow(item) {

  const row = document.createElement("tr");

  row.innerHTML = `
    <td>${item.loan}</td>
    <td>${item.rate}</td>
    <td>${item.months}</td>
    <td>${item.income}</td>
    <td>${item.type}</td>
    <td>${item.emi}</td>
    <td>${item.category}</td>
    <td><button class="delete-btn">Delete</button></td>
  `;

  row.querySelector(".delete-btn").onclick = () => {
    row.remove();
    updateStorage();
  };

  historyBody.appendChild(row);
}

document.getElementById("clearHistory").onclick = () => {
  historyBody.innerHTML = "";
  localStorage.removeItem("emiHistory");
};

function updateStorage() {

  const rows = historyBody.querySelectorAll("tr");
  let data = [];

  rows.forEach(r => {
    const c = r.querySelectorAll("td");
    data.push({
      loan: c[0].textContent,
      rate: c[1].textContent,
      months: c[2].textContent,
      income: c[3].textContent,
      type: c[4].textContent,
      emi: c[5].textContent,
      category: c[6].textContent
    });
  });

  localStorage.setItem("emiHistory", JSON.stringify(data));
}