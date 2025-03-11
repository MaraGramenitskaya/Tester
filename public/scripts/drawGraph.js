// кнопка возвращения
const tester = document.getElementById("tester")
// инфо
const info = document.getElementById('info')
const infoBlock = document.getElementById('infoBlock')
const ok = document.getElementById('ok')
// триггерные датчики
const triggraph = document.getElementById('triggraph')
// confirm блок
const confirmMessage = document.getElementById('message')
const confirmBlock = document.getElementById('confirmBlock')
const sendButton = document.getElementById('send');
const cancelButton = document.getElementById('cancel');
const sessionInput = document.getElementById('session')
// выпадающий список с номерами
const sessionsList = document.getElementById("sessions-list");
const seeSessions = document.getElementById("seeSession");

// цвета для датчиков и графика
const colors = ["rgb(193, 101, 243)", "rgb(152, 17, 117)", "rgb(20, 221, 145)", "rgb(250, 230, 50)", "rgb(23, 79, 109)", "rgb(105, 244, 5)", "rgb(96, 20, 238)", "rgb(237, 91, 91)", "rgb(57, 186, 255)"]

// настройки для постройки графика
const options = {
    scales: {
        x: {
            borderWidth: 1,
            pointStyle: "circle",
            radius: 2,
            hoverRadius: 3
        }
    },
    elements: {
        point: {
            radius: 0,
            pointStyle: 'circle'
        }
    },
    interaction: {
        mode: 'index',
        intersect: false
    },
    bezierCurve: true,
    plugins: {
        legend: {
            display: true,
            labels: {
                usePointStyle: true,
                pointStyle: "rectRounded",
                color: "rgb(102, 102, 102)",
                font: {
                    family: "sans-serif",
                    size: 14
                },
                boxWidth: 15,
                boxHeight: 15
            }
        }
    }
}

const ctx1 = document.getElementById("myChart").getContext("2d"); // место графика
const charts = {}; // здесь будут все графики (если будет больше 1)

// функция для создания графика
function createChart(ctx, data, options, chartId) {
    // если график уже нарисован уничтожь его
    if (charts[chartId]) {
        charts[chartId].destroy();
    }
    // а теперь создай новый
    charts[chartId] = new Chart(ctx, { type: "line", data: data, options: options });
}

function createTrigGraph(datasets) {
    // очишаем прошлые данные
    triggraph.innerHTML = '';

    // запускаем цикл для каждого из триггеров и рисуем то, что надо
    for (const key in datasets) {
        if (datasets.hasOwnProperty(key)) {
            const item = datasets[key];

            const div = document.createElement('div');
            const span1 = document.createElement('span');
            const span2 = document.createElement('span');

            div.id = `trig${key + 1}`;
            div.className = 'trigdiv';

            div.style.backgroundColor = item.backgroundColor;
            div.appendChild(span1);
            div.appendChild(span2);

            span1.textContent = item.label;
            span2.textContent = item.data;

            triggraph.appendChild(div);
        }
    }
}

// функция для работы страницы
function drawGraph(data) {
    // получаем данные обработанные extractData(data)
    const { timestamps, datasets1, datasets2 } = extractData(data)
    const chartData1 = {
        labels: timestamps,
        datasets: datasets1
    }
    // создаем график
    createChart(ctx1, chartData1, options, 'chart1');
    // рисуем триггеры
    createTrigGraph(datasets2);
}

// обработка полученных данных
function extractData(data) {
    const timestamps = data.map(row => row.timestamp.split("T")[1].split(".")[0]);
    const datasets1 = [];
    const datasets2 = [];
    let i = 0;

    const firstTempTriggers = Array.from({ length: 7 }, () => null);

    data.forEach(row => {
        for (let j = 1; j <= 7; j++) {
            const triggerKey = `Trigger_${j}`;
            const tempKey = `Temp_${j}`;
            if (row[triggerKey] === 1 && firstTempTriggers[j - 1] === null) {
                firstTempTriggers[j - 1] = row[tempKey];
            }
        }
    });

    for (let j = 1; j <= 7; j++) {
        const label = `№${j}`;
        datasets2.push({
            label: label,
            data: firstTempTriggers[j - 1] !== null ? firstTempTriggers[j - 1].toString() : 'датчик не сработал',
            backgroundColor: colors[i + 2],
        });
        i++;
    }

    for (let key in data[0]) {
        if (key !== "timestamp" && !key.includes("Trigger")) {
            const label = key.replace(/_/g, " ");
            const dataset = data.map(row => row[key]);
            datasets1.push({
                label: label,
                data: dataset,
                backgroundColor: colors[i - 7],
                borderColor: colors[i - 7]
            });
            i++;
        }
    }

    return { timestamps, datasets1, datasets2 };
}

