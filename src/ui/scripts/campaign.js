document.addEventListener('DOMContentLoaded', function () {
    fetchCampaignData();
});

let countryCounts = {}; // Define countryCounts here
const countryCodeToName = {
    "AF": "Afghanistan",
    "AX": "Åland Islands",
    "AL": "Albania",
    "DZ": "Algeria",
    "AS": "American Samoa",
    "AD": "Andorra",
    "AO": "Angola",
    "AI": "Anguilla",
    "AQ": "Antarctica",
    "AG": "Antigua and Barbuda",
    "AR": "Argentina",
    "AM": "Armenia",
    "AW": "Aruba",
    "AU": "Australia",
    "AT": "Austria",
    "AZ": "Azerbaijan",
    "BS": "Bahamas",
    "BH": "Bahrain",
    "BD": "Bangladesh",
    "BB": "Barbados",
    "BY": "Belarus",
    "BE": "Belgium",
    "BZ": "Belize",
    "BJ": "Benin",
    "BM": "Bermuda",
    "BT": "Bhutan",
    "BO": "Bolivia",
    "BA": "Bosnia and Herzegovina",
    "BW": "Botswana",
    "BV": "Bouvet Island",
    "BR": "Brazil",
    "IO": "British Indian Ocean Territory",
    "BN": "Brunei Darussalam",
    "BG": "Bulgaria",
    "BF": "Burkina Faso",
    "BI": "Burundi",
    "KH": "Cambodia",
    "CM": "Cameroon",
    "CA": "Canada",
    "CV": "Cape Verde",
    "KY": "Cayman Islands",
    "CF": "Central African Republic",
    "TD": "Chad",
    "CL": "Chile",
    "CN": "China",
    "CX": "Christmas Island",
    "CC": "Cocos (Keeling) Islands",
    "CO": "Colombia",
    "KM": "Comoros",
    "CG": "Congo",
    "CD": "Congo, Democratic Republic of the",
    "CK": "Cook Islands",
    "CR": "Costa Rica",
    "CI": "Côte d'Ivoire",
    "HR": "Croatia",
    "CU": "Cuba",
    "CY": "Cyprus",
    "CZ": "Czech Republic",
    "DK": "Denmark",
    "DJ": "Djibouti",
    "DM": "Dominica",
    "DO": "Dominican Republic",
    "EC": "Ecuador",
    "EG": "Egypt",
    "SV": "El Salvador",
    "GQ": "Equatorial Guinea",
    "ER": "Eritrea",
    "EE": "Estonia",
    "ET": "Ethiopia",
    "FK": "Falkland Islands (Malvinas)",
    "FO": "Faroe Islands",
    "FJ": "Fiji",
    "FI": "Finland",
    "FR": "France",
    "GF": "French Guiana",
    "PF": "French Polynesia",
    "TF": "French Southern Territories",
    "GA": "Gabon",
    "GM": "Gambia",
    "GE": "Georgia",
    "DE": "Germany",
    "GH": "Ghana",
    "GI": "Gibraltar",
    "GR": "Greece",
    "GL": "Greenland",
    "GD": "Grenada",
    "GP": "Guadeloupe",
    "GU": "Guam",
    "GT": "Guatemala",
    "GG": "Guernsey",
    "GN": "Guinea",
    "GW": "Guinea-Bissau",
    "GY": "Guyana",
    "HT": "Haiti",
    "HM": "Heard Island and McDonald Islands",
    "VA": "Holy See (Vatican City State)",
    "HN": "Honduras",
    "HK": "Hong Kong",
    "HU": "Hungary",
    "IS": "Iceland",
    "IN": "India",
    "ID": "Indonesia",
    "IR": "Iran",
    "IQ": "Iraq",
    "IE": "Ireland",
    "IM": "Isle of Man",
    "IL": "Israel",
    "IT": "Italy",
    "JM": "Jamaica",
    "JP": "Japan",
    "JE": "Jersey",
    "JO": "Jordan",
    "KZ": "Kazakhstan",
    "KE": "Kenya",
    "KI": "Kiribati",
    "KP": "North Korea",
    "KR": "South Korea",
    "KW": "Kuwait",
    "KG": "Kyrgyzstan",
    "LA": "Lao People's Democratic Republic",
    "LV": "Latvia",
    "LB": "Lebanon",
    "LS": "Lesotho",
    "LR": "Liberia",
    "LY": "Libyan Arab Jamahiriya",
    "LI": "Liechtenstein",
    "LT": "Lithuania",
    "LU": "Luxembourg",
    "MO": "Macao",
    "MK": "Macedonia",
    "MG": "Madagascar",
    "MW": "Malawi",
    "MY": "Malaysia",
    "MV": "Maldives",
    "ML": "Mali",
    "MT": "Malta",
    "MH": "Marshall Islands",
    "MQ": "Martinique",
    "MR": "Mauritania",
    "MU": "Mauritius",
    "YT": "Mayotte",
    "MX": "Mexico",
    "FM": "Micronesia",
    "MD": "Moldova",
    "MC": "Monaco",
    "MN": "Mongolia",
    "ME": "Montenegro",
    "MS": "Montserrat",
    "MA": "Morocco",
    "MZ": "Mozambique",
    "MM": "Myanmar",
    "NA": "Namibia",
    "NR": "Nauru",
    "NP": "Nepal",
    "NL": "Netherlands",
    "AN": "Netherlands Antilles",
    "NC": "New Caledonia",
    "NZ": "New Zealand",
    "NI": "Nicaragua",
    "NE": "Niger",
    "NG": "Nigeria",
    "NU": "Niue",
    "NF": "Norfolk Island",
    "MP": "Northern Mariana Islands",
    "NO": "Norway",
    "OM": "Oman",
    "PK": "Pakistan",
    "PW": "Palau",
    "PS": "West Bank",
    "PA": "Panama",
    "PG": "Papua New Guinea",
    "PY": "Paraguay",
    "PE": "Peru",
    "PH": "Philippines",
    "PN": "Pitcairn",
    "PL": "Poland",
    "PT": "Portugal",
    "PR": "Puerto Rico",
    "QA": "Qatar",
    "RE": "Réunion",
    "RO": "Romania",
    "RU": "Russian Federation",
    "RW": "Rwanda",
    "BL": "Saint Barthélemy",
    "SH": "Saint Helena, Ascension and Tristan da Cunha",
    "KN": "Saint Kitts and Nevis",
    "LC": "Saint Lucia",
    "MF": "Saint Martin (French part)",
    "PM": "Saint Pierre and Miquelon",
    "VC": "Saint Vincent and the Grenadines",
    "WS": "Samoa",
    "SM": "San Marino",
    "ST": "Sao Tome and Principe",
    "SA": "Saudi Arabia",
    "SN": "Senegal",
    "RS": "Serbia",
    "SC": "Seychelles",
    "SL": "Sierra Leone",
    "SG": "Singapore",
    "SK": "Slovakia",
    "SI": "Slovenia",
    "SB": "Solomon Islands",
    "SO": "Somalia",
    "ZA": "South Africa",
    "GS": "South Georgia and the South Sandwich Islands",
    "ES": "Spain",
    "LK": "Sri Lanka",
    "SD": "Sudan",
    "SR": "Suriname",
    "SJ": "Svalbard and Jan Mayen",
    "SZ": "Swaziland",
    "SE": "Sweden",
    "CH": "Switzerland",
    "SY": "Syrian Arab Republic",
    "TW": "Taiwan",
    "TJ": "Tajikistan",
    "TZ": "Tanzania",
    "TH": "Thailand",
    "TL": "Timor-Leste",
    "TG": "Togo",
    "TK": "Tokelau",
    "TO": "Tonga",
    "TT": "Trinidad and Tobago",
    "TN": "Tunisia",
    "TR": "Turkey",
    "TM": "Turkmenistan",
    "TC": "Turks and Caicos Islands",
    "TV": "Tuvalu",
    "UG": "Uganda",
    "UA": "Ukraine",
    "AE": "United Arab Emirates",
    "GB": "United Kingdom",
    "US": "United States of America",
    "UM": "United States Minor Outlying Islands",
    "UY": "Uruguay",
    "UZ": "Uzbekistan",
    "VU": "Vanuatu",
    "VE": "Venezuela",
    "VN": "Viet Nam",
    "VG": "Virgin Islands, British",
    "VI": "Virgin Islands, U.S.",
    "WF": "Wallis and Futuna",
    "EH": "Western Sahara",
    "YE": "Yemen",
    "ZM": "Zambia",
    "ZW": "Zimbabwe"
};

