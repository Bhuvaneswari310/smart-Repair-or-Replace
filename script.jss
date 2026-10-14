```javascript
const form = document.getElementById("productForm");
const resultPanel = document.getElementById("resultPanel");
const resultContent = document.getElementById("resultContent");
const historyBody = document.getElementById("historyBody");

let history = [];

try {
    const saved = localStorage.getItem("titliProducts");
    history = saved ? JSON.parse(saved) : [];
    if (!Array.isArray(history)) history = [];
} catch (error) {
    history = [];
}

let decisionChart = null;

function money(value) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0
    }).format(value);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function analyzeProduct(product) {
    const conditionScores = {
        Excellent: 100,
        Good: 80,
        Average: 55,
        Poor: 25
    };

    const healthScore = Math.max(
        0,
        Math.min(
            100,
            conditionScores[product.condition] -
            product.age * 3 -
            (product.usage === "High" ? 10 :
             product.usage === "Medium" ? 5 : 0)
        )
    );

    let decision;
    let reason;

    if (product.repairCost >= product.replacementCost) {
        decision = "Replace";
        reason = "Repair cost is equal to or greater than replacement cost.";
    } else if (
        product.repairCost <= product.replacementCost * 0.5 &&
        product.condition !== "Poor"
    ) {
        decision = "Repair";
        reason = "Repair costs less than half of the replacement cost.";
    } else {
        decision = "Compare";
        reason = "Compare long-term reliability and costs before deciding.";
    }

    const savings = Math.max(
        0,
        product.replacementCost - product.repairCost
    );

    return {
        ...product,
        healthScore: Math.round(healthScore),
        decision,
        reason,
        savings,
        date: new Date().toLocaleDateString("en-IN")
    };
}

function renderResult(product) {
    const badgeClass = product.decision.toLowerCase();

    resultContent.innerHTML = `
        <div class="result-box">
            <h3>${escapeHTML(product.productName)}:
                <span class="decision ${badgeClass}">
                    ${escapeHTML(product.decision)}
                </span>
            </h3>
            <p>${escapeHTML(product.reason)}</p>
            <div class="result-grid">
                <div class="result-item">
                    <small>Product Health Score</small>
                    <strong>${product.healthScore}/100</strong>
                </div>
                <div class="result-item">
                    <small>Repair Cost</small>
                    <strong>${money(product.repairCost)}</strong>
                </div>
                <div class="result-item">
                    <small>Cost Difference</small>
                    <strong>${money(product.savings)}</strong>
                </div>
            </div>
            <p><small>
                This is a rule-based estimate, not a professional inspection.
            </small></p>
        </div>
    `;

    resultPanel.classList.remove("hidden");
    resultPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function saveHistory() {
    try {
        localStorage.setItem("titliProducts", JSON.stringify(history));
    } catch (error) {
        alert("Browser storage is unavailable. Your current session may not be saved.");
    }
}

function renderHistory() {
    if (history.length === 0) {
        historyBody.innerHTML = `
            <tr><td colspan="6" class="empty">
                No products analyzed yet.
            </td></tr>`;
    } else {
        historyBody.innerHTML = history.map(product => `
            <tr>
                <td>${escapeHTML(product.productName)}</td>
                <td>${escapeHTML(product.condition)}</td>
                <td>${money(product.repairCost)}</td>
                <td>${money(product.replacementCost)}</td>
                <td>
                    <span class="decision ${product.decision.toLowerCase()}">
                        ${escapeHTML(product.decision)}
                    </span>
                </td>
                <td>${escapeHTML(product.date)}</td>
            </tr>
        `).join("");
    }

    document.getElementById("totalProducts").textContent = history.length;

    document.getElementById("repairCount").textContent =
        history.filter(item => item.decision === "Repair").length;

    document.getElementById("replaceCount").textContent =
        history.filter(item => item.decision === "Replace").length;

    const savings = history.reduce((total, item) => {
        return total + (item.decision === "Repair" ? item.savings : 0);
    }, 0);

    document.getElementById("totalSavings").textContent = money(savings);

    renderChart();
}

function renderChart() {
    if (typeof Chart === "undefined") return;

    const counts = ["Repair", "Replace", "Compare"].map(decision =>
        history.filter(item => item.decision === decision).length
    );

    const canvas = document.getElementById("decisionChart");

    if (decisionChart) {
        decisionChart.data.datasets[0].data = counts;
        decisionChart.update();
        return;
    }

    decisionChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: ["Repair", "Replace", "Compare"],
            datasets: [{
                label: "Number of Products",
                data: counts,
                backgroundColor: ["#6c4ce4", "#ef6b73", "#f4b942"],
                borderRadius: 7
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const product = {
        productName: document.getElementById("productName").value.trim(),
        category: document.getElementById("category").value,
        age: Number(document.getElementById("age").value),
        condition: document.getElementById("condition").value,
        purchaseCost: Number(document.getElementById("purchaseCost").value),
        repairCost: Number(document.getElementById("repairCost").value),
        replacementCost: Number(document.getElementById("replacementCost").value),
        usage: document.getElementById("usage").value
    };

    if (
        !product.productName ||
        !product.category ||
        !product.condition ||
        !product.usage ||
        !Number.isFinite(product.age) ||
        !Number.isFinite(product.purchaseCost) ||
        !Number.isFinite(product.repairCost) ||
        !Number.isFinite(product.replacementCost) ||
        product.age < 0 ||
        product.purchaseCost < 0 ||
        product.repairCost < 0 ||
        product.replacementCost <= 0
    ) {
        alert("Please enter valid product details and costs.");
        return;
    }

    const result = analyzeProduct(product);

    history.unshift(result);
    saveHistory();
    renderResult(result);
    renderHistory();

    form.reset();
});

document.getElementById("clearBtn").addEventListener("click", function () {
    if (history.length === 0) {
        alert("History is already empty.");
        return;
    }

    if (confirm("Are you sure you want to clear all product history?")) {
        history = [];
        saveHistory();
        renderHistory();
        resultPanel.classList.add("hidden");
    }
});

document.getElementById("exportBtn").addEventListener("click", function () {
    if (history.length === 0) {
        alert("Analyze at least one product before exporting.");
        return;
    }

    const columns = [
        "Product Name", "Category", "Age", "Condition",
        "Original Cost", "Repair Cost", "Replacement Cost",
        "Usage", "Health Score", "Decision", "Reason", "Date"
    ];

    const rows = history.map(item => [
        item.productName,
        item.category,
        item.age,
        item.condition,
        item.purchaseCost,
        item.repairCost,
        item.replacementCost,
        item.usage,
        item.healthScore,
        item.decision,
        item.reason,
        item.date
    ]);

    function csvCell(value) {
        return '"' + String(value).replace(/"/g, '""') + '"';
    }

    const csv = [columns, ...rows]
        .map(row => row.map(csvCell).join(","))
        .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "project-titli-analysis.csv";
    link.click();
    URL.revokeObjectURL(url);
});

renderHistory();
```