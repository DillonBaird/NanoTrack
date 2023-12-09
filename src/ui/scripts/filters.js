function applyFilter(cell) {
    document.getElementById('searchInput').value = cell.textContent;
    filterData();
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    currentSearchFilter = '';
    currentStartDateFilter = null;
    currentEndDateFilter = null;
    applyFiltersAndRefresh();
}

function sortTable(n) {
    let table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById("trackingData");
    switching = true;
    dir = "asc";
    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
    let sortedData = [];
    for (let i = 1; i < table.rows.length; i++) {
        sortedData.push(trackingData[table.rows[i].rowIndex - 1]);
    }
    // updateChart(sortedData);
    // updatePathChart(sortedData);
}

function filterData() {
    currentSearchFilter = document.getElementById('searchInput').value.toLowerCase();
    applyFiltersAndRefresh();
}

function filterDataByDate() {
    currentStartDateFilter = new Date(document.getElementById('startDate').value);
    currentEndDateFilter = new Date(document.getElementById('endDate').value);
    currentEndDateFilter = new Date(currentEndDateFilter.setDate(currentEndDateFilter.getDate() + 1)); // Include the end date in the filter
    applyFiltersAndRefresh();
}