function createCampaignDataTable(data) {
    const headerTable = document.createElement('table');
    const bodyTable = document.createElement('table');
    headerTable.className = bodyTable.className = 'data-table';

    // Add headers to the header table
    const headers = ['Event', 'referrer', 'IP', 'Browser', 'Device', 'OS', 'Country', 'Region', 'City', 'Timezone', 'Language', 'Timestamp']
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });
    headerTable.appendChild(headerRow);


    // Add data rows to the table
    data.reverse().forEach((item, index) => {
        const row = document.createElement('tr');
        row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-100'; // Alternate row colors
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
        bodyTable.appendChild(row);
    });

    // Append bodyTable to the DOM temporarily to calculate column widths
    const tempContainer = document.createElement('div');
    tempContainer.style.visibility = 'hidden';
    tempContainer.appendChild(bodyTable);
    document.body.appendChild(tempContainer);

    // Calculate column widths
    const columnWidths = [];
    const firstRow = bodyTable.querySelector('tr');
    if (firstRow) {
        firstRow.childNodes.forEach(cell => {
            columnWidths.push(cell.offsetWidth);
        });
    }

    // Set column widths on headerTable
    headerTable.querySelector('tr').childNodes.forEach((headerCell, index) => {
        headerCell.style.width = `${columnWidths[index]}px`;
    });

    // Remove the temporary container
    document.body.removeChild(tempContainer);

    return { headerTable, bodyTable };
}


