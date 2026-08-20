const form = document.getElementById('mortgageForm');

const fields = {
  loanAmount: document.getElementById('loanAmount'),
  interestRate: document.getElementById('interestRate'),
  loanTerm: document.getElementById('loanTerm')
};

const errors = {
  loanAmount: document.getElementById('loanAmountError'),
  interestRate: document.getElementById('interestRateError'),
  loanTerm: document.getElementById('loanTermError')
};

const output = {
  panel: document.getElementById('resultsPanel'),
  monthlyPayment: document.getElementById('monthlyPayment'),
  totalPayment: document.getElementById('totalPayment'),
  totalInterest: document.getElementById('totalInterest'),
  numberOfPayments: document.getElementById('numberOfPayments')
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

function getValues() {
  return {
    loanAmount: Number(fields.loanAmount.value),
    interestRate: Number(fields.interestRate.value),
    loanTerm: Number(fields.loanTerm.value)
  };
}

function clearErrors() {
  Object.values(errors).forEach((element) => {
    element.textContent = '';
  });
}

function validate(values) {
  clearErrors();
  let isValid = true;

  if (!Number.isFinite(values.loanAmount) || values.loanAmount <= 0) {
    errors.loanAmount.textContent = 'Enter a loan amount greater than 0.';
    isValid = false;
  }

  if (!Number.isFinite(values.interestRate) || values.interestRate < 0 || values.interestRate > 100) {
    errors.interestRate.textContent = 'Enter an interest rate from 0% to 100%.';
    isValid = false;
  }

  if (!Number.isFinite(values.loanTerm) || values.loanTerm < 1 || values.loanTerm > 50) {
    errors.loanTerm.textContent = 'Enter a loan term from 1 to 50 years.';
    isValid = false;
  }

  return isValid;
}

function calculateMortgage({ loanAmount, interestRate, loanTerm }) {
  const numberOfPayments = Math.round(loanTerm * 12);
  const monthlyRate = interestRate / 100 / 12;

  const monthlyPayment = monthlyRate === 0
    ? loanAmount / numberOfPayments
    : loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))
      / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    numberOfPayments
  };
}

function renderResults(result) {
  output.monthlyPayment.textContent = currency.format(result.monthlyPayment);
  output.totalPayment.textContent = currency.format(result.totalPayment);
  output.totalInterest.textContent = currency.format(result.totalInterest);
  output.numberOfPayments.textContent = result.numberOfPayments.toLocaleString('en-US');
}

function calculateAndRender({ scrollToResults = false } = {}) {
  const values = getValues();

  if (!validate(values)) {
    return;
  }

  renderResults(calculateMortgage(values));

  if (scrollToResults) {
    output.panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  calculateAndRender({ scrollToResults: true });
});

calculateAndRender();

(() => {
  if (window.__FREE_TOOLS_WIDGET_LOADER__) return;
  window.__FREE_TOOLS_WIDGET_LOADER__ = true;
  const script = document.createElement('script');
  script.src = 'https://appointments-schedule.netlify.app/tools-widget.js';
  script.defer = true;
  document.head.append(script);
})();
