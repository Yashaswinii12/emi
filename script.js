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

// Populate months dropdown (6–60)
for (let i = 6; i <= 60; i++) {
  const option = document.createElement("option");
  option.value = i;
  option.textContent = i;
  tenureDisplay.appendChild(option);
}
tenureDisplay.value = 12;

function updateSliderFill(slider) {
  const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
  slider.style.background = `linear-gradient(to right, #4CAF50 ${value}%, #ddd ${value}%)`;
}

function sync(range, number) {
  range.addEventListener("input", () => {
    number.value = range.value;
    updateSliderFill(range);
  });

  number.addEventListener("input", () => {
    range.value = number.value;
    updateSliderFill(range);
  });

  updateSliderFill(range);
}

sync(loanAmountInput, loanAmountDisplay);
sync(interestRateInput, interestRateDisplay);

// Tenure sync
tenureInput.addEventListener("input", () => {
  tenureDisplay.value = tenureInput.value;
  updateSliderFill(tenureInput);
});

tenureDisplay.addEventListener("change", () => {
  tenureInput.value = tenureDisplay.value;
  updateSliderFill(tenureInput);
});

document.getElementById("calculateBtn").addEventListener("click", calculateEMI);

function calculateEMI() {
  const P = parseFloat(loanAmountInput.value);
  const rate = parseFloat(interestRateInput.value);
  const months = parseInt(tenureInput.value);
  const income = parseFloat(incomeInput.value);
  const loanType = loanTypeSelect.value;

  if (isNaN(P) || isNaN(rate) || isNaN(months) || isNaN(income) || P<=0 || rate<=0 || months<=0 || income<=0) {
    alert("Please enter all valid values");
    return;
  }

  const r = rate / 12 / 100;
  const n = months;

  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const total = emi * n;
  const interest = total - P;

  monthlyEMIDisplay.value = Math.round(emi).toLocaleString('en-IN');
  principalAmountDisplay.textContent = P.toLocaleString('en-IN');
  totalInterestDisplay.textContent = Math.round(interest).toLocaleString('en-IN');

  // Category based on income
  const emiPercent = (emi / income) * 100;
  let category = "";

  if (emiPercent <= 30) category = "Safe Loan";
  else if (emiPercent <= 50) category = "Moderate Loan";
  else category = "Risky Loan";

  loanCategoryDisplay.textContent = category;

  drawChart(P, interest);
}

function drawChart(principal, interest) {
  const total = principal + interest;
  const angle = (principal / total) * 360;

  chart.style.background = `conic-gradient(
    #3498db 0deg,
    #3498db ${angle}deg,
    #e74c3c ${angle}deg,
    #e74c3c 360deg
  )`;

  chartCenter.textContent = Math.round((principal/total)*100) + "% Principal";
}

document.getElementById("save").addEventListener("click", () => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${loanAmountDisplay.value}</td>
    <td>${interestRateDisplay.value}</td>
    <td>${tenureDisplay.value}</td>
    <td>${incomeInput.value}</td>
    <td>${loanTypeSelect.value}</td>
    <td>${monthlyEMIDisplay.value}</td>
    <td>${loanCategoryDisplay.textContent}</td>
  `;
  historyBody.appendChild(row);
});