function initMap() {
    const map = L.map('map', {
        center: [45, 0],
        zoom: 1,
        zoomControl: false // Disable zoom controls
    });
    {
        {/*  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);  */}
    }

    getGeoData().then(geoJsonData => {
        L.choropleth(geoJsonData, {
            valueProperty: function (feature) {
                // Ensure that the country name matches the keys in countryCounts
                const countryName = feature.properties.name;
                return countryCounts[countryName] || 0;
            },
            scale: ['#f7fbff', '#deebf7', '#c6dbef', '#9ecae1', '#6baed6', '#4292c6', '#2171b5', '#08519c', '#08306b', '#041845'], // Define your color scale with 10 shades of blue
            steps: 10, // Define the number of color steps
            mode: 'q', // Define the mode (quantile, equidistant, k-means)
            style: {
                color: '#cccccc', // Border color
                weight: .5,
                fillOpacity: 0.6
            },
            onEachFeature: function (feature, layer) {
                layer.bindPopup(feature.properties.name + ': ' + (countryCounts[feature.properties.name] || 0));
            }
        }).addTo(map);

    });
}

function translateCountryCounts(countryCounts, mapping) {
    const translatedCounts = {};
    for (const [code, count] of Object.entries(countryCounts)) {
        const countryName = mapping[code];
        if (countryName) {
            translatedCounts[countryName] = count;
        }
    }
    return translatedCounts;
}



async function getGeoData() {
    try {
        const response = await fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching GeoJSON data:', error);
    }
}

