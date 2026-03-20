let currentDate = new Date();
let currentView = 'year';

const staticEvents = [
    { date: '2024-10-12', title: 'Amazon PPT', type: 'talk' },
    { date: '2024-10-15', title: 'Google Test', type: 'test' },
    { date: '2024-10-22', title: 'Adobe UX Test', type: 'test' },
    { date: '2026-03-25', title: 'Microsoft Interview', type: 'talk' }
];

function getEvents() {
    try {
        const adminEvents = JSON.parse(localStorage.getItem('adminEvents') || '[]');
        return [...staticEvents, ...adminEvents];
    } catch (e) {
        console.error("Failed to parse events from localStorage", e);
        return staticEvents;
    }
}

function initYearSelector() {
    const ySelect = document.getElementById('yearSelect');
    if (!ySelect) return;
    const currentYear = new Date().getFullYear();
    let yearOptions = '';
    for (let i = currentYear - 2; i <= currentYear + 5; i++) {
        yearOptions += `<option value="${i}">${i}</option>`;
    }
    ySelect.innerHTML = yearOptions;
    ySelect.value = currentDate.getFullYear();
}

function syncDateFromSelector() {
    const ySelect = document.getElementById('yearSelect');
    if (ySelect) {
        currentDate.setFullYear(parseInt(ySelect.value));
        updateContent();
    }
}

function renderYearView() {
    const view = document.getElementById('yearView');
    if (!view) return;
    view.innerHTML = '';
    const year = currentDate.getFullYear();
    const events = getEvents();
    const today = new Date();

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    for (let m = 0; m < 12; m++) {
        const monthDiv = document.createElement('div');
        monthDiv.className = 'mini-month';
        monthDiv.innerHTML = `<div class="mini-month-name">${monthNames[m]}</div>`;
        const grid = document.createElement('div');
        grid.className = 'mini-grid';
        dayNames.forEach(dn => {
            const dnDiv = document.createElement('div');
            dnDiv.className = 'mini-day-name'; dnDiv.textContent = dn;
            grid.appendChild(dnDiv);
        });
        const daysInMonth = new Date(year, m + 1, 0).getDate();
        const firstDay = new Date(year, m, 1).getDay();
        for (let b = 0; b < firstDay; b++) grid.appendChild(document.createElement('div'));
        for (let d = 1; d <= daysInMonth; d++) {
            const day = document.createElement('div');
            day.className = 'mini-day';
            day.textContent = d;
            const dateKey = `${year}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            if (events.some(e => e.date.startsWith(dateKey))) day.classList.add('has-event');
            if (d === today.getDate() && m === today.getMonth() && year === today.getFullYear()) day.classList.add('is-today');
            day.onclick = (e) => {
                e.stopPropagation();
                currentDate = new Date(year, m, d);
                setView('day');
            };
            grid.appendChild(day);
        }
        monthDiv.appendChild(grid);
        view.appendChild(monthDiv);
    }
}

function applyReadStatus() {
    const readNotifs = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    const badge = document.getElementById('notifBadge');
    // In these pages we don't have the full list, but we can estimate the unread count from other pages
    const totalNotifs = 2;
    const readCount = readNotifs.filter(id => id.startsWith('pop-notif-')).length;
    const unreadCount = Math.max(0, totalNotifs - readCount);

    if (badge) {
        badge.style.display = unreadCount === 0 ? 'none' : 'block';
        badge.textContent = unreadCount > 0 ? unreadCount : '';
    }
}

function renderDayView() {
    const list = document.getElementById('dayViewList');
    const title = document.getElementById('dayViewTitle');
    if (!list || !title) return;

    title.textContent = currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    list.innerHTML = '';
    const dateKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`;
    const events = getEvents().filter(e => e.date.startsWith(dateKey));

    if (events.length === 0) {
        list.innerHTML = '<div style="padding: 3rem; text-align: center; color: #94a3b8; font-weight: 600;">No activities for this date.</div>';
        return;
    }
    events.forEach(e => {
        const time = e.date.includes('T') ? new Date(e.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM';
        const card = document.createElement('div');
        card.className = 'event-card-large';
        card.innerHTML = `<div class="event-time-tag">${time}</div><div class="event-details-main"><h3>${e.title}</h3><p>${e.branches || 'All Eligible Branches'}</p></div>`;
        list.appendChild(card);
    });
}

function setView(view) {
    currentView = view;
    const container = document.getElementById('mainContainer');
    if (container) container.className = `calendar-container view-${view}`;

    document.querySelectorAll('.view-btn').forEach(b => b.classList.toggle('active', b.id === 'btn-' + view));
    updateContent();
}

function updateContent() {
    const ySelect = document.getElementById('yearSelect');
    if (ySelect) ySelect.value = currentDate.getFullYear();

    if (currentView === 'year') renderYearView();
    else renderDayView();
}

function navigate(dir) {
    if (currentView === 'year') currentDate.setFullYear(currentDate.getFullYear() + dir);
    else currentDate.setDate(currentDate.getDate() + dir);
    updateContent();
}

function goToday() { currentDate = new Date(); setView('year'); }

// Popup Logic
function togglePopup(id, event) {
    event.stopPropagation();
    const panel = document.getElementById(id);
    const overlay = document.getElementById('popupOverlay');
    if (!panel || !overlay) return;

    const isActive = panel.classList.contains('active');
    closeAllPopups();
    if (!isActive) {
        panel.classList.add('active');
        overlay.classList.add('active');
    }
}

function closeAllPopups() {
    document.querySelectorAll('.popup-panel').forEach(p => p.classList.remove('active'));
    const overlay = document.getElementById('popupOverlay');
    if (overlay) overlay.classList.remove('active');
}

// Global exposure for onclick handlers
window.setView = setView;
window.navigate = navigate;
window.goToday = goToday;
window.togglePopup = togglePopup;
window.closeAllPopups = closeAllPopups;
window.syncDateFromSelector = syncDateFromSelector;

document.addEventListener('click', closeAllPopups);

// Init
document.addEventListener('DOMContentLoaded', () => {
    initYearSelector();
    updateContent();
    applyReadStatus();
});
