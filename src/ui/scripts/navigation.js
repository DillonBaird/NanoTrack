function createNavbar() {
    const currentPath = window.location.pathname;

    const navbar = `
        <div class="custom-bg py-0">
            <div class="container mx-auto text-center text-white">
                <div class="flex justify-between items-center">
                    <a href="/dashboard"><img src="logo.png" alt="NanoTrack Logo" class="max-h-8 ml-4"></a>
                    <nav class="flex-grow text-base">
                        <a href="/dashboard" class="mx-2 p-2 ${currentPath === '/dashboard' ? 'border-b-2 border-white' : 'hover:border-b-2 hover:border-white'}">Dashboard</a>
                        <a href="/campaigns" class="mx-2 p-2 ${currentPath === '/campaigns' ? 'border-b-2 border-white' : 'hover:border-b-2 hover:border-white'}">Campaigns</a>`+
                        // <a href="/reports" class="mx-2 p-2 ${currentPath === '/reports' ? 'border-b-2 border-white' : 'hover:border-b-2 hover:border-white'}">Reports</a>
                        // <a href="/export" class="mx-2 p-2 ${currentPath === '/export' ? 'border-b-2 border-white' : 'hover:border-b-2 hover:border-white'}">Export</a>
                        // <a href="/settings" class="mx-2 p-2 ${currentPath === '/settings' ? 'border-b-2 border-white' : 'hover:border-b-2 hover:border-white'}">Settings</a>
                    `</nav>
                    <form action="/logout" method="post" class="mr-4">
                        <button type="submit" class="bg-transparent hover:bg-blue-500 text-white font-semibold hover:text-white py-2 px-4 border border-white hover:border-transparent rounded">Logout</button>
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
            <div class="container mx-auto text-center text-white text-sm">
                <div>
                    <a href="https://github.com/DillonBaird/NanoTrack" target="_blank" class="text-white font-bold">NanoTrack</a> - Made with ❤️ from <a href="https://DillonBaird.io" target="_blank" class="text-white font-bold">Dillon Baird</a>
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
