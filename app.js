const form = document.getElementById('mortgageForm');

const fields = {
  homePrice: document.getElementById('homePrice'),
  downPayment: document.getElementById('downPayment'),
  loanTerm: document.getElementById('loanTerm'),
  interestRate: document.getElementById('interestRate')
};

const ranges = {
  homePrice: document.getElementById('homePriceRange'),
  downPayment: document.getElementById('downPaymentRange'),
  loanTerm: document.getElementById('loanTermRange'),
  interestRate: document.getElementById('interestRateRange')
};

const errors = {
  homePrice: document.getElementById('homePriceError'),
  downPayment: document.getElementById('downPaymentError'),
  loanTerm: document.getElementById('loanTermError'),
  interestRate: document.getElementById('interestRateError')
};

const output = {
  panel: document.getElementById('resultsPanel'),
  monthlyPayment: document.getElementById('monthlyPayment'),
  principalAmount: document.getElementById('principalAmount'),
  totalPayment: document.getElementById('totalPayment'),
  totalInterest: document.getElementById('totalInterest'),
  numberOfPayments: document.getElementById('numberOfPayments'),
  loanAmountPreview: document.getElementById('loanAmountPreview'),
  downPaymentPercent: document.getElementById('down-payment-percent')
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0
});

function getValues() {
  return {
    homePrice: Number(fields.homePrice.value),
    downPayment: Number(fields.downPayment.value),
    loanTerm: Number(fields.loanTerm.value),
    interestRate: Number(fields.interestRate.value)
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

  if (!Number.isFinite(values.homePrice) || values.homePrice < 10000 || values.homePrice > 3000000) {
    errors.homePrice.textContent = 'Enter a home price from $10,000 to $3,000,000.';
    isValid = false;
  }

  if (!Number.isFinite(values.downPayment) || values.downPayment < 0 || values.downPayment >= values.homePrice) {
    errors.downPayment.textContent = 'Down payment must be less than the home price.';
    isValid = false;
  }

  if (!Number.isFinite(values.loanTerm) || values.loanTerm < 1 || values.loanTerm > 50) {
    errors.loanTerm.textContent = 'Enter a loan term from 1 to 50 years.';
    isValid = false;
  }

  if (!Number.isFinite(values.interestRate) || values.interestRate < 0 || values.interestRate > 25) {
    errors.interestRate.textContent = 'Enter an APR from 0% to 25%.';
    isValid = false;
  }

  return isValid;
}

function calculateMortgage({ homePrice, downPayment, loanTerm, interestRate }) {
  const loanAmount = homePrice - downPayment;
  const numberOfPayments = Math.round(loanTerm * 12);
  const monthlyRate = interestRate / 100 / 12;

  const monthlyPayment = monthlyRate === 0
    ? loanAmount / numberOfPayments
    : loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))
      / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;

  return {
    loanAmount,
    monthlyPayment,
    totalPayment,
    totalInterest,
    numberOfPayments
  };
}

function updateDownPaymentRange(homePrice) {
  const safeHomePrice = Number.isFinite(homePrice) && homePrice > 0 ? homePrice : 300000;
  const maxDownPayment = Math.max(0, Math.floor((safeHomePrice * 0.9) / 1000) * 1000);
  ranges.downPayment.max = String(maxDownPayment);

  if (Number(ranges.downPayment.value) > maxDownPayment) {
    ranges.downPayment.value = String(maxDownPayment);
  }
}

function renderLiveSummary(values) {
  const homePrice = Number.isFinite(values.homePrice) ? values.homePrice : 0;
  const downPayment = Number.isFinite(values.downPayment) ? values.downPayment : 0;
  const loanAmount = Math.max(0, homePrice - downPayment);
  const downPercent = homePrice > 0 ? (downPayment / homePrice) * 100 : 0;

  output.loanAmountPreview.textContent = currency.format(loanAmount);
  output.downPaymentPercent.textContent = `${Math.round(downPercent)}%`;
}

function renderResults(result) {
  output.monthlyPayment.textContent = currency.format(result.monthlyPayment);
  output.principalAmount.textContent = currency.format(result.loanAmount);
  output.totalPayment.textContent = currency.format(result.totalPayment);
  output.totalInterest.textContent = currency.format(result.totalInterest);
  output.numberOfPayments.textContent = result.numberOfPayments.toLocaleString('en-US');
}

function calculateAndRender({ scrollToResults = false } = {}) {
  const values = getValues();
  renderLiveSummary(values);

  if (!validate(values)) {
    return;
  }

  renderResults(calculateMortgage(values));

  if (scrollToResults) {
    output.panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function syncRangeFromField(key) {
  if (!ranges[key] || !fields[key]) return;

  const value = Number(fields[key].value);
  const min = Number(ranges[key].min);
  const max = Number(ranges[key].max);

  if (Number.isFinite(value)) {
    ranges[key].value = String(Math.min(max, Math.max(min, value)));
  }
}

function syncFieldFromRange(key) {
  if (!ranges[key] || !fields[key]) return;
  fields[key].value = ranges[key].value;
}

Object.keys(fields).forEach((key) => {
  fields[key].addEventListener('input', () => {
    if (key === 'homePrice') {
      updateDownPaymentRange(Number(fields.homePrice.value));
    }

    syncRangeFromField(key);
    calculateAndRender();
  });
});

Object.keys(ranges).forEach((key) => {
  ranges[key].addEventListener('input', () => {
    syncFieldFromRange(key);

    if (key === 'homePrice') {
      updateDownPaymentRange(Number(fields.homePrice.value));
    }

    calculateAndRender();
  });
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  calculateAndRender({ scrollToResults: true });
});

updateDownPaymentRange(Number(fields.homePrice.value));
calculateAndRender();
