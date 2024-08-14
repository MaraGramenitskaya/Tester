const tester = document.getElementById("tester")
const colors = ["rgb(193, 101, 243)", "rgb(152, 17, 117)", "rgb(20, 221, 145)", "rgb(250, 230, 50)", "rgb(23, 79, 109)", "rgb(105, 244, 5)", "rgb(96, 20, 238)", "rgb(237, 91, 91)", "rgb(57, 186, 255)", "rgb(20, 221, 145)", "rgb(250, 230, 50)", "rgb(23, 79, 109)", "rgb(105, 244, 5)", "rgb(96, 20, 238)", "rgb(237, 91, 91)", "rgb(57, 186, 255)"]

const options = {
    scales: {
        x: {
            borderWidth: 1,
            pointStyle: "circle",
            radius: 2,
            hoverRadius: 3
        }
    },
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

const ctx1 = document.getElementById("myChart").getContext("2d");
const ctx2 = document.getElementById("myChart2").getContext("2d");

const charts = {};

function createChart(ctx, data, options, chartId) {
    if (charts[chartId]) {
        charts[chartId].destroy();
    }
    charts[chartId] = new Chart(ctx, { type: "line", data: data, options: options });
}

function drawGraph(data) {
    const { timestamps, datasets1, datasets2 } = extractData(data)
    const chartData1 = {
        labels: timestamps,
        datasets: datasets1
    }
    const chartData2 = {
        labels: timestamps,
        datasets: datasets2
    }
    createChart(ctx1, chartData1, options, 'chart1');
    createChart(ctx2, chartData2, options, 'chart2');
}

function extractData(data) {
    const timestamps = data.map(row => row.timestamp.split("T")[1].split(".")[0]);
    const datasets1 = [];
    const datasets2 = [];
    let i = 0;
    for (let key in data[0]) {
        if (key !== "timestamp") {
            const label = key.replace(/_/g, " ");
            if (key.includes("Trigger")) {
                const dataset = data.map(row => row[key]);
                datasets2.push({
                    label: label,
                    data: dataset,
                    backgroundColor: colors[i],
                    borderColor: colors[i]
                })
                i++
            } else {
                const dataset = data.map(row => row[key]);
                datasets1.push({
                    label: label,
                    data: dataset,
                    backgroundColor: colors[i],
                    borderColor: colors[i]
                })
                i++
            }
        }

    }
    return { timestamps, datasets1, datasets2 };
}

fetch("/getDataBySession")
    .then(response => response.json())
    .then(data => drawGraph(data))
    .catch(error => console.error("Error fetching data:", error));

document.querySelector(".drop").addEventListener("click", function (event) {
    this.querySelector("div").style.display = "flex";
    event.stopPropagation();
});

window.addEventListener("click", function () {
    document.querySelector(".drop div").style.display = "none";
});

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

document.getElementById("seeSession").addEventListener("click", function () {
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
                const sessionsList = document.getElementById("sessions-list");
                sessionsList.innerHTML = "";
                sessions.forEach(session => {
                    const option = document.createElement("option");
                    option.value = session;
                    sessionsList.appendChild(option);
                });
            })
            .catch(error => console.error("Ошибка:", error));
    }
});

document.getElementById("confirm").addEventListener("click", function () {
    const sessionValue = document.getElementById("session").value;
    if (confirm(`Are you sure you want to see ${sessionValue} session?`)) {
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
    }
});

tester.addEventListener("click", () => {
    window.location.href = "/";
});