function populateTable(e){if(document.getElementById("trackingData")){const a=document.getElementById("trackingData").getElementsByTagName("tbody")[0];let t="";e.forEach(((e,a)=>{let r="";e.params&&e.params.campaignID&&(r=e.params.campaignID,delete e.params.campaignID,"{}"===JSON.stringify(e.params)&&delete e.params);let s=`<tr class="${a%2==0?"bg-white dark:bg-gray-700":"bg-gray-100 dark:bg-gray-500"}">\n                    <td  class="px-4 py-2  whitespace-nowrap"><a class="underline hover:font-medium" href="/campaigns/${e.campaignID}">${e.campaignID}</a></td>\n                    <td  class="px-4 py-2  whitespace-nowrap cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-900" onclick="applyFilter(this)">${eventFromPath(e.path)||""}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-900" onclick="applyFilter(this)">${e.referrer||"direct"}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap">${e.geo?.ip.replace("::ffff:","").replace("::1","localhost")||""}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap">${getBrowserIcon(e.useragent?.browser)} ${e.useragent?.browser||""} ${e.useragent?.version||""}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap capitalize">${getDeviceIcon(e.useragent?.device)} ${e.useragent?.device||""}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap capitalize">${getOSIcon(e.useragent?.os)} ${e.useragent?.os||""}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap">${getCountryFlagIcon(e.geo.country)} ${e.geo.country||""}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap">${e.geo.region||""}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap">${e.geo.city||""}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap">${e.geo.timezone||""}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap capitalize">${e.language.join(", ")||""}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap">${new Date(e.decay).toLocaleString()||""}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-900" onclick="applyFilter(this)">${"string"==typeof e.params?Object.entries(JSON.parse(e.params)).map((([e,a])=>`${e}: ${a}`)).join(", "):e.params?Object.entries(e.params).map((([e,a])=>`${e}: ${a}`)).join(", "):""}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-900" onclick="applyFilter(this)">${e.acceptHeaders||""}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap">${e.dnt?"‼️":""}</td>\n                    <td  class="px-4 py-2  whitespace-nowrap cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-900" onclick="applyFilter(this)">${e.httpVersion||""}</td>\n                </tr>`;t+=s})),a.innerHTML=t}}function getBrowserIcon(e){let a;switch(e){case"Chrome":a="fa-chrome";break;case"Firefox":a="fa-firefox";break;case"Safari":a="fa-safari";break;case"Edge":a="fa-edge";break;case"Opera":a="fa-opera";break;case"Internet Explorer":a="fa-internet-explorer";break;default:a=""}return`<i class="fab ${a}"></i>`}function getDeviceIcon(e){let a;switch(e){case"desktop":a="fa-desktop";break;case"mobile":a="fa-mobile-alt";break;default:a=""}return`<i class="fas ${a}"></i>`}function getOSIcon(e){let a;switch(e.toLowerCase()){case"windows":a="fa-windows";break;case"macos":case"os x":case"os x el capitan":case"ios":a="fa-apple";break;case"linux":a="fa-linux";break;case"android":a="fa-android";break;default:a="fa-question-circle"}return`<i class="fab ${a}"></i>`}function getCountryFlagIcon(e){return e?"Unknown"===e?'<i class="fas fa-question mx-1"></i>  ':`<span class="fi fi-${e.toLowerCase()}"></span>  `:""}function changePage(e){currentPage+=e,fetchData(currentPage)}document.addEventListener("DOMContentLoaded",(function(){fetchData()}));