// проверка высоты экрана (исполняет чисто эстетическую цель)
function checkBodyHeight() {
    const Tahat = document.getElementById('Tahat');
    const bodyHeight = document.body.offsetHeight;
    const viewportHeight = window.innerHeight;
    const TahatHeight = Tahat.offsetHeight;

    if (bodyHeight > (viewportHeight * 0.99 - TahatHeight)) {
        Tahat.style.position = "relative";
    } else {
        Tahat.style.position = "fixed";
    }
    window.addEventListener("resize", checkBodyHeight);
}

//confirm меню
function showConfirm(messageText, callback) {
    confirmMessage.textContent = messageText;
    confirmBlock.style.display = 'flex';
    callbackFunction = callback;
}
sendButton.addEventListener('click', () => {
    if (callbackFunction) {
        callbackFunction()
    }
    confirmBlock.style.display = 'none';
});
cancelButton.addEventListener('click', () => {
    confirmBlock.style.display = 'none';
});

// открыть настройки
document.querySelector(".drop").addEventListener("click", function (event) {
    if (sessionsList.style.display == 'block') {
        sessionsList.style.display = 'none';
    }
    this.querySelector("div").style.display = "flex";
    event.stopPropagation();
});

// закрыть настройки
window.addEventListener("click", function () {
    document.querySelector(".drop div").style.display = "none";
});

// показать номер последней сессии
document.getElementById("lastSession").addEventListener("click", async () => {
    const response = await fetch("/getLastSession", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });
    const lastSession = await response.json();
    document.getElementById("session").value = lastSession.lastSession;

})

// показать сессии за дату (поработать над этим)
seeSessions.addEventListener("click", function () {
    const dateInput = document.getElementById("time1");
    const date = dateInput.value;
    if (date) {
        fetch("/getSessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ date: date })
        })
            .then(response => response.json())
            .then(sessions => {
                sessionsList.innerHTML = "";
                sessions.forEach(session => {
                    const option = document.createElement("div");
                    option.textContent = session;
                    option.onclick = () => {
                        sessionInput.value = session; // Устанавливаем значение в input
                        sessionsList.style.display = "none"; // Скрываем список после выбора
                    };
                    sessionsList.appendChild(option);
                });
                if (sessionsList.innerHTML != "") {
                    sessionsList.style.display = "block"
                }
            })
            .catch(error => console.error("Ошибка:", error));
    }
});

    // Функция для переключения видимости списка
    sessionInput.addEventListener('click', function(event) {
        if(sessionInput.value){
            sessionsList.style.display = sessionsList.style.display === 'none' || sessionsList.style.display === '' ? 'block' : 'block';
            event.stopPropagation(); // Останавливаем всплытие события
        }
    });

// Скрываем список, если кликнули вне его
document.querySelector(".drop div").addEventListener('click', function (event) {
    if (event.target !== sessionInput) {
        sessionsList.style.display = 'none';
    } else{
        sessionsList.style.display = 'block';
    }
});

// кнопка подтвердить и все с ней связанное (откртие меню confirm)
document.getElementById("confirm").addEventListener("click", function () {
    const sessionValue = sessionInput.value;
    if (sessionValue > 0) {
        showConfirm(`Вы уверены, что хотите посмотреить график за ${sessionValue} сессию?`, () => {
            fetch("/confirmSession", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ session: sessionValue })
            })
                .then(response => response.json())
                .then(data => drawGraph(data))
                .catch(error => console.error("Error:", error));
        })
    }
});

// возвращение на главную
tester.addEventListener("click", () => {
    window.location.href = "/";
});

// открыть инфо блок
info.addEventListener("click", () => {
    infoBlock.style.display = 'flex';
});
// закрыть инфо блок
ok.addEventListener("click", () => {
    infoBlock.style.display = 'none';
})

// открывать последнюю сессию по умолчанию
fetch("/getDataBySession")
    .then(response => response.json())
    .then(data => drawGraph(data))
    .catch(error => console.error("Error fetching data:", error));

checkBodyHeight();