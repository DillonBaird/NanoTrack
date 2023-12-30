function renderCampaignTables(data) {
    const campaignsContainer = document.getElementById('campaignsContainer');
    const groupedData = groupDataByCampaignId(data);

    campaignsContainer.innerHTML = ''; // Clear existing content

    if (Object.keys(groupedData).length === 0) {
        // Show UI for creating a new tracking code
        showNoCampaignUI();
    } else {
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
        generateTracking()
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
    cardHeader.innerHTML = `<h3 class="text-2xl leading-6 font-medium text-gray-900 dark:text-white capitalize">🎯 <a class="hover:underline" href="/campaigns/${campaignId}">${campaignId.replaceAll('-',' ').replaceAll('_',' ')}</a></h3>`;
    
    // Create the View Details button
    const viewDetailsButton = document.createElement('button');
    viewDetailsButton.className = 'view-details-btn bg-gray-800 hover:bg-gray-700 absolute top-4 right-14 cursor-pointer'; // Adjust classes for positioning
    viewDetailsButton.textContent = 'View Details';
    viewDetailsButton.addEventListener('click', function() {
        // Logic to view details of the campaign
        console.log("Viewing details of campaign:", campaignId);
        location.replace('/campaigns/'+campaignId)
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
    cardContainer.appendChild(tableTitle)

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
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-500'; // Alternate row colors
        row.innerHTML = `
            <td class="px-4 py-2 whitespace-nowrap">${eventFromPath(item.path) || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${item.referrer || 'direct'}</td>
            <td class="px-4 py-2 whitespace-nowrap">${item.geo?.ip.replace('::ffff:', '').replace('::1', 'localhost') || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${getBrowserIcon(item.useragent?.browser)} ${item.useragent?.browser || ''} ${item.useragent?.version || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${getDeviceIcon(item.useragent?.device)} ${item.useragent?.device || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${getOSIcon(item.useragent?.os)} ${item.useragent?.os || ''}</td>
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
    } else if (params) {
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
                    location.reload()
                } else {
                    console.error('Campaign element not found:', campaignId);
                }
            })
            .catch(error => console.error('Error:', error));
    }
}

function generateTracking(campaignId) {
    // Create and show a modal with dropdowns for event type and optional campaign ID input
    const modal = document.createElement('div');
    modal.className = 'tracking-modal fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full'; // Tailwind classes for modal

    let modalContentHTML = `
        <div class="modal-content bg-white p-6 mx-auto rounded-lg shadow-lg relative min-w-max top-20">
            <h2 class="text-xl font-semibold mb-4">Generate Tracking URL and Embed Code</h2>
            <div class="mb-4">
                <label for="eventType" class="block text-gray-700 text-sm font-bold mb-2">Event Type:</label>
                <select id="eventType" name="eventType" class="inline-block w-1/6 bg-white border border-gray-300 text-gray-700 rounded leading-tight outline-none focus:outline-none focus:bg-white focus:border-blue-500 appearance-none">
                    <option value="pageview">PageView</option>
                    <option value="email-open">Email-Open</option>
                    <option value="click">Click</option>
                    <option value="other">Other</option>
                    <!-- Add other event types as needed -->
                </select>
                <input type="text" id="customEventType" name="customEventType" class="hidden mt-3 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" placeholder="Enter custom event type"/>
                <div id="redirectUrlInput" class="mb-4 hidden">
                    <label for="redirectUrl" class="block text-gray-700 text-sm font-bold mb-2">Redirect URL:</label>
                    <input type="text" id="redirectUrl" name="redirectUrl" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="Enter redirect URL (ex. https://google.com)"/>
                </div>
            </div>
    `;

    // Add campaign ID input field if campaignId is not provided
    if (!campaignId) {
        modalContentHTML += `
            <div class="mb-4">
                <label for="campaignIdInput" class="block text-gray-700 text-sm font-bold mb-2">Campaign ID:<div class="block text-caption font-light italic">A Campaign ID can be anything you'd like. It could be a domain you're tracking, or an email marketing campaign, or even a UA-ID to be able to correlate to GA data.</div></label>
                <input type="text" value="my new campaign" id="campaignIdInput" name="campaignIdInput" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" placeholder="Enter campaign name"/>
            </div>
        `;
    } else {
        modalContentHTML += `
            <div class="hidden">
                <label for="campaignId">Campaign ID:</label>
                <select id="campaignId" name="campaignId">
                    <option value="${campaignId}">${campaignId}</option>
                    <!-- Populate with other campaign IDs if needed -->
                </select>
            </div>
        `;
    }

    // Continue with the rest of the modal content
    modalContentHTML += `
        <div class="mt-4">
            <p class="text-sm font-bold mb-2">Generated URL:</p>
            <pre id="generatedUrl" class="text-sm bg-gray-100 rounded p-2"></pre>
        </div>
        <div class="mt-4">
            <p class="text-sm font-bold mb-2">Embed Code:</p>
            <pre id="embedCode" class="text-sm bg-gray-100 rounded p-2"></pre>
        </div>
        <button onclick="closeModal()" class="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Close</button>
        </div>
    `;

    modal.innerHTML = modalContentHTML;
    document.body.appendChild(modal);

    // Add event listeners and initial update
    const eventTypeDropdown = document.getElementById('eventType');
    const customEventTypeInput = document.getElementById('customEventType');
    const campaignIdElement = campaignId ? document.getElementById('campaignId') : document.getElementById('campaignIdInput');

    // Update to show/hide the custom event type input based on selection
    eventTypeDropdown.addEventListener('change', () => {
        if (eventTypeDropdown.value === 'other') {
            customEventTypeInput.classList.remove('hidden');
            document.getElementById('redirectUrlInput').classList.add('hidden');
        } else if (eventTypeDropdown.value === 'click') {
            document.getElementById('redirectUrlInput').classList.remove('hidden');
            customEventTypeInput.classList.add('hidden');
        } else {
            customEventTypeInput.classList.add('hidden');
            document.getElementById('redirectUrlInput').classList.add('hidden');
        }
        updateTrackingInfo();
    });

    customEventTypeInput.addEventListener('input', updateTrackingInfo);
    if (!campaignId) {
        campaignIdElement.addEventListener('input', updateTrackingInfo);
    }

    // Initial update
    updateTrackingInfo();
}


function updateTrackingInfo() {
    const host = window.location.protocol + "//" + window.location.host;
    const eventTypeDropdown = document.getElementById('eventType');
    let eventType = eventTypeDropdown.value;
    
    // Get the campaign ID either from the provided variable or the input field
    let campaignId = document.getElementById('campaignId') ? document.getElementById('campaignId').value : document.getElementById('campaignIdInput').value;

    campaignId = campaignId.replaceAll(' ','-')

    const customEventTypeInput = document.getElementById('customEventType');

    const redirectUrlInput = document.getElementById('redirectUrl');
    let redirectUrl = '';
    if (eventType === 'click') {
        redirectUrl = redirectUrlInput.value;
    }

    if (eventType === 'other' && customEventTypeInput.value) {
        eventType = customEventTypeInput.value.replaceAll(' ','-');
    }

    // Only generate URL if campaignId is available
    if (campaignId) {
        // Generate URL based on selected values
        const baseUrl = host + '/track';
        const generatedUrl = `${baseUrl}/${eventType}.gif?campaignID=${campaignId}`;
        const generatedUrlStyled = `${baseUrl}/<strong>${eventType}</strong>.gif?campaignID=<strong>${campaignId}</strong>`;
        const generatedUrlStyledWithRedirect = `${baseUrl}/<strong>${eventType}</strong>?campaignID=<strong>${campaignId}</strong>&redirectURL=<strong>${redirectUrl}</strong>`
        const generatedImgPath = `<img src="${generatedUrlStyled}" referrerpolicy="no-referrer-when-downgrade" alt="NanoTrack" />`;
        const generatedLinkPath = `<a href="${generatedUrlStyledWithRedirect}">Some Link Text</a>`;

        if (eventType === 'click') {
            document.getElementById('generatedUrl').innerHTML = generatedUrlStyledWithRedirect;
            document.getElementById('embedCode').innerHTML = escapeHtml(generatedLinkPath);
        } else {
            document.getElementById('generatedUrl').innerHTML = generatedUrlStyled;
            document.getElementById('embedCode').innerHTML = escapeHtml(generatedImgPath);
        }
    } else {
        // Clear the displayed URL and embed code if campaignId is not available
        document.getElementById('generatedUrl').textContent = '';
        document.getElementById('embedCode').textContent = '';
    }
}

function escapeHtml(unsafe)
{
    return unsafe
         .replaceAll("<strong>", "((strong))")
         .replaceAll("</strong>", "((/strong))")
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;")
         .replaceAll("((strong))", "<strong>")
         .replaceAll("((/strong))", "</strong>");
 }


function closeModal() {
    // Close and remove the modal
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