let allData = [];
let chartInstance = null;

// Set today's date as default
document.getElementById('newDate').valueAsDate = new Date();

// Load data on start
loadData();

function loadData() {
    fetch("/api/analytics")
        .then(res => res.json())
        .then(data => {
            console.log("Loaded:", data.length, "records");
            allData = data;
            
            const activeBtn = document.querySelector('.filter-buttons button.active');
            const period = activeBtn ? activeBtn.id.replace('btn-', '') : 'all';
            updateDashboard(filterByPeriod(data, period));
        })
        .catch(err => console.error("Error:", err));
}

function addData() {
    const date = document.getElementById('newDate').value;
    const followers = parseInt(document.getElementById('newFollowers').value) || 0;
    const likes = parseInt(document.getElementById('newLikes').value) || 0;
    const comments = parseInt(document.getElementById('newComments').value) || 0;

    if (!date) {
        alert("Please select a date");
        return;
    }

    const data = { date, followers, likes, comments };

    fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
        console.log("Added:", result);
        alert("Data added successfully!");
        
        // Clear inputs
        document.getElementById('newFollowers').value = '';
        document.getElementById('newLikes').value = '';
        document.getElementById('newComments').value = '';
        
        // Reload data immediately
        loadData();
    })
    .catch(err => {
        console.error("Error adding:", err);
        alert("Error adding data");
    });
}

function filterByPeriod(data, period) {
    if (data.length === 0) return [];
    
    const now = new Date();
    let filtered = data;

    if (period === 'weekly') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = data.filter(item => new Date(item.date) >= weekAgo);
    } else if (period === 'monthly') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = data.filter(item => new Date(item.date) >= monthAgo);
    }

    return filtered.length > 0 ? filtered : data;
}

function filterData(period) {
    document.querySelectorAll('.filter-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.getElementById(`btn-${period}`).classList.add('active');

    updateDashboard(filterByPeriod(allData, period));
}

function updateDashboard(data) {
    if (!data || data.length === 0) {
        console.log("No data");
        return;
    }

    const latest = data[data.length - 1];
    const followers = latest.followers || 0;
    const likes = latest.likes || 0;
    const comments = latest.comments || 0;
    const engagement = followers > 0 ? ((likes + comments) / followers * 100).toFixed(2) : 0;

    document.getElementById("followers").innerText = followers.toLocaleString();
    document.getElementById("likes").innerText = likes.toLocaleString();
    document.getElementById("comments").innerText = comments.toLocaleString();
    document.getElementById("engagement").innerText = engagement + "%";

    const labels = data.map(item => {
        const d = new Date(item.date);
        return (d.getMonth() + 1) + '/' + d.getDate();
    });
    
    const followersData = data.map(item => item.followers);
    const likesData = data.map(item => item.likes);
    const commentsData = data.map(item => item.comments);

    if (chartInstance) {
        chartInstance.destroy();
    }

    const ctx = document.getElementById("analyticsChart").getContext("2d");
    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Followers",
                    data: followersData,
                    borderColor: "#4CAF50",
                    backgroundColor: "rgba(76, 175, 80, 0.1)",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: "Likes",
                    data: likesData,
                    borderColor: "#2196F3",
                    backgroundColor: "rgba(33, 150, 243, 0.1)",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: "Comments",
                    data: commentsData,
                    borderColor: "#FF9800",
                    backgroundColor: "rgba(255, 152, 0, 0.1)",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top' } },
            scales: { y: { beginAtZero: true } }
        }
    });
}