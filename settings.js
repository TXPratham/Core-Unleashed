// Persistence for Notifications
let readNotifs = JSON.parse(localStorage.getItem('readNotifications') || '[]');

function applyReadStatus() {
    const badge = document.getElementById('notifBadge');
    const totalNotifs = 2;
    const readCount = readNotifs.filter(id => id.startsWith('pop-notif-')).length;
    const unreadCount = Math.max(0, totalNotifs - readCount);

    if (badge) {
        badge.style.display = unreadCount === 0 ? 'none' : 'block';
        badge.textContent = unreadCount > 0 ? unreadCount : '';
    }
}

// Initialize
applyReadStatus();

window.togglePopup = function (id, event) {
    event.stopPropagation();
    const panel = document.getElementById(id);
    const overlay = document.getElementById('popupOverlay');
    const isActive = panel.classList.contains('active');
    closeAllPopups();
    if (!isActive) { panel.classList.add('active'); overlay.classList.add('active'); }
}

window.closeAllPopups = function () {
    document.querySelectorAll('.popup-panel').forEach(p => p.classList.remove('active'));
    const overlay = document.getElementById('popupOverlay');
    if (overlay) overlay.classList.remove('active');
}

// Close on click outside
document.addEventListener('click', window.closeAllPopups);
