let myChart, pathChart, campaignChart; // Global chart variables

function updateChart(data) {
    const chartElement = document.getElementById('dataChart');

    if (chartElement) {
        const chartElement = document.getElementById('dataChart');
        if (!chartElement) return;

        const ctx = chartElement.getContext('2d');

        // Process the passed data for the chart
        let ipCounts = data.reduce((acc, item) => {
            const ip = item.geo?.ip?.replace('::ffff:', '').replace('::1', 'localhost') || 'Unknown';
            acc[ip] = (acc[ip] || 0) + 1;
            return acc;
        }, {});

        let labels = Object.keys(ipCounts);
        let values = Object.values(ipCounts);

        // Destroy the old chart if it exists
        if (myChart) {
            myChart.destroy();
        }

        // Create a new chart
        myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,  // Labels are the IPs
                datasets: [{
                    label: 'Number of Events per IP',
                    data: values,  // Values are the counts per IP
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    },
                    x: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'IP Addresses'
                        }
                    }
                }
            }
        });
    }
}






function updatePathChart(data) {
    const chartElement = document.getElementById('pathChart');

    if (chartElement) {
        const ctx = chartElement.getContext('2d');

        // Process data for visits per path per day
        let pathCounts = data.reduce((acc, item) => {
            let path = item.path.replaceAll('.gif', '').replaceAll('/', '') || 'Unknown';
            let itemDate = new Date(item.decay);
            // Standardize the date format to YYYY-MM-DD
            let date = itemDate.toISOString().split('T')[0];
            acc[path] = acc[path] || {};
            acc[path][date] = (acc[path][date] || 0) + 1;
            return acc;
        }, {});

        let pathLabels = Object.keys(pathCounts);

        // Generate an array of unique dates across all paths
        let allDates = [];
        pathLabels.forEach(path => {
            allDates = allDates.concat(Object.keys(pathCounts[path]));
        });
        let uniqueDates = [...new Set(allDates)].sort();

        let datasets = pathLabels.map(path => {
            let counts = uniqueDates.map(date => {
                return { x: date, y: pathCounts[path][date] || 0 };
            });

            return {
                label: path,
                data: counts,
                fill: false,
                borderColor: getRandomColor(),
                tension: 0.1
            };
        });

        // Destroy the old chart if it exists
        if (pathChart) {
            pathChart.destroy();
        }

        // Create a new chart
        pathChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: uniqueDates,
                datasets: datasets
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function updateCampaignChart(data) {
    const chartElement = document.getElementById('campaignChart');

    if (chartElement) {
        const ctx = chartElement.getContext('2d');

        // Aggregate counts per campaign
        let campaignCounts = data.reduce((acc, item) => {
            let campaignID = item.campaignID || 'Unknown';
            acc[campaignID] = (acc[campaignID] || 0) + 1;
            return acc;
        }, {});

        // Extract labels (Campaigns) and values (counts) from the aggregated data
        let labels = Object.keys(campaignCounts);
        let values = Object.values(campaignCounts);

        // Destroy the old chart if it exists
        if (campaignChart) {
            campaignChart.destroy();
        }

        console.log(labels)
        console.log(values)

        // Create a new chart
        campaignChart = new Chart(ctx, {
            type: 'bar', // or 'pie', 'line', etc., depending on your preference
            data: {
                labels: labels,  // Labels are the campaign names
                datasets: [{
                    label: 'Number of Events per Campaign',
                    data: values,  // Values are the counts per campaign
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    },
                    x: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Campaigns'
                        }
                    }
                }
            }
        });
    }
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}