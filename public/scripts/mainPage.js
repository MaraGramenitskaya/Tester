const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const minInput = document.getElementById("min");
const secInput = document.getElementById("sec");
const graph = document.getElementById("seeGraph");
const notif = document.getElementById('notification');
const notifText = document.getElementById('notificationText');
const startText = document.getElementById('startText');
let stop = false
let timerId = null;

const timer = {
    start: () => {
        const min = Math.max(0, parseInt(minInput.value, 10) || 0);
        const sec = Math.min(59, Math.max(0, parseInt(secInput.value, 10) || 0));
        const checkboxStates = Array.from(document.querySelectorAll(".dvoynoy input[type='checkbox']")).map(checkbox => checkbox.checked);
        if (min > 0 || sec > 0) {
            if (confirm(`Вы уверены, что хотите начать ${min} минутную и ${sec} секундную сессию? `)) {
                // fetch("/start", {
                //     method: "POST",
                //     headers: {
                //         "Content-Type": "application/json"
                //     },
                //     body: JSON.stringify({ min, sec, checkboxStates })
                // })
                //     .then(response => response.text())
                //     .then(data => console.log(data))
                //     .then(stop = false)
                //     .then(startTimer(min, sec))
                //     .catch(error => console.error(error));
                stop = false
                startTimer(min, sec)
            }
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

function createBig() {
    for (let i = 1; i <= 7; i++) {
        const div = document.createElement("div");
        div.className = "dvoynoy";
        div.innerHTML = `
        <p>${i}</p>
            <div id="temp${i}" class="sensor">Температура ${i}</div>
            <div id="trigger${i}" class="sensor">Триггер ${i}</div>
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

function updateElements(message) {
    if (message) {
        const values = message.split(",");
        const sample = document.getElementById("sample");
        const maxTemp = document.getElementById("setTemp");
        const tempElements = ["temp1", "temp2", "temp3", "temp4", "temp5", "temp6", "temp7"].map(id => document.getElementById(id));
        const triggerElements = ["trigger1", "trigger2", "trigger3", "trigger4", "trigger5", "trigger6", "trigger7"].map(id => document.getElementById(id));
        const checkboxStates = Array.from(document.querySelectorAll(".dvoynoy input[type='checkbox']")).map(checkbox => checkbox.checked);
        
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
                triggerElements[i].innerText = `Trigger ${i + 1}`;
            }
        }
    }
}

function sendMessage() {
    const input = document.getElementById("myInput");
    const inputValue = (input.value * 10).toString().substr(0, 3) / 10
    if (confirm(`Вы уверены, что хотите задать температуру нагрева: "${inputValue}"?`)) {
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
    }
}

function startTimer(min, sec) {
    notif.style.opacity = 1;
    let secondsPassed = min * 60 + sec;
    const timerInterval = setInterval(() => {
        if (!stop) {
            if (secondsPassed > 0) {
                notifText.innerHTML = `Оставшееся время: ${secondsPassed}с`;
                startText.textContent = `Запись в БД начата`
                secondsPassed--;
            } else {
                notifText.textContent = ``;
                startText.textContent = `Запись окончена`
                clearInterval(timerInterval);
            }
        } else {
            clearInterval(timerInterval)
        }
    }, 1000)
}

function stopTimer() {
    stop = true;
    notifText.textContent = ``;
    startText.textContent = `Запись остановлена`
}

graph.addEventListener("click", () => {
    window.location.href = "/graph";
});

startBtn.addEventListener("click", timer.start);
stopBtn.addEventListener("click", timer.stop);

createBig();
checkBodyHeight();

// setInterval(() => {
//     fetch("/checkUpdates")
//         .then(response => response.text())
//         .then(message => updateElements(message));
// }, 1000);
// updateElements();