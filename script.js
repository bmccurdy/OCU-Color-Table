let colorData = [];
let sortColumn = 'selector';
let sortDirection = 'asc';

// Fetch the CSV data
fetch('ocu_color_data.csv')
    .then(response => response.text())
    .then(data => {
        colorData = parseCSV(data);
        renderTable();
        lucide.createIcons();  // Initialize Lucide icons
    });

function parseCSV(csv) {
    const lines = csv.split('\n');
    return lines.slice(1).map(line => {
        const parts = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
        const [selector, color, darkmode, stylesheet, lineNum] = parts.map(part => part.replace(/^"|"$/g, '').trim());
        return { 
            selector: selector || '',
            color: color || '',
            darkmode: darkmode || '',
            stylesheet: stylesheet || '',
            line: isNaN(parseInt(lineNum)) ? '' : parseInt(lineNum)
        };
    }).filter(item => item.selector || item.color || item.darkmode || item.stylesheet || item.line);
}

function renderTable() {
    const tableBody = document.querySelector('#colorTable tbody');
    const filteredData = filterData();
    const sortedData = sortData(filteredData);

    tableBody.innerHTML = '';
    sortedData.forEach((row, index) => {
        const tr = document.createElement('tr');
        tr.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
        tr.innerHTML = `
            <td class="p-3 w-5/12 truncate-cell text-gray-800" title="${escapeHtml(row.selector)}">${escapeHtml(row.selector)}</td>
            <td class="p-3 w-2/12 truncate-cell color-cell" title="${escapeHtml(row.color)}" style="background-color: ${escapeHtml(row.color)};">
                <span class="centered-text" style="color: ${getContrastColor(row.color)};">${escapeHtml(row.color)}</span>
            </td>
            <td class="p-3 w-2/12 truncate-cell color-cell" title="${escapeHtml(row.darkmode)}" style="background-color: ${escapeHtml(row.darkmode)};">
                <span class="centered-text" style="color: ${getContrastColor(row.darkmode)};">${escapeHtml(row.darkmode)}</span>
            </td>
            <td class="p-3 w-2/12 truncate-cell text-gray-800 hidden lg:table-cell" title="${escapeHtml(row.stylesheet)}">${escapeHtml(row.stylesheet)}</td>
            <td class="p-3 w-1/12 truncate-cell text-gray-800 hidden lg:table-cell" title="${escapeHtml(row.line.toString())}">${escapeHtml(row.line.toString())}</td>
        `;
        tableBody.appendChild(tr);
    });

    updateSortIndicators();
    adjustTableHeight();
    toggleClearButton();
}

function getContrastColor(hexColor) {
    // If the color is invalid, return black
    if (!hexColor || hexColor.charAt(0) !== '#') return '#000000';

    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black for light colors, white for dark colors
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

function filterData() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    return colorData.filter(row => 
        Object.values(row).some(value => 
            value.toString().toLowerCase().includes(searchTerm)
        )
    );
}

function sortData(data) {
    return data.sort((a, b) => {
        let valA = a[sortColumn];
        let valB = b[sortColumn];
        
        if (sortColumn === 'line') {
            valA = isNaN(valA) ? -Infinity : valA;
            valB = isNaN(valB) ? -Infinity : valB;
        } else {
            valA = valA.toString().toLowerCase();
            valB = valB.toString().toLowerCase();
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
}

function updateSortIndicators() {
    document.querySelectorAll('th[data-sort]').forEach(th => {
        const indicator = th.querySelector('.sort-indicator');
        if (th.dataset.sort === sortColumn) {
            indicator.setAttribute('data-lucide', sortDirection === 'asc' ? 'chevron-up' : 'chevron-down');
        } else {
            indicator.setAttribute('data-lucide', 'chevron-up');
        }
        indicator.classList.toggle('text-black', th.dataset.sort === sortColumn);
    });
    lucide.createIcons();  // Refresh Lucide icons
}

function adjustTableHeight() {
    const container = document.querySelector('.table-container');
    const header = container.querySelector('.p-4.border-b');
    const tableScroll = container.querySelector('.table-scroll');
    
    const containerHeight = container.offsetHeight;
    const headerHeight = header.offsetHeight;
    
    const tableScrollHeight = containerHeight - headerHeight;
    tableScroll.style.height = `${tableScrollHeight}px`;
}

function toggleClearButton() {
    const searchInput = document.getElementById('searchInput');
    const clearButton = document.getElementById('clearSearch');
    clearButton.style.display = searchInput.value ? 'block' : 'none';
}

function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    renderTable();
}

// Event Listeners
document.getElementById('searchInput').addEventListener('input', () => {
    renderTable();
    toggleClearButton();
});

document.getElementById('clearSearch').addEventListener('click', clearSearch);

document.querySelectorAll('th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
        const column = th.dataset.sort;
        if (sortColumn === column) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            sortColumn = column;
            sortDirection = 'asc';
        }
        renderTable();
    });
});

// Adjust table height on window resize
window.addEventListener('resize', adjustTableHeight);

// Initial render
renderTable();