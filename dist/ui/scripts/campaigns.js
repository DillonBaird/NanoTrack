"use strict";
function renderCampaignTables(data) {
    const campaignsContainer = document.getElementById('campaignsContainer');
    const groupedData = groupDataByCampaignId(data);
    campaignsContainer.innerHTML = ''; // Clear existing content
    if (Object.keys(groupedData).length === 0) {
        // Show UI for creating a new tracking code
        showNoCampaignUI();
    }
    else {
        Object.keys(groupedData).forEach(campaignId => {
            const table = createTableForCampaign(campaignId, groupedData[campaignId]);
            campaignsContainer.appendChild(table);
        });
    }
    if (Object.keys(groupedData).length > 0) {
        const headerContainer = document.querySelector('.header-container'); // Selector for the new header container
        const createButton = document.createElement('button');
        createButton.id = 'createCampaignBtn';
        createButton.textContent = '+ New Campaign';
        createButton.className = 'py-2 px-4 rounded-xl bg-transparent font-medium hover:bg-gray-700 text-gray-800 dark:text-gray-200 hover:text-white border dark:border-gray-200 border-gray-800 hover:border-transparent absolute right-4 rounded cursor-pointer ml-4';
        // Event listener for the button
        createButton.addEventListener('click', () => {
            generateTracking();
        });
        // Append the button to the header container
        headerContainer.appendChild(createButton);
    }
}
function showNoCampaignUI() {
    const campaignsContainer = document.getElementById('campaignsContainer');
    // Message for no campaigns
    const noCampaignMessage = document.createElement('p');
    noCampaignMessage.textContent = 'No campaigns found. Create a new tracking code';
    noCampaignMessage.className = 'text-center my-4 pt-[25dvh]';
    // Button for creating a new tracking code
    const createButton = document.createElement('button');
    createButton.textContent = 'Create New Tracking Code';
    createButton.className = 'block mx-auto my-6 py-2 px-4 bg-gray-800 text-white rounded hover:bg-gray-700 cursor-pointer';
    createButton.addEventListener('click', () => {
        generateTracking();
    });
    campaignsContainer.appendChild(noCampaignMessage);
    noCampaignMessage.appendChild(createButton);
}
function createTableForCampaign(campaignId, data) {
    // Create a card container for each campaign
    const cardContainer = document.createElement('div');
    cardContainer.className = 'bg-white dark:bg-gray-900 shadow overflow-hidden sm:rounded-lg my-8 pt-2';
    cardContainer.id = campaignId;
    // Add a card header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'px-4 py-4 sm:px-6 relative';
    cardHeader.innerHTML = `<h3 class="text-2xl leading-6 font-medium text-gray-900 dark:text-white capitalize">🎯 <a class="hover:underline" href="/campaigns/${campaignId}">${campaignId.replaceAll('-', ' ').replaceAll('_', ' ')}</a></h3>`;
    // Create the View Details button
    const viewDetailsButton = document.createElement('button');
    viewDetailsButton.className = 'view-details-btn bg-gray-800 hover:bg-gray-700 absolute top-4 right-14 cursor-pointer'; // Adjust classes for positioning
    viewDetailsButton.textContent = 'View Details';
    viewDetailsButton.addEventListener('click', function () {
        // Logic to view details of the campaign
        console.log("Viewing details of campaign:", campaignId);
        location.replace('/campaigns/' + campaignId);
    });
    // Add the View Details button to the card header
    cardHeader.appendChild(viewDetailsButton);
    // Add more options icon with dropdown
    const moreOptionsIcon = document.createElement('i');
    moreOptionsIcon.className = 'fas fa-ellipsis-v absolute top-6 right-6 cursor-pointer';
    moreOptionsIcon.addEventListener('click', function (event) {
        event.stopPropagation();
        showDropdownMenu(this, campaignId);
    });
    cardHeader.appendChild(moreOptionsIcon);
    cardContainer.appendChild(cardHeader);
    // Calculate stats
    const views = data.length; // Assuming each item in data is a view
    const visitors = new Set(data.map(item => item.geo.ip)).size; // Unique visitor count
    const referrers = new Set(data.map(item => item.referrer)).size;
    const types = new Set(data.map(item => item.path)).size;
    const countries = new Set(data.map(item => item.geo.country)).size;
    const timezones = new Set(data.map(item => item.geo.timezone)).size;
    // Add stats row
    const statsRow = document.createElement('div');
    statsRow.className = 'flex justify-around m-2 mt-3';
    // Add individual stats to the row
    const stats = [
        { value: views, label: 'Views' },
        { value: visitors, label: 'IPs' },
        { value: referrers, label: 'Referrers' },
        { value: types, label: 'Events' },
        { value: countries, label: 'Countries' },
        { value: timezones, label: 'Time Zones' }
    ];
    stats.forEach(stat => {
        const statDiv = document.createElement('div');
        statDiv.className = 'inline-flex flex-col items-center justify-center w-1/6 p-4';
        statDiv.innerHTML = `<span class="text-xl xl:text-3xl font-bold">${stat.value}</span><label class="text-sm xl:text-lg font-medium">${stat.label}</label>`;
        statsRow.appendChild(statDiv);
    });
    cardContainer.appendChild(statsRow);
    //add table tile
    const tableTitle = document.createElement('div');
    tableTitle.className = '';
    tableTitle.innerHTML = `<h4 class="mt-6 font-semibold mb-4 ml-4">5 Most Recent Events <em class="text-xs font-light text-light">(Not Realtime)</em></h4>`;
    cardContainer.appendChild(tableTitle);
    // Create table within the card
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'overflow-x-auto';
    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200 dark:divide-gray-600';
    // Define your column headers based on the structure in populateTable
    const headers = ['Event', 'referrer', 'IP', 'Browser', 'Device', 'OS', 'Country', 'Region', 'City', 'Timezone', 'Language', 'Timestamp'];
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 uppercase text-sm leading-normal'; // Styling for header row
    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.className = 'py-3 px-6 text-left whitespace-nowrap'; // Styling for each header
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    table.appendChild(headerRow);
    // Sort data by decay in descending order and take the first 5 items
    const recentData = data.sort((a, b) => new Date(b.decay) - new Date(a.decay)).slice(0, 5);
    // Populate table rows with sorted and limited data
    recentData.forEach((item, index) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-500'; // Alternate row colors
        row.innerHTML = `
            <td class="px-4 py-2 whitespace-nowrap">${eventFromPath(item.path) || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${item.referrer || 'direct'}</td>
            <td class="px-4 py-2 whitespace-nowrap">${((_a = item.geo) === null || _a === void 0 ? void 0 : _a.ip.replace('::ffff:', '').replace('::1', 'localhost')) || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${getBrowserIcon((_b = item.useragent) === null || _b === void 0 ? void 0 : _b.browser)} ${((_c = item.useragent) === null || _c === void 0 ? void 0 : _c.browser) || ''} ${((_d = item.useragent) === null || _d === void 0 ? void 0 : _d.version) || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${getDeviceIcon((_e = item.useragent) === null || _e === void 0 ? void 0 : _e.device)} ${((_f = item.useragent) === null || _f === void 0 ? void 0 : _f.device) || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${getOSIcon((_g = item.useragent) === null || _g === void 0 ? void 0 : _g.os)} ${((_h = item.useragent) === null || _h === void 0 ? void 0 : _h.os) || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${getCountryFlagIcon(item.geo.country)} ${item.geo.country || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${item.geo.region || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${item.geo.city || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${item.geo.timezone || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${item.language.join(', ') || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${new Date(item.decay).toLocaleString() || ''}</td>
        `;
        table.appendChild(row);
    });
    tableWrapper.appendChild(table);
    cardContainer.appendChild(tableWrapper);
    return cardContainer;
}
function formatParams(params) {
    if (typeof params === 'string') {
        return Object.entries(JSON.parse(params)).map(([key, value]) => `${key}: ${value}`).join(', ');
    }
    else if (params) {
        return Object.entries(params).map(([key, value]) => `${key}: ${value}`).join(', ');
    }
    return '';
}
function showDropdownMenu(iconElement, campaignId) {
    // Close any already open dropdowns
    closeAllDropdowns();
    // Create dropdown menu
    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown-menu';
    dropdown.innerHTML = `
        <ul>
            <li class="dropdown-item" onclick="generateTracking('${campaignId}')">Generate Tracking Image</li>
            <li class="dropdown-item" onclick="deleteCampaign('${campaignId}')">Delete Campaign & Data</li>
        </ul>
    `;
    dropdown.style.position = 'absolute';
    dropdown.style.top = `${iconElement.offsetTop + iconElement.offsetHeight}px`;
    dropdown.style.right = '10px';
    // Append dropdown to the card header (or a suitable parent)
    const parentElement = iconElement.parentElement; // Adjust this if necessary
    parentElement.appendChild(dropdown);
    // Close dropdown when clicking outside
    document.addEventListener('click', closeAllDropdowns);
}
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-menu').forEach(dropdown => {
        dropdown.remove();
    });
}
function deleteCampaign(campaignId) {
    const isConfirmed = confirm("Are you sure? This will delete all existing tracking data for this campaign and cannot be undone.");
    if (isConfirmed) {
        fetch(`track/api/campaign/${campaignId}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
            console.log(data.message);
            const campaignElement = document.getElementById(campaignId);
            if (campaignElement) {
                campaignElement.remove(); // Remove the campaign card from the DOM
                location.reload();
            }
            else {
                console.error('Campaign element not found:', campaignId);
            }
        })
            .catch(error => console.error('Error:', error));
    }
}
function generateTracking(campaignId = '') {
    const modal = document.createElement('div');
    modal.className = 'tracking-modal fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full';
    let modalContentHTML = `
        <div class="modal-content bg-white p-6 mx-auto rounded-lg shadow-lg relative min-w-max top-20">
            <h2 class="text-xl font-semibold mb-4">Generate Tracking URL and Embed Code</h2>
            
            <!-- Campaign ID input -->
            <div class="mb-4">
                <label for="campaignIdInput" class="block text-gray-700 text-sm font-bold mb-2">Campaign ID:</label>
                <input type="text" id="campaignIdInput" name="campaignIdInput" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" value="${campaignId.replace(/\s+/g, '-')}" placeholder="Enter campaign ID"/>
            </div>

            <!-- Tracking Method -->
            <div class="mb-4">
                <label for="trackingMethod" class="block text-gray-700 text-sm font-bold mb-2">Tracking Method:</label>
                <select id="trackingMethod" name="trackingMethod" class="bg-white border border-gray-300 text-gray-700 rounded leading-tight outline-none focus:outline-none focus:bg-white focus:border-blue-500 appearance-none">
                    <option value="image">Image Embed</option>
                    <option value="link">Link</option>
                    <option value="form">Form Submission</option>
                </select>
            </div>

            <!-- Event Type -->
            <div class="mb-4" id="eventTypeContainer"></div>

            <!-- Additional Options -->
            <div class="mb-4" id="additionalOptions"></div>

            <!-- Generated Code -->
            <div class="mt-4">
                <p class="text-sm font-bold mb-2">Generated Code:</p>
                <pre id="generatedCode" class="text-sm bg-gray-100 rounded p-2"></pre>
            </div>

            <button onclick="closeModal()" class="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Close</button>
        </div>
    `;
    modal.innerHTML = modalContentHTML;
    document.body.appendChild(modal);
    const campaignIdInput = document.getElementById('campaignIdInput');
    campaignIdInput.addEventListener('input', () => {
        campaignIdInput.value = campaignIdInput.value.replace(/\s+/g, '-');
        updateTrackingInfo();
    });
    const trackingMethodDropdown = document.getElementById('trackingMethod');
    trackingMethodDropdown.addEventListener('change', () => {
        updateEventTypeOptions();
        updateTrackingInfo();
    });
    updateEventTypeOptions();
    updateTrackingInfo();
}
function updateEventTypeOptions() {
    const trackingMethod = document.getElementById('trackingMethod').value;
    const eventTypeContainer = document.getElementById('eventTypeContainer');
    let eventTypeOptionsHTML = '';
    if (trackingMethod === 'form') {
        eventTypeOptionsHTML = `
            <label for="formAction" class="block text-gray-700 text-sm font-bold mb-2">Form Action:</label>
            <select id="formAction" name="formAction" class="bg-white border border-gray-300 text-gray-700 rounded leading-tight outline-none focus:outline-none focus:bg-white focus:border-blue-500 appearance-none">
                <option value="redirect">Redirect</option>
                <option value="download">File Download</option>
            </select>
        `;
    }
    else if (trackingMethod === 'link') {
        eventTypeOptionsHTML = `<input type="hidden" id="eventType" value="click" />`;
    }
    else { // image embed
        eventTypeOptionsHTML = `
            <label for="eventType" class="block text-gray-700 text-sm font-bold mb-2">Event Type:</label>
            <select id="eventType" name="eventType" class="bg-white border border-gray-300 text-gray-700 rounded leading-tight outline-none focus:outline-none focus:bg-white focus:border-blue-500 appearance-none">
                <option value="pageview">PageView</option>
                <option value="email-open">Email-Open</option>
                <option value="other">Other</option>
            </select>
            <input type="text" id="customEventType" name="customEventType" class="hidden mt-3 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Enter custom event type"/>
        `;
    }
    eventTypeContainer.innerHTML = eventTypeOptionsHTML;
    const eventTypeDropdown = document.getElementById('eventType');
    const formActionDropdown = document.getElementById('formAction');
    if (eventTypeDropdown) {
        eventTypeDropdown.addEventListener('change', () => {
            updateAdditionalOptions();
            updateTrackingInfo();
        });
    }
    if (formActionDropdown) {
        formActionDropdown.addEventListener('change', updateAdditionalOptions);
    }
    updateAdditionalOptions();
}
function updateAdditionalOptions() {
    const trackingMethod = document.getElementById('trackingMethod').value;
    const formAction = document.getElementById('formAction') ? document.getElementById('formAction').value : '';
    const additionalOptionsContainer = document.getElementById('additionalOptions');
    let additionalOptionsHTML = '';
    if (trackingMethod === 'link') {
        additionalOptionsHTML = `
            <label for="redirectUrl" class="block text-gray-700 text-sm font-bold mb-2">Redirect URL:</label>
            <input type="text" id="redirectUrl" name="redirectUrl" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="Enter redirect URL (ex. https://google.com)"/>
        `;
        additionalOptionsContainer.innerHTML = additionalOptionsHTML;
        const redirectUrlInput = document.getElementById('redirectUrl');
        redirectUrlInput.addEventListener('input', updateTrackingInfo);
    }
    else if (trackingMethod === 'form') {
        if (formAction === 'redirect') {
            additionalOptionsHTML = `
                <label for="redirectUrl" class="block text-gray-700 text-sm font-bold mb-2">Redirect URL:</label>
                <input type="text" id="redirectUrl" name="redirectUrl" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="Enter redirect URL (ex. https://google.com)"/>
            `;
        }
        else if (formAction === 'download') {
            additionalOptionsHTML = `
                <label for="fileDownloadPath" class="block text-gray-700 text-sm font-bold mb-2">File Download Path:</label>
                <input type="text" id="fileDownloadPath" name="fileDownloadPath" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="Enter file download path (ex. /downloads/myfile.pdf)"/>
            `;
        }
        additionalOptionsContainer.innerHTML = additionalOptionsHTML;
        const redirectUrlInput = document.getElementById('redirectUrl');
        const fileDownloadPathInput = document.getElementById('fileDownloadPath');
        if (redirectUrlInput) {
            redirectUrlInput.addEventListener('input', updateTrackingInfo);
        }
        if (fileDownloadPathInput) {
            fileDownloadPathInput.addEventListener('input', updateTrackingInfo);
        }
    }
    else {
        additionalOptionsContainer.innerHTML = '';
    }
}
function updateTrackingInfo() {
    const host = window.location.protocol + "//" + window.location.host;
    const campaignId = document.getElementById('campaignIdInput').value;
    const trackingMethod = document.getElementById('trackingMethod').value;
    const eventType = document.getElementById('eventType') ? document.getElementById('eventType').value : '';
    const customEventType = document.getElementById('customEventType') ? document.getElementById('customEventType').value : '';
    const redirectUrl = document.getElementById('redirectUrl') ? document.getElementById('redirectUrl').value : '';
    const fileDownloadPath = document.getElementById('fileDownloadPath') ? document.getElementById('fileDownloadPath').value : '';
    let eventPath = eventType === 'other' && customEventType ? customEventType : eventType;
    let generatedUrl = `${host}/track/${eventPath}.gif?campaignID=${campaignId}`;
    let generatedUrlWithRedirect = `${host}/track/${eventPath}?campaignID=${campaignId}&redirectURL=${encodeURIComponent(redirectUrl)}`;
    let generatedCode = '';
    if (trackingMethod === 'image') {
        generatedCode = `<img src="${generatedUrl}" alt="NanoTrack" />`;
    }
    else if (trackingMethod === 'link') {
        generatedCode = `<a href="${generatedUrlWithRedirect}">Click here</a>`;
    }
    else if (trackingMethod === 'form') {
        generatedCode = `<form action="${host}/track" method="post">
            <input type="hidden" name="campaignID" value="${campaignId}">
            <input type="hidden" name="eventPath" value="${eventPath}">`;
        if (document.getElementById('formAction').value === 'redirect') {
            generatedCode += `<input type="hidden" name="redirectUrl" value="${redirectUrl}">`;
        }
        else if (document.getElementById('formAction').value === 'download') {
            generatedCode += `<input type="hidden" name="fileDownloadPath" value="${fileDownloadPath}">`;
        }
        generatedCode += `
            <!-- Add other form fields here -->
            <button type="submit">Submit</button>
        </form>`;
    }
    document.getElementById('generatedCode').innerHTML = escapeHtml(generatedCode);
}
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
function closeModal() {
    const modal = document.querySelector('.tracking-modal');
    if (modal) {
        modal.remove();
    }
}
document.addEventListener('DOMContentLoaded', function () {
    fetchData().then(() => {
        renderCampaignTables(trackingData);
    }).catch(error => console.error('Error in fetchData:', error));
});
