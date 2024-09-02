const coinExchange = document.getElementById("coin-exchange");
const selectCoin = document.getElementById("select-coin");
const btnSearch = document.getElementById("btn-search");
const divResult = document.getElementById("div-result");
const divError = document.getElementById("divError");
const myChart = document.getElementById("myChart");

const currencies = [];
async function getExchangeRate() {
    try {
        const res = await fetch("https://mindicador.cl/api");
        const data = await res.json();
        let keyNames = Object.keys(data);
        for (let i = 0; i < keyNames.length; i++) {
            let key = keyNames[i];
            if (isObject(data[key])) {
                currencies.push(data[key]);
            }
        }
        renderSelect();
    } catch (error) {
        console.log(error);
        divError.innerHTML = error;
    }
}

async function getAndCreateDataToChart(currencyCode) {
    try {
        const res = await fetch("https://mindicador.cl/api/" + currencyCode);
        const currencyData = await res.json();

        //primeros 10 elementos
        series = currencyData.serie.slice(0, 10);
        const labels = series.map((serie) => {
            return serie.fecha;
        });
        const data = series.map((serie) => {
            let valor = serie.valor;
            return Number(valor);
        });
        const datasets = [
            {
                label: "Cambio",
                borderColor: "rgb(255, 99, 132)",
                data,
            },
        ];
        return { labels, datasets };
    } catch (error) {
        console.log(error);
        divError.innerHTML = error;
    }
}

let char;
async function renderGrafica(currencyCode) {
    const data = await getAndCreateDataToChart(currencyCode);
    const config = {
        type: "line",
        data,
    };

    if (char) {
        char.destroy();
    }

    myChart.style.backgroundColor = "white";
    char = new Chart(myChart, config);
}

function renderSelect() {
    let options = "";
    for (let currency of currencies) {
        options += `<option value="${currency.codigo}">${currency.nombre}</option>`;
    }
    selectCoin.innerHTML = options;
    divError.innerHTML = ``;
    divResult.innerHTML = ``;
}

const isObject = (value) => {
    return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof RegExp) && !(value instanceof Date) && !(value instanceof Set) && !(value instanceof Map);
};

function findCoin(code) {
    return currencies.filter((ele) => ele.codigo == code)[0];
}

btnSearch.addEventListener("click", () => {
    if (coinExchange.value == "") {
        divError.innerHTML = `<label class="form-label label-error">Campo es requerido, debe ingresar valor</label>`;
        return;
    }

    let selectValue = selectCoin.value;
    let currency = findCoin(selectValue);
    renderGrafica(currency.codigo);

    let amount = coinExchange.value;
    let totalExchange = amount * currency.valor;

    divResult.innerHTML = `<label class="form-label">Resultado: <strong>${totalExchange}</strong> ${currency.unidad_medida}</label>`;
    divError.innerHTML = ``;
});

getExchangeRate();
