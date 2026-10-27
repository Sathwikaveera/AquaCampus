
const KEY = "aquacampus_final_reports";
let reports = [];

try {
  reports = JSON.parse(localStorage.getItem(KEY) || "[]");
  if (!Array.isArray(reports)) reports = [];
} catch (error) {
  reports = [];
}

const form = document.getElementById("form");
const table = document.getElementById("rows");

function saveReports() {
  localStorage.setItem(KEY, JSON.stringify(reports));
}

function updateDashboard() {
  document.getElementById("total").textContent = reports.length;
  document.getElementById("pending").textContent =
    reports.filter(r => r.status === "Pending").length;
  document.getElementById("progress").textContent =
    reports.filter(r => r.status === "In Progress").length;
  document.getElementById("resolved").textContent =
    reports.filter(r => r.status === "Resolved").length;
}

function displayReports() {
  const search = document.getElementById("search").value.toLowerCase().trim();
  const filter = document.getElementById("filter").value;

  const filtered = reports.filter(r =>
    `${r.type} ${r.location} ${r.description}`.toLowerCase().includes(search) &&
    (filter === "All" || r.status === filter)
  );

  table.innerHTML = "";

  filtered.forEach(report => {
    const row = document.createElement("tr");

    [report.type, report.location, report.description].forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });

    const statusCell = document.createElement("td");
    statusCell.textContent = report.status;
    row.appendChild(statusCell);

    const updateCell = document.createElement("td");
    const select = document.createElement("select");
    select.className = "status-select";

    ["Pending", "In Progress", "Resolved"].forEach(status => {
      const option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      select.appendChild(option);
    });

    select.value = report.status;

    select.addEventListener("change", () => {
      report.status = select.value;
      saveReports();
      displayReports();
    });

    updateCell.appendChild(select);
    row.appendChild(updateCell);
    table.appendChild(row);
  });

  document.getElementById("empty").hidden = filtered.length > 0;
  updateDashboard();
  updateIssueChart();
}

let waterChart = null;
let issueChart = null;

function initializeCharts() {
  if (typeof Chart === "undefined") {
    console.error("Chart.js failed to load. Check your internet connection.");
    return;
  }

  waterChart = new Chart(document.getElementById("waterChart"), {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      datasets: [{
        label: "Water Usage (litres)",
        data: [4200, 3900, 4500, 3700, 4100, 3200, 3500],
        borderColor: "#078b96",
        backgroundColor: "rgba(7, 139, 150, 0.15)",
        fill: true,
        tension: 0.35,
        pointRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: "Litres" }
        }
      }
    }
  });

  issueChart = new Chart(document.getElementById("issueChart"), {
    type: "doughnut",
    data: {
      labels: ["Leaking Tap", "Tank Overflow", "Other Issues"],
      datasets: [{
        data: [0, 0, 0],
        backgroundColor: ["#078b96", "#f5a623", "#8064c7"],
        borderWidth: 2,
        borderColor: "#ffffff"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom" }
      }
    }
  });

  updateIssueChart();
}

function updateIssueChart() {
  if (!issueChart) return;

  const counts = [0, 0, 0];

  reports.forEach(report => {
    const type = report.type.toLowerCase();

    if (type.includes("leak") || type.includes("tap")) {
      counts[0]++;
    } else if (type.includes("tank") || type.includes("overflow")) {
      counts[1]++;
    } else {
      counts[2]++;
    }
  });

  issueChart.data.datasets[0].data = counts;
  issueChart.update();
}

form.addEventListener("submit", function(event) {
  event.preventDefault();

  const type = document.getElementById("type").value;
  const location = document.getElementById("location").value.trim();
  const description = document.getElementById("description").value.trim();
  const reporter = document.getElementById("reporter").value.trim();

  if (!type || !location || !description) {
    alert("Please fill in all required fields.");
    return;
  }

  reports.unshift({
    id: Date.now(),
    type,
    location,
    description,
    reporter,
    status: "Pending"
  });

  try {
    saveReports();
    displayReports();
    form.reset();
    alert("Report submitted successfully!");
  } catch (error) {
    console.error(error);
    alert("Could not save the report. Please try again.");
  }
});

document.getElementById("search").addEventListener("input", displayReports);
document.getElementById("filter").addEventListener("change", displayReports);

document.getElementById("reset").addEventListener("click", function() {
  if (confirm("Clear all reports and reset the demo?")) {
    reports = [];
    saveReports();
    displayReports();
  }
});

document.getElementById("jump").addEventListener("click", function() {
  document.getElementById("formPanel").scrollIntoView({
    behavior: "smooth"
  });
});

initializeCharts();
displayReports();