function fetchCampaignData() {
    // Extract campaignId from the URL path
    const pathParts = window.location.pathname.split('/');
    const campaignId = pathParts[pathParts.length - 1];

    const title = document.getElementById('title');
    title.innerHTML = '🎯 ' + campaignId.replaceAll('-', ' ').replaceAll('_', ' ');

    if (campaignId) {
        fetch(`/track/api/campaign/${campaignId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Campaign Data:', data);
                displayCampaignData(data);
            })
            .catch(error => console.error('Error fetching campaign data:', error));
    }
}

function displayCampaignData(data) {
    // Process data for the chart
    const eventData = processDataForChart(data);

    // Generate Chart
    generateChart(eventData);

    // Grouping data and sorting each group by count
    const pathCounts = sortDataByCount(groupData(data, 'path'));
    const referrerCounts = sortDataByCount(groupData(data, 'referrer'));
    const deviceCounts = sortDataByCount(groupData(data, 'useragent.device'));
    const browserCounts = sortDataByCount(groupData(data, 'useragent.browser'));
    const osCounts = sortDataByCount(groupData(data, 'useragent.os'));
    countryCounts = sortDataByCount(groupData(data, 'geo.country'));

    // Convert countryCounts keys from codes to names
    const convertedCountryCounts = {};
    for (const [code, count] of Object.entries(countryCounts)) {
        const countryName = countryCodeToName[code];
        if (countryName) {
            convertedCountryCounts[countryName] = count;
        }
    }
    countryCounts = convertedCountryCounts;

    // Generate and display stats for the campaign
    const campaignStatsContainer = document.getElementById('campaignStatsContainer');
    if (campaignStatsContainer) {
        const campaignStatsRow = generateCampaignStatsRow(data);
        campaignStatsContainer.appendChild(campaignStatsRow);
    } else {
        console.error('Campaign stats container not found in the DOM');
    }

    // Populate containers with sorted data
    populateList('pathList', pathCounts, 'Events', 'Views');
    populateList('referrerList', referrerCounts, 'Referrers', 'Views');
    populateList('browserList', browserCounts, 'Browsers', 'Views', 'browser');
    populateList('deviceList', deviceCounts, 'Devices', 'Views', 'device');
    populateList('osList', osCounts, 'Operating Systems', 'Views', 'os');
    populateList('thirdRowSecondContainer', countryCounts, 'Countries', 'Views', 'country');

    // Additional logic for other rows...

    const { headerTable, bodyTable } = createCampaignDataTable(data);
    document.querySelector('.table-header-container').appendChild(headerTable);
    document.querySelector('.table-body-container').appendChild(bodyTable);

    initMap();
}

function processDataForChart(data) {
    const eventCountsPerHour = {};

    data.forEach(item => {
        // Extracting the hour from the decay timestamp
        const hour = new Date(item.decay).getHours();
        const dateHour = new Date(item.decay);
        dateHour.setMinutes(0);
        dateHour.setSeconds(0);
        dateHour.setMilliseconds(0);

        const hourKey = dateHour.toLocaleString(); // Format to your preference
        if (!eventCountsPerHour[hourKey]) {
            eventCountsPerHour[hourKey] = 0;
        }
        eventCountsPerHour[hourKey]++;
    });

    return eventCountsPerHour;
}

function generateChart(eventData) {
    const ctx = document.getElementById('eventsChart').getContext('2d');
    const hours = Object.keys(eventData);
    const counts = Object.values(eventData);

    new Chart(ctx, {
        type: 'line', // or 'bar' for a bar chart
        data: {
            labels: hours,
            datasets: [{
                label: 'Events per Hour',
                data: counts,
                backgroundColor: 'rgba(33, 41, 54, 0.2)',
                borderColor: 'rgba(33, 41, 54, 1)',
                borderWidth: 1
            }]
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

function generateCampaignStatsRow(data) {
    const views = data.length;
    const visitors = new Set(data.map(item => item.geo.ip)).size;
    const referrers = new Set(data.map(item => item.referrer)).size;
    const types = new Set(data.map(item => item.path)).size;
    const countries = new Set(data.map(item => item.geo.country)).size;
    const timezones = new Set(data.map(item => item.geo.timezone)).size;

    const statsRow = document.createElement('div');
    statsRow.className = 'flex justify-around m-2 mt-3';

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

    return statsRow;
}

function sortDataByCount(dataCounts) {
    // Convert the object to an array of [key, value] pairs
    const entries = Object.entries(dataCounts);

    // Sort the array based on the count (value) in descending order
    entries.sort((a, b) => b[1] - a[1]);

    // Convert the sorted array back to an object
    return entries.reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
    }, {});
}

function groupData(data, key) {
    const counts = {};
    data.forEach(item => {
        let value = item[key];

        if (key.includes('.')) {
            // Handle nested properties
            const keys = key.split('.');
            value = item[keys[0]] ? item[keys[0]][keys[1]] : null;
        } else {
            value = item[key];
        }

        // Combine 'osx' and 'OS X El Capitan' into one group
        if (key === 'useragent.os') {
            if (value.toLowerCase() === 'osx' || value.toLowerCase() === 'os x el capitan') {
                value = 'OS X';
            }
        }

        // If the referrer is null/undefined, set it to 'direct'
        if (key === 'referrer' && !value) {
            value = 'direct';
        }

        if (key === 'path') {
            value = value.replaceAll('.gif', '').replaceAll('/', '');
        }

        value = value || 'Unknown'; // Fallback for other null/undefined values
        counts[value] = (counts[value] || 0) + 1;
    });
    return counts;
}


function populateList(containerId, counts, header1, header2, dataType) {
    const container = document.getElementById(containerId);

    // Calculate total count
    const totalCount = Object.values(counts).reduce((acc, count) => acc + count, 0);

    let tableContent = `<table class="data-table"><thead><tr><th>${header1}</th><th>${header2}</th></tr></thead><tbody>`;

    for (const [key, value] of Object.entries(counts)) {
        const percentage = Math.floor(((value / totalCount) * 100).toFixed(2)); // Calculate percentage
        let iconHtml = '';

        // Get the appropriate icon based on the dataType
        switch (dataType) {
            case 'browser':
                iconHtml = getBrowserIcon(key);
                break;
            case 'device':
                iconHtml = getDeviceIcon(key);
                break;
            case 'os':
                iconHtml = getOSIcon(key);
                break;
            case 'country':
                iconHtml = getCountryFlagIcon(key);
                break;
            default:
                break;
        }

        // Combine the icon and the key for the table cell
        const displayKey = `${iconHtml} ${key}`;

        // Set gradient background with a softer edge
        let gradientStart, gradientEnd;

        if (percentage < 100) {
            // Apply a softer edge for percentages less than 100
            gradientStart = Math.max(0, percentage);
            gradientEnd = Math.min(100, parseFloat(percentage) + 10);
        } else {
            // For 100%, fill the entire cell
            gradientStart = 100;
            gradientEnd = 100;
        }

        const gradientStyle = `background: linear-gradient(to right, rgba(107, 116, 142, .2) ${gradientStart}%, #fff ${gradientEnd}%, #fff 100%);`;


        tableContent += `<tr><td class="capitalize">${displayKey}</td><td style="${gradientStyle}"><strong>${value}</strong> | ${percentage}%</td></tr>`;
    }

    tableContent += '</tbody></table>';
    container.innerHTML = tableContent;
}