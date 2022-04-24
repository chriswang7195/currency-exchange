const accesskey = '?access_key=043234c684915cb1d035924f9cf76c54';
const baseEndpoint = `https://cors-anywhere.herokuapp.com/http://api.exchangeratesapi.io/v1/`;
async function fetchData(url) {
  const promise = await fetch(url);
  const response = await promise.json();
  return response;
}

function sortCurrences(currencies) {
  const result = [];
  for (let key in currencies) {
    result.push([key, currencies[key]]);
  }

  return result.sort((a, b) => { return a[1] <= b[1] ? -1 : 1 });
}

function formatNum(num) {
  let result = '';
  let numStr = num.toString();
  let dotIdx = numStr.indexOf('.');

  if (dotIdx < 0) return num;

  result = numStr.slice(0, dotIdx) + '.' + numStr.slice(dotIdx).match(/0*[1-9][0-9]/)[0];
  return Number(result);
}

async function addCurrencies() {
  const data = await fetchData(baseEndpoint + 'symbols' + accesskey);
  const currencies = sortCurrences(data['symbols']);

  document.querySelectorAll('select').forEach(el => {
    for (let i = 0; i < currencies.length; i++) {
      const option = document.createElement('option');
      option.setAttribute('data-unit', currencies[i][0]);
      option.textContent = currencies[i][1];
      el.appendChild(option);
    }
  });
}

async function start() {
  await addCurrencies();
  document.querySelector('.currency option[data-unit="USD"]').selected = true;
  document.querySelectorAll('option[data-unit="EUR"]')[1].selected = true;
  document.querySelector('input').value = 1;
  exchange();
}

async function exchange(reverse = false) {
  const data = await fetchData(baseEndpoint + 'latest' + accesskey);
  let [fromValue, toValue] = document.querySelectorAll('input');
  let [fromCurrency, toCurrency] = document.querySelectorAll('option:checked');

  if (reverse) {
    [fromValue, toValue] = [toValue, fromValue];
    [fromCurrency, toCurrency] = [toCurrency, fromCurrency];    
  }

  const toEuros = fromValue.value / data['rates'][fromCurrency.dataset.unit];
  const result = toEuros * data['rates'][toCurrency.dataset.unit];

  toValue.value = formatNum(result);
}

start();

document.querySelectorAll('select').forEach(el => {
  el.addEventListener('change', event => (exchange()));
});

document.querySelectorAll('input')[0].addEventListener('keyup', event => {
  if (!isNaN(event.key)) exchange(false);
});
  
document.querySelectorAll('input')[1].addEventListener('keyup', event => {
  if (!isNaN(event.key)) exchange(true);
});