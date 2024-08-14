const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const minInput = document.getElementById("min");
const secInput = document.getElementById("sec");
const graph = document.getElementById("seeGraph")
let timerId = null;

const timer = {
    start: () => {
        const min = Math.max(0, parseInt(minInput.value, 10) || 0);
        const sec = Math.min(59, Math.max(0, parseInt(secInput.value, 10) || 0));
        const checkboxStates = Array.from(document.querySelectorAll(".dvoynoy input[type='checkbox']")).map(checkbox => checkbox.checked);
        if (min > 0 || sec > 0) {
            if (confirm(`Are you sure you want to start ${min} min ${sec} sec session? `)) {
                fetch("/start", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ min, sec, checkboxStates })
                })
                    .then(response => response.text())
                    .then(data => console.log(data))
                    .catch(error => console.error(error));

                setTimeout(() => {
                    console.log(`Session is over`);
                }, min * 60 * 1000 + sec * 1000);
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
            .catch(error => console.error(error));
    }
}

for (let i = 1; i <= 7; i++) {
    const div = document.createElement("div");
    div.className = "dvoynoy";
    div.innerHTML = `
        <p>${i}</p>
        <div id="temp${i}" class="sensor">Temp ${i}</div>
        <div id="trigger${i}" class="trigger">Trigger ${i}</div>
        <input type="checkbox" id="checkbox${i}" checked>
        `;
    document.getElementById("big").appendChild(div);
}

startBtn.addEventListener("click", timer.start);
stopBtn.addEventListener("click", timer.stop);

function sendMessage() {
    const input = document.getElementById("myInput");
    const inputValue = (input.value * 10).toString().substr(0, 3) / 10
    if (confirm(`Are you sure you want to set Max Temp: "${inputValue}"?`)) {
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

function updateElements(message) {
    if (message) {
        const values = message.split(",");
        const sample = document.getElementById("sample");
        const maxTemp = document.getElementById("setTemp");
        const tempElements = ["temp1", "temp2", "temp3", "temp4", "temp5", "temp6", "temp7"].map(id => document.getElementById(id));
        const triggerElements = ["trigger1", "trigger2", "trigger3", "trigger4", "trigger5", "trigger6", "trigger7"].map(id => document.getElementById(id));

        sample.innerText = values[0];
        maxTemp.innerText = values[1];
        for (let i = 1; i < 8; i++) {
            const tempValue = values[2 + i * 2];
            const triggerValue = values[3 + i * 2];
            if (tempValue === "error") {
                tempElements[i].innerText = "Error";
                tempElements[i].style.backgroundColor = "#ff3c00";
                triggerElements[i].style.backgroundColor = "#ff3c00";
                triggerElements[i].innerText = "Error";
            } else {
                tempElements[i].innerText = tempValue;
                tempElements[i].style.backgroundColor = "#FF9100";
                triggerElements[i].style.backgroundColor = triggerValue === "1" ? "#9dff00" : "#FF9100";
                triggerElements[i].innerText = `Trigger${i + 1}`;
            }
        }
    }
}

setInterval(() => {
    fetch("/checkUpdates")
        .then(response => response.text())
        .then(message => updateElements(message));
}, 1000);

graph.addEventListener("click", () => {
    window.location.href = "/graph";
});
