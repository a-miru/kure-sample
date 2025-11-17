// グローバル変数
let apiData = null;
let charts = {
  nationality: null,
  ageGroup: null,
  district: null,
  trend: null,
};

// アクセストークンの表示/非表示切り替え
function toggleTokenVisibility() {
  const tokenInput = document.getElementById("apiToken");
  tokenInput.type = tokenInput.type === "password" ? "text" : "password";
}

// エラーメッセージの表示
function showError(message) {
  const errorDiv = document.getElementById("errorMessage");
  errorDiv.textContent = message;
  errorDiv.style.display = "block";
  document.getElementById("loadingMessage").style.display = "none";
  document.getElementById("dashboard").style.display = "none";
}

// ローディング表示
function showLoading() {
  document.getElementById("loadingMessage").style.display = "block";
  document.getElementById("errorMessage").style.display = "none";
  document.getElementById("dashboard").style.display = "none";
}

// ダッシュボード表示
function showDashboard() {
  document.getElementById("dashboard").style.display = "block";
  document.getElementById("loadingMessage").style.display = "none";
  document.getElementById("errorMessage").style.display = "none";
}

// APIからデータ取得
async function fetchData() {
  const apiToken = document.getElementById("apiToken").value;
  const yearMonth = document.getElementById("yearMonth").value;

  // バリデーション
  if (!apiToken) {
    showError("アクセストークンを入力してください。");
    return;
  }

  if (!yearMonth) {
    showError("集計月を選択してください。");
    return;
  }

  showLoading();

  const baseUrl = "https://api.expolis.cloud/opendata/t/kure/v1";
  const url = `${baseUrl}/foreign-population?year_month=${yearMonth}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "ecp-api-token": apiToken,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `HTTPエラー: ${response.status} - ${response.statusText}`
      );
    }

    apiData = await response.json();

    console.log("API Response:", apiData);

    // データが正しい形式か確認
    if (!apiData) {
      throw new Error("データの形式が正しくありません。");
    }

    // データを処理して表示
    processAndDisplayData(apiData);
    showDashboard();
  } catch (error) {
    console.error("API呼び出しエラー:", error);
    showError(`データの取得に失敗しました: ${error.message}`);
  }
}

// データ処理と表示
function processAndDisplayData(data) {
  console.log("processAndDisplayData - received data:", data);
  
  // サマリー統計の計算
  const stats = calculateStatistics(data);
  console.log("calculateStatistics - stats:", stats);

  // サマリーカードの更新
  updateSummaryCards(stats);

  // グラフの描画
  drawCharts(data, stats);

  // テーブルの更新
  updateTable(data);
}

// 統計情報の計算
function calculateStatistics(data) {
  let totalForeignPopulation = 0;
  let totalPopulation = 0;
  let nationalityCount = 0;
  let districtCount = 0;
  let ageGroupCount = 0;

  // データ構造に応じた統計計算
  if (data.summary) {
    totalForeignPopulation = data.summary.total_foreign_population || 0;
    totalPopulation = data.summary.total_population || 0;
  }

  if (data.by_nationality) {
    nationalityCount = Object.keys(data.by_nationality).length;
    totalForeignPopulation = Object.values(data.by_nationality).reduce(
      (sum, val) => sum + (val || 0),
      0
    );
  }

  if (data.by_district) {
    districtCount = Object.keys(data.by_district).length;
  }

  if (data.by_age_group) {
    ageGroupCount = Object.keys(data.by_age_group).length;
  }

  const foreignRatio =
    totalPopulation > 0
      ? ((totalForeignPopulation / totalPopulation) * 100).toFixed(2)
      : 0;

  return {
    totalForeignPopulation: totalForeignPopulation,
    totalPopulation: totalPopulation,
    foreignRatio: foreignRatio,
    nationalityCount: nationalityCount,
    districtCount: districtCount,
    ageGroupCount: ageGroupCount,
  };
}

// サマリーカードの更新
function updateSummaryCards(stats) {
  document.getElementById("totalForeignPopulation").textContent =
    stats.totalForeignPopulation.toLocaleString();
  document.getElementById("totalPopulation").textContent =
    stats.totalPopulation.toLocaleString();
  document.getElementById("foreignRatio").textContent = stats.foreignRatio + "%";
  document.getElementById("nationalityCount").textContent =
    stats.nationalityCount.toLocaleString();
}

// グラフの描画
function drawCharts(data, stats) {
  drawNationalityChart(data);
  drawAgeGroupChart(data);
  drawDistrictChart(data);
}

// 国籍別構成比グラフ
function drawNationalityChart(data) {
  let nationalityData = [];

  if (data.by_nationality) {
    nationalityData = Object.entries(data.by_nationality)
      .map(([nationality, count]) => ({
        nationality: nationality,
        count: count || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  console.log("drawNationalityChart - nationalityData:", nationalityData);
  
  const ctx = document.getElementById("nationalityChart");
  console.log("drawNationalityChart - ctx element:", ctx);

  if (charts.nationality) {
    charts.nationality.destroy();
  }

  const colors = [
    "rgba(255, 99, 132, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 206, 86, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
    "rgba(99, 99, 255, 0.8)",
    "rgba(255, 99, 255, 0.8)",
    "rgba(99, 255, 132, 0.8)",
    "rgba(255, 159, 132, 0.8)",
  ];

  charts.nationality = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: nationalityData.map((d) => d.nationality),
      datasets: [
        {
          data: nationalityData.map((d) => d.count),
          backgroundColor: colors.slice(0, nationalityData.length),
          borderColor: colors.slice(0, nationalityData.length).map((c) => c.replace("0.8", "1")),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = ((context.parsed / total) * 100).toFixed(1);
              return (
                context.label + ": " + context.parsed.toLocaleString() + " (" + percentage + "%)"
              );
            },
          },
        },
      },
    },
  });
}

// 年代別外国人人口グラフ
function drawAgeGroupChart(data) {
  let ageGroupData = [];

  if (data.by_age_group) {
    ageGroupData = Object.entries(data.by_age_group)
      .map(([ageGroup, count]) => ({
        ageGroup: ageGroup,
        count: count || 0,
      }))
      .sort((a, b) => {
        // 年代順にソート
        const ageOrder = {
          "0-9": 0,
          "10-19": 1,
          "20-29": 2,
          "30-39": 3,
          "40-49": 4,
          "50-59": 5,
          "60-69": 6,
          "70-79": 7,
          "80+": 8,
        };
        return (ageOrder[a.ageGroup] || 999) - (ageOrder[b.ageGroup] || 999);
      });
  }

  const ctx = document.getElementById("ageGroupChart");

  if (charts.ageGroup) {
    charts.ageGroup.destroy();
  }

  charts.ageGroup = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ageGroupData.map((d) => d.ageGroup),
      datasets: [
        {
          label: "外国人人口",
          data: ageGroupData.map((d) => d.count),
          backgroundColor: "rgba(76, 175, 80, 0.8)",
          borderColor: "rgba(76, 175, 80, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value.toLocaleString();
            },
          },
        },
      },
    },
  });
}

// 地域別外国人人口グラフ
function drawDistrictChart(data) {
  let districtData = [];

  if (data.by_district) {
    districtData = Object.entries(data.by_district)
      .map(([district, count]) => ({
        district: district,
        count: count || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  const ctx = document.getElementById("districtChart");

  if (charts.district) {
    charts.district.destroy();
  }

  charts.district = new Chart(ctx, {
    type: "bar",
    data: {
      labels: districtData.map((d) => d.district),
      datasets: [
        {
          label: "外国人人口",
          data: districtData.map((d) => d.count),
          backgroundColor: "rgba(255, 159, 64, 0.8)",
          borderColor: "rgba(255, 159, 64, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value.toLocaleString();
            },
          },
        },
      },
    },
  });
}

// テーブルの更新
function updateTable(data) {
  const tbody = document.getElementById("tableBody");
  tbody.innerHTML = "";

  // 国籍別の詳細データを表示
  if (data.by_nationality) {
    Object.entries(data.by_nationality).forEach(([nationality, count]) => {
      const row = tbody.insertRow();
      row.insertCell(0).textContent = "国籍別";
      row.insertCell(1).textContent = nationality;
      row.insertCell(2).textContent = count.toLocaleString();
    });
  }

  // 地域別の詳細データを表示
  if (data.by_district) {
    Object.entries(data.by_district).forEach(([district, count]) => {
      const row = tbody.insertRow();
      row.insertCell(0).textContent = "地域別";
      row.insertCell(1).textContent = district;
      row.insertCell(2).textContent = count.toLocaleString();
    });
  }

  // 年代別の詳細データを表示
  if (data.by_age_group) {
    Object.entries(data.by_age_group).forEach(([ageGroup, count]) => {
      const row = tbody.insertRow();
      row.insertCell(0).textContent = "年代別";
      row.insertCell(1).textContent = ageGroup;
      row.insertCell(2).textContent = count.toLocaleString();
    });
  }
}

// ページ読み込み時の初期化
document.addEventListener("DOMContentLoaded", function () {
  // Enterキーでデータ取得
  document
    .getElementById("apiToken")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        fetchData();
      }
    });

  document
    .getElementById("yearMonth")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        fetchData();
      }
    });
});

// テストデータで表示する関数
function testWithSampleData() {
  const testData = {
    summary: {
      total_foreign_population: 3312,
      total_population: 230000,
    },
    by_nationality: {
      "フィリピン": 957,
      "ベトナム": 787,
      "ブラジル": 436,
      "中国": 396,
      "韓国・朝鮮": 299,
      "インドネシア": 182,
      "ペルー": 41,
      "米国": 38,
      "その他": 176,
    },
    by_age_group: {
      "10-19": 150,
      "20-29": 500,
      "30-39": 600,
      "40-49": 450,
      "50-59": 350,
      "60-69": 200,
      "70+": 62,
    },
    by_district: {
      "中央地域": 800,
      "北地域": 700,
      "西地域": 600,
      "南地域": 550,
      "東地域": 450,
      "郊外地域": 280,
    },
  };

  console.log("Testing with sample data:", testData);
  processAndDisplayData(testData);
  showDashboard();
}
