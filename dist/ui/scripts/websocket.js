"use strict";
// This will dynamically get the current host and port
let wsHost = window.location.host;
let ws = new WebSocket('ws://' + wsHost);
ws.onopen = function () {
    console.log('WebSocket connection established');
};
ws.onmessage = function (event) {
    if (event.data === 'WebSocket connection established') {
        return;
    }
    let newData = JSON.parse(event.data);
    let processedData = processTrackingDataItem(newData);
    trackingData.unshift(processedData);
    applyFiltersAndRefresh();
};
