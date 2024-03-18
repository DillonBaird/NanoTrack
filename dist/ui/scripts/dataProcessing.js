"use strict";
let trackingData = [];
let currentSearchFilter = '';
let currentStartDateFilter = null;
let currentEndDateFilter = null;
let currentPage = 1;
function processTrackingDataItem(item) {
    let campaignID = '';
    if (item.params && item.params.campaignID) {
        campaignID = item.params.campaignID;
        delete item.params.campaignID;
        if (JSON.stringify(item.params) === '{}') {
            delete item.params;
        }
    }
    return { ...item, campaignID };
}
function applyFiltersAndRefresh() {
    let filteredData = trackingData;
    // Reapply search filter
    if (currentSearchFilter) {
        filteredData = filteredData.filter(item => {
            return Object.values(item).some(value => value.toString().toLowerCase().includes(currentSearchFilter));
        });
    }
    // Reapply date filters
    if (currentStartDateFilter && currentStartDateFilter != 'Invalid Date') {
        filteredData = filteredData.filter(item => {
            let itemDate = new Date(item.decay);
            return itemDate >= currentStartDateFilter;
        });
    }
    if (currentEndDateFilter && currentEndDateFilter != 'Invalid Date') {
        filteredData = filteredData.filter(item => {
            let itemDate = new Date(item.decay);
            return itemDate < currentEndDateFilter;
        });
    }
    populateTable(filteredData);
    updateChart(filteredData);
    updatePathChart(filteredData);
    updateCampaignChart(filteredData);
}
function fetchData(page = 1, limit = 50000) {
    return fetch(`/track/api/tracking-data?page=${page}&limit=${limit}`)
        .then(response => response.json())
        .then(data => {
        trackingData = data.data;
        populateTable(sortByDate(data.data));
        updateChart(data.data);
        updatePathChart(data.data);
        updateCampaignChart(data.data);
        const currentPageElement = document.getElementById('currentPage');
        if (currentPageElement) {
            currentPageElement.innerText = page;
        }
    })
        .catch(error => console.error('Error:', error));
}
function eventFromPath(str) {
    let firstSlashIndex = str.indexOf('/');
    let dotIndex = str.lastIndexOf('.');
    // If both slash and dot are found
    if (firstSlashIndex !== -1 && dotIndex !== -1) {
        return str.substring(firstSlashIndex + 1, dotIndex);
    }
    // If only slash is found
    if (firstSlashIndex !== -1) {
        return str.substring(firstSlashIndex + 1);
    }
    // If only dot is found
    if (dotIndex !== -1) {
        return str.substring(0, dotIndex);
    }
    // Return the original string if neither a slash nor a dot is found
    return str;
}
function sortByDate(data) {
    return data.sort((a, b) => new Date(b.decay) - new Date(a.decay));
}
function groupDataByCampaignId(data) {
    return data.reduce((acc, item) => {
        const campaignId = item.campaignID || 'Unknown';
        if (!acc[campaignId]) {
            acc[campaignId] = [];
        }
        acc[campaignId].push(item);
        return acc;
    }, {});
}
