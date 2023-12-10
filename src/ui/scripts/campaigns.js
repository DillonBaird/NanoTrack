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
        createButton.className = 'py-2 px-4 bg-blue-500 text-white absolute right-4 rounded hover:bg-blue-700 cursor-pointer ml-4';

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
    noCampaignMessage.textContent = 'No campaigns found. Create a new tracking code:';
    noCampaignMessage.className = 'text-center my-4';

    // Button for creating a new tracking code
    const createButton = document.createElement('button');
    createButton.textContent = 'Create New Tracking Code';
    createButton.className = 'py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 cursor-pointer';
    createButton.addEventListener('click', () => {
        generateTracking()
    });

    campaignsContainer.appendChild(noCampaignMessage);
    campaignsContainer.appendChild(createButton);
}


function createTableForCampaign(campaignId, data) {
    // Create a card container for each campaign
    const cardContainer = document.createElement('div');
    cardContainer.className = 'bg-white shadow overflow-hidden sm:rounded-lg my-4';
    cardContainer.id = campaignId;

    // Add a card header
    const cardHeader = document.createElement('div');
    cardHeader.className = 'px-4 py-4 sm:px-6 border-b border-gray-200 relative';
    cardHeader.innerHTML = `<h3 class="text-lg leading-6 font-medium text-gray-900 capitalize">🎯 <a href="/campaigns/${campaignId}">${campaignId.replaceAll('-',' ').replaceAll('_',' ')}</a></h3><h4 class="mt-4 font-semibold">5 Most Recent Events <em class="text-xs font-light text-light">(Not Realtime)</em></h4>`;
    
    // Create the View Details button
    const viewDetailsButton = document.createElement('button');
    viewDetailsButton.className = 'view-details-btn absolute top-4 right-14 cursor-pointer'; // Adjust classes for positioning
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

    // Create table within the card
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'overflow-x-auto';
    const table = document.createElement('table');
    table.className = 'min-w-full divide-y divide-gray-200';

    // Define your column headers based on the structure in populateTable
    const headers = ['Event', 'Referer', 'IP', 'Browser', 'Device', 'OS', 'Country', 'Region', 'City', 'Timezone', 'Language', 'Timestamp'];
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-gray-200 text-gray-600 uppercase text-sm leading-normal'; // Styling for header row
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
        row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-100'; // Alternate row colors
        row.innerHTML = `
            <td class="px-4 py-2 whitespace-nowrap">${eventFromPath(item.path) || ''}</td>
            <td class="px-4 py-2 whitespace-nowrap">${item.referer || 'direct'}</td>
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
    modal.className = 'tracking-modal'; // Add classes for styling
    let modalContentHTML = `
        <div class="modal-content relative w-1/2">
            <h2 class="mb-4 text-lg font-medium">Generate Tracking URL and Embed Code</h2>
            <label for="eventType">Event Type:</label>
            <select id="eventType" name="eventType">
                <option value="pageview">PageView</option>
                <option value="email-open">Email-Open</option>
                <option value="other">Other</option>
                <!-- Add other event types as needed -->
            </select>
            <!-- Hidden input field for custom event type -->
        <input type="text" id="customEventType" name="customEventType" class="hidden border-2 border-gray-300 rounded py-2 px-4 mb-0 mt-2 w-full" placeholder="Enter custom event type"/>
    `;

    // Add campaign ID input field if campaignId is not provided
    if (!campaignId) {
        modalContentHTML += `
            <label for="campaignIdInput" class="block mt-4">Campaign ID:</label>
            <input type="text" id="campaignIdInput" name="campaignIdInput" class="border-2 border-gray-300 rounded py-2 px-4 mb-4 w-full" placeholder="Enter campaign name"/>
        `;
    } else {
        modalContentHTML += `
            <label for="campaignId" class="hidden">Campaign ID:</label>
            <select id="campaignId" name="campaignId" class="hidden">
                <option value="${campaignId}">${campaignId}</option>
                <!-- Populate with other campaign IDs if needed -->
            </select>
        `;
    }

    // Continue with the rest of the modal content
    modalContentHTML += `
        

        <p class="mt-6 mb-2">Generated Image URL:<br/><span id="generatedUrl"></span></p>
        <p>Embed Code: <pre id="embedCode" class="text-sm"></pre></p>

        <button onclick="closeModal()" class="absolute top-4 right-4">Close</button>
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
            customEventTypeInput.classList.remove('hidden'); // Show the custom input
            customEventTypeInput.value = ''; // Clear previous value
        } else {
            customEventTypeInput.classList.add('hidden'); // Hide the custom input
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

    if (eventType === 'other' && customEventTypeInput.value) {
        eventType = customEventTypeInput.value.replaceAll(' ','-');
    }

    // Only generate URL if campaignId is available
    if (campaignId) {
        // Generate URL based on selected values
        const baseUrl = host + '/track';
        const generatedUrl = `${baseUrl}/${eventType}.gif?campaignID=${campaignId}`;

        document.getElementById('generatedUrl').textContent = generatedUrl;
        document.getElementById('embedCode').textContent = `<img src="${generatedUrl}" alt="NanoTrack" />`;
    } else {
        // Clear the displayed URL and embed code if campaignId is not available
        document.getElementById('generatedUrl').textContent = '';
        document.getElementById('embedCode').textContent = '';
    }
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