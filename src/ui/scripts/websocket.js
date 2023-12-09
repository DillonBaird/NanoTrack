let ws = new WebSocket('ws://localhost:3000');

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
    fetchChartData();
};
