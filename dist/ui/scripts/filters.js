"use strict";
function applyFilter(cell) {
    document.getElementById('searchInput').value = cell.textContent;
    filterData();
}
function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('dateRangeSelector').value = ''; // Reset the select dropdown
    // Hide the custom date range inputs when clearing filters
    document.getElementById('customDateRange').style.display = 'none';
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
            }
            else if (dir == "desc") {
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
        }
        else {
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
    console.log("Filtering by date...");
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;
    // Check if both start and end dates are provided
    if (startDateInput && endDateInput) {
        currentStartDateFilter = new Date(startDateInput);
        currentEndDateFilter = new Date(endDateInput);
        // Check if both dates are valid
        if (!isNaN(currentStartDateFilter.getTime()) && !isNaN(currentEndDateFilter.getTime())) {
            // Adjust the end date to be inclusive
            currentEndDateFilter.setDate(currentEndDateFilter.getDate() + 1);
        }
        else {
            // Reset filters if dates are invalid
            currentStartDateFilter = null;
            currentEndDateFilter = null;
        }
    }
    else {
        // Reset filters if any date is missing
        currentStartDateFilter = null;
        currentEndDateFilter = null;
    }
    console.log("Start Date:", currentStartDateFilter);
    console.log("End Date:", currentEndDateFilter);
    applyFiltersAndRefresh();
}
document.getElementById('dateRangeSelector').addEventListener('change', function () {
    const selectedRange = this.value;
    let startDate, endDate;
    const customDateRangeDiv = document.getElementById('customDateRange');
    if (selectedRange === 'custom') {
        customDateRangeDiv.style.display = 'block';
        return; // Exit the function early for custom range
    }
    else {
        customDateRangeDiv.style.display = 'none';
    }
    const now = new Date();
    switch (selectedRange) {
        case 'last24Hours':
            startDate = new Date(now.getTime() - (24 * 60 * 60 * 1000));
            endDate = now;
            break;
        case 'yesterday':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
            break;
        case 'thisYear':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
            break;
        case 'allTime':
            endDate = new Date();
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 10000);
            break;
        case 'today':
            startDate = endDate = new Date();
            break;
        case 'thisWeek':
            startDate = new Date();
            startDate.setDate(startDate.getDate() - startDate.getDay());
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);
            break;
        case 'last7Days':
            endDate = new Date();
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 6);
            break;
        case 'thisMonth':
            startDate = new Date();
            startDate.setDate(1);
            endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);
            break;
        case 'last30Days':
            endDate = new Date();
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 29);
            break;
        case 'last90Days':
            endDate = new Date();
            startDate = new Date(endDate);
            startDate.setDate(endDate.getDate() - 89);
            break;
        default:
            startDate = endDate = null;
            clearFilters();
    }
    if (startDate && endDate) {
        document.getElementById('startDate').value = startDate.toISOString().split('T')[0] || null;
        document.getElementById('endDate').value = endDate.toISOString().split('T')[0] || null;
        filterDataByDate();
    }
});
document.getElementById('startDate').addEventListener('change', filterDataByDate);
document.getElementById('endDate').addEventListener('change', filterDataByDate);
// Get the input box
let searchInput = document.getElementById('searchInput');
// Init a timeout variable to be used below
let searchTimeout = null;
// Listen for keystroke events
searchInput.addEventListener('keyup', function (e) {
    // Clear the timeout if it has already been set.
    // This will prevent the previous task from executing
    // if it has been less than <MILLISECONDS>
    clearTimeout(searchTimeout);
    // Make a new timeout set to go off in 1000ms (1 second)
    searchTimeout = setTimeout(function () {
        filterData();
    }, 350);
});
