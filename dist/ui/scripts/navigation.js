"use strict";
function createNavbar() {
    const currentPath = window.location.pathname;
    const navbar = `
        <div class="py-0">
            <div class="container mx-auto text-center text-white">
                <div class="flex items-center justify-between">
                    <a href="/dashboard" class="flex-none">
                        <img src="/logo.png" alt="NanoTrack Logo" class="max-h-8 ml-4">
                    </a>
                    <nav class="flex-1 text-center">
                        <a href="/dashboard" class="mx-2 p-2 ${currentPath === '/dashboard' ? 'border-b-2 border-white' : 'hover:border-b-2 hover:border-white'}">Dashboard</a>
                        <a href="/campaigns" class="mx-2 p-2 ${currentPath.includes('/campaigns') ? 'border-b-2 border-white' : 'hover:border-b-2 hover:border-white'}">Campaigns</a>
                        <!--<a href="/reports" class="mx-2 p-2 ${currentPath === '/reports' ? 'border-b-2 border-white' : 'hover:border-b-2 hover:border-white'}">Reports</a>
                        <a href="/export" class="mx-2 p-2 ${currentPath === '/export' ? 'border-b-2 border-white' : 'hover:border-b-2 hover:border-white'}">Export</a>
                        <a href="/settings" class="mx-2 p-2 ${currentPath === '/settings' ? 'border-b-2 border-white' : 'hover:border-b-2 hover:border-white'}">Settings</a>-->
                    </nav>
                    <!-- Spacer element -->
                    <div class="flex-none" style="width: 160px;"></div>
                    <form action="/logout" method="post" class="flex-none mr-4">
                        <button type="submit" class="bg-transparent hover:bg-gray-700 text-white font-semibold hover:text-white py-2 px-4 border border-white rounded-lg">Logout</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.getElementById('header').innerHTML = navbar;
}
function createFooter() {
    const footer = `
        <div class="custom-bg py-0">
            <div class="container mx-auto text-center text-white text-xs">
                <div>
                    <a href="https://github.com/DillonBaird/NanoTrack" target="_blank" class="text-white font-bold">NanoTrack v1.0</a> - Made with ❤️ by <a href="https://DillonBaird.io" target="_blank" class="text-white font-bold">Dillon Baird</a>
                </div>
            </div>
        </div>
    `;
    document.getElementById('footer').innerHTML = footer;
}
document.addEventListener('DOMContentLoaded', () => {
    createNavbar();
    createFooter();
});
//# sourceMappingURL=navigation.js.map