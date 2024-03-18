"use strict";
function populateTable(data) {
    const tableElement = document.getElementById('trackingData');
    if (tableElement) {
        const tableBody = document.getElementById('trackingData').getElementsByTagName('tbody')[0];
        let rowsHtml = '';
        data.forEach((item, index) => {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            // Extract campaignID from params
            let campaignID = '';
            if (item.params && item.params.campaignID) {
                campaignID = item.params.campaignID;
                delete item.params.campaignID;
                if (JSON.stringify(item.params) === '{}') {
                    delete item.params;
                }
            }
            const rowClass = index % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-500';
            let row = `<tr class="${rowClass}">
                    <td  class="px-4 py-2  whitespace-nowrap"><a class="underline hover:font-medium" href="/campaigns/${item.campaignID}">${item.campaignID}</a></td>
                    <td  class="px-4 py-2  whitespace-nowrap cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-900" onclick="applyFilter(this)">${eventFromPath(item.path) || ''}</td>
                    <td  class="px-4 py-2  whitespace-nowrap cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-900" onclick="applyFilter(this)">${item.referrer || 'direct'}</td>
                    <td  class="px-4 py-2  whitespace-nowrap">${((_a = item.geo) === null || _a === void 0 ? void 0 : _a.ip.replace('::ffff:', '').replace('::1', 'localhost')) || ''}</td>
                    <td  class="px-4 py-2  whitespace-nowrap">${getBrowserIcon((_b = item.useragent) === null || _b === void 0 ? void 0 : _b.browser)} ${((_c = item.useragent) === null || _c === void 0 ? void 0 : _c.browser) || ''} ${((_d = item.useragent) === null || _d === void 0 ? void 0 : _d.version) || ''}</td>
                    <td  class="px-4 py-2  whitespace-nowrap capitalize">${getDeviceIcon((_e = item.useragent) === null || _e === void 0 ? void 0 : _e.device)} ${((_f = item.useragent) === null || _f === void 0 ? void 0 : _f.device) || ''}</td>
                    <td  class="px-4 py-2  whitespace-nowrap capitalize">${getOSIcon((_g = item.useragent) === null || _g === void 0 ? void 0 : _g.os)} ${((_h = item.useragent) === null || _h === void 0 ? void 0 : _h.os) || ''}</td>
                    <td  class="px-4 py-2  whitespace-nowrap">${getCountryFlagIcon(item.geo.country)} ${item.geo.country || ''}</td>
                    <td  class="px-4 py-2  whitespace-nowrap">${item.geo.region || ''}</td>
                    <td  class="px-4 py-2  whitespace-nowrap">${item.geo.city || ''}</td>
                    <td  class="px-4 py-2  whitespace-nowrap">${item.geo.timezone || ''}</td>
                    <td  class="px-4 py-2  whitespace-nowrap capitalize">${item.language.join(', ') || ''}</td>
                    <td  class="px-4 py-2  whitespace-nowrap">${new Date(item.decay).toLocaleString() || ''}</td>
                    <td  class="px-4 py-2  whitespace-nowrap cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-900" onclick="applyFilter(this)">${typeof item.params === 'string' ? Object.entries(JSON.parse(item.params)).map(([key, value]) => `${key}: ${value}`).join(', ') : item.params ? Object.entries(item.params).map(([key, value]) => `${key}: ${value}`).join(', ') : ''}</td>
                    <td  class="px-4 py-2  whitespace-nowrap cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-900" onclick="applyFilter(this)">${item.acceptHeaders || ''}</td>
                    <td  class="px-4 py-2  whitespace-nowrap">${item.dnt ? '‼️' : ''}</td>
                    <td  class="px-4 py-2  whitespace-nowrap cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-900" onclick="applyFilter(this)">${item.httpVersion || ''}</td>
                </tr>`;
            rowsHtml += row;
        });
        tableBody.innerHTML = rowsHtml; // Update only the table body
    }
}
function getBrowserIcon(browserName) {
    let iconClass;
    switch (browserName) {
        case 'Chrome':
            iconClass = 'fa-chrome';
            break;
        case 'Firefox':
            iconClass = 'fa-firefox';
            break;
        case 'Safari':
            iconClass = 'fa-safari';
            break;
        case 'Edge':
            iconClass = 'fa-edge';
            break;
        case 'Opera':
            iconClass = 'fa-opera';
            break;
        case 'Internet Explorer':
            iconClass = 'fa-internet-explorer';
            break;
        // Add more cases for other browsers if needed
        default:
            iconClass = ''; // Fallback icon class or leave empty
            break;
    }
    return `<i class="fab ${iconClass}"></i>`;
}
function getDeviceIcon(deviceType) {
    let iconClass;
    switch (deviceType) {
        case 'desktop':
            iconClass = 'fa-desktop';
            break;
        case 'mobile':
            iconClass = 'fa-mobile-alt';
            break;
        default:
            iconClass = ''; // Fallback icon class or leave empty
            break;
    }
    return `<i class="fas ${iconClass}"></i>`;
}
function getOSIcon(osName) {
    let iconClass;
    switch (osName.toLowerCase()) {
        case 'windows':
            iconClass = 'fa-windows';
            break;
        case 'macos':
        case 'os x':
        case 'os x el capitan':
        case 'ios':
            iconClass = 'fa-apple';
            break;
        case 'linux':
            iconClass = 'fa-linux';
            break;
        case 'android':
            iconClass = 'fa-android';
            break;
        // Add more cases for other operating systems if needed
        default:
            iconClass = 'fa-question-circle'; // Fallback icon
            break;
    }
    return `<i class="fab ${iconClass}"></i>`;
}
function getCountryFlagIcon(countryCode) {
    if (!countryCode)
        return '';
    if (countryCode === 'Unknown')
        return `<i class="fas fa-question mx-1"></i>  `;
    return `<span class="fi fi-${countryCode.toLowerCase()}"></span>  `;
}
document.addEventListener('DOMContentLoaded', function () {
    fetchData();
});
function changePage(increment) {
    currentPage += increment;
    // Add logic to handle boundaries (e.g., not going below page 1 or above the max page)
    fetchData(currentPage);
}
