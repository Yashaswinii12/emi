
const loanAmountInput = document.getElementById('loanAmount');
const interestRateInput = document.getElementById('interestRate');
const tenureInput = document.getElementById('tenure');

const loanAmountDisplay = document.getElementById('loanAmountDisplay');
const interestRateDisplay = document.getElementById('interestRateDisplay');
const tenureDisplay = document.getElementById('tenureDisplay');

const monthlyEMIDisplay = document.getElementById('monthlyEMI');
const principalAmountDisplay = document.getElementById('principalAmount');
const totalInterestDisplay = document.getElementById('totalInterest');

const chart = document.getElementById("emiChart");
const chartCenter = document.getElementById("chartCenter");
const historyBody = document.getElementById("historyBody");

function updateSliderFill(slider) {
  const value = (slider.value - slider.min) / (slider.max - slider.min) * 100;
  slider.style.background = `linear-gradient(to right, #4CAF50 ${value}%, #ddd ${value}%)`;
}

function sync(range, number) {
  range.addEventListener("input", () => {
    number.value = range.value;
    updateSliderFill(range);
    calculateEMI();
  });

  number.addEventListener("input", () => {
    range.value = number.value;
    updateSliderFill(range);
    calculateEMI();
  });

  updateSliderFill(range);
}

sync(loanAmountInput, loanAmountDisplay);
sync(interestRateInput, interestRateDisplay);
sync(tenureInput, tenureDisplay);

function calculateEMI() {
  const P = parseFloat(loanAmountInput.value);
  const r = parseFloat(interestRateInput.value) / 12 / 100;
  const n = parseFloat(tenureInput.value) * 12;

  let emi = 0;
  if (r === 0) emi = P / n;
  else emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);

  const total = emi * n;
  const interest = total - P;

  monthlyEMIDisplay.textContent = Math.round(emi).toLocaleString('en-IN');
  principalAmountDisplay.textContent = P.toLocaleString('en-IN');
  totalInterestDisplay.textContent = Math.round(interest).toLocaleString('en-IN');

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
    <td>${monthlyEMIDisplay.textContent}</td>
    <td>${principalAmountDisplay.textContent}</td>
    <td>${totalInterestDisplay.textContent}</td>
  `;
  historyBody.appendChild(row);
});

calculateEMI();
