// кнопки и поля для таймера
const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const minInput = document.getElementById("min");
const secInput = document.getElementById("sec");
// переход к графику
const graph = document.getElementById("seeGraph");
// инфо блок
const info = document.getElementById('info')
const infoBlock = document.getElementById('infoBlock')
const ok = document.getElementById('ok')
// confirm блок
const confirmMessage = document.getElementById('message')
const confirmBlock = document.getElementById('confirmBlock')
const sendButton = document.getElementById('send');
const cancelButton = document.getElementById('cancel');
// блок с уведомлениями
const notif = document.getElementById('notification');
const notifText = document.getElementById('notificationText');
const startText = document.getElementById('startText');
// картинка для блока уведомлений
const img = document.createElement('img');
img.style.width = '50px';
img.style.height = '50px';

// переменные для таймера
let stop = false
let timerId = null;

// сам таймер для записи в базу
const timer = {
    start: () => {
        const min = Math.max(0, parseInt(minInput.value, 10) || 0);
        const sec = Math.min(59, Math.max(0, parseInt(secInput.value, 10) || 0));
        const checkboxStates = Array.from(document.querySelectorAll(".dvoynoy input[type='checkbox']")).map(checkbox => checkbox.checked);
        if (min > 0 || sec > 0) {
            showConfirm(`Вы уверены, что хотите начать ${min} минутную и ${sec} секундную сессию? `, () => {
                fetch("/start", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ min, sec, checkboxStates })
                })
                    .then(response => response.text())
                    .then(data => console.log(data))
                    .then(stop = false)
                    .then(startTimer(min, sec))
                    .catch(error => console.error(error));
                stop = false
                startTimer(min, sec)
            })
        }
    },
    stop: () => {
        fetch("/stop", {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        })
            .then(response => response.text())
            .then(message => console.log(message))
            .then(stopTimer())
            .catch(error => console.error(error));
    }
}
// начало таймера
function startTimer(min, sec) {
    notif.style.opacity = 1;
    let secondsPassed = min * 60 + sec;
    const timerInterval = setInterval(() => {
        if (!stop) {
            if (secondsPassed > 0) {
                notifText.innerHTML = `Оставшееся время: ${Math.floor(secondsPassed / 60)}м и ${secondsPassed % 60}с`;
                startText.textContent = `Запись в БД начата`
                img.src = './images/Timer1.svg'
                notif.appendChild(img)
                secondsPassed--;
            } else {
                notifText.textContent = ``;
                startText.textContent = `Запись окончена`
                img.src = './images/Timer2.svg'
                clearInterval(timerInterval);
            }
        } else {
            clearInterval(timerInterval)
        }
    }, 1000)
}
// остановка таймера
function stopTimer() {
    stop = true;
    notifText.textContent = ``;
    startText.textContent = `Запись остановлена`
    img.src = './images/Timer3.svg'
}

// создание основного блока с датчиками
function createBig() {
    for (let i = 1; i <= 7; i++) {
        const div = document.createElement("div");
        div.className = "dvoynoy";
        div.innerHTML = `
        <p>${i}</p>
            <div id="temp${i}" class="sensor"><p>Температура</p>${i}</div>
            <div id="trigger${i}" class="sensor"><p>Триггер<p>${i}</div>
            <input type="checkbox" id="checkbox${i}" checked>
            <div class="checkbox-image" id="image${i}"></div>
            `;
        document.getElementById("big").appendChild(div);

        const checkbox = document.getElementById(`checkbox${i}`);
        const checkboxImage = document.getElementById(`image${i}`);

        checkboxImage.addEventListener('click', () => {
            checkbox.checked = !checkbox.checked;
        });
    }
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

// функция для обновления данных
function updateElements(message) {
    if (message) {
        const values = message.split(",");
        const sample = document.getElementById("sample");
        const maxTemp = document.getElementById("setTemp");
        const tempElements = ["temp1", "temp2", "temp3", "temp4", "temp5", "temp6", "temp7"].map(id => document.getElementById(id));
        const triggerElements = ["trigger1", "trigger2", "trigger3", "trigger4", "trigger5", "trigger6", "trigger7"].map(id => document.getElementById(id));
        const checkboxStates = Array.from(document.querySelectorAll(".dvoynoy input[type='checkbox']")).map(checkbox => checkbox.checked);
        console.log(values);
        
        sample.innerText = values[0];
        maxTemp.innerText = values[1];
        for (let i = 0; i < 7; i++) {
            const tempValue = values[2 + i * 2];
            const triggerValue = values[3 + i * 2];
            if (tempValue === "error") {
                tempElements[i].innerText = "Error";
                tempElements[i].style.backgroundColor = "#ff3c00";
                triggerElements[i].style.backgroundColor = "#ff3c00";
                triggerElements[i].innerText = "Error";
            } else {

                if (checkboxStates[i]) {
                    tempElements[i].style.backgroundColor = "#ffdab7";
                    triggerElements[i].style.backgroundColor = triggerValue === "1" ? "#9dff00" : "#ffdab7";
                } else {
                    tempElements[i].style.backgroundColor = "#FFF5EB";
                    triggerElements[i].style.backgroundColor = triggerValue === "1" ? "#9dff00" : "#FFF5EB";
                }
                tempElements[i].innerText = tempValue;
                triggerElements[i].innerText = `Триггер ${i + 1}`;
            }
        }
    }
}

// отправка на брокер макс. температуры
function sendMessage() {
    const input = document.getElementById("myInput");
    const inputValue = Math.abs((input.value * 10).toString().substr(0, 3) / 10)
    showConfirm(`Вы уверены, что хотите задать температуру нагрева: "${inputValue}"?`, () => {
        const setTemp = document.getElementById("setTemp");
        setTemp.innerText = inputValue;
        fetch("/send-message", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ input: inputValue })
        })
            .then(response => response.text())
            .then(data => console.log(data))
            .catch(error => console.error(error));
    })
}

// confirm блок
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

// переход к графикам
graph.addEventListener("click", () => {
    window.location.href = "/graph";
});

// инфо блок
info.addEventListener("click", () => {
    infoBlock.style.display = 'flex';
});
ok.addEventListener("click", () => {
    infoBlock.style.display = 'none';
})

// кнопки таймера
startBtn.addEventListener("click", timer.start);
stopBtn.addEventListener("click", timer.stop);

createBig();
checkBodyHeight();

// setInterval(() => {
//     fetch("/checkUpdates")
//         .then(response => response.text())
//         .then(message => updateElements(message));
// }, 1000);