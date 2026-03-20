const tabs = document.querySelectorAll('.tab');
const sections = {
    'Pending': document.getElementById('pending-section'),
    'Accepted': document.getElementById('accepted-section'),
    'Declined': document.getElementById('declined-section')
};

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Hide all sections
        Object.values(sections).forEach(s => {
            if (s) s.style.display = 'none';
        });

        // Show target section
        const tabText = tab.innerText.split(' ')[0];
        if (sections[tabText]) {
            sections[tabText].style.display = 'grid';
        }
    });
});

function handleAction(btnElement, actionType) {
    const card = btnElement.closest('.invite-card');
    if (!card) return;

    const targetContainer = document.getElementById(`${actionType.toLowerCase()}-invites-container`);
    if (!targetContainer) return;

    // Visual fade out
    card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
    card.style.opacity = "0";
    card.style.transform = "scale(0.95)";

    setTimeout(() => {
        // Remove actions div
        const actions = card.querySelector('.invite-actions');
        if (actions) actions.remove();

        // Add status text or badge
        const statusInfo = document.createElement('div');
        statusInfo.style.fontWeight = '700';
        statusInfo.style.color = actionType === 'Accepted' ? '#10b981' : '#ef4444';
        statusInfo.innerText = actionType;
        card.appendChild(statusInfo);

        // Update meta info (Optional: add timestamp)
        const meta = card.querySelector('.invite-meta');
        if (meta) {
            meta.innerHTML = `<span>${actionType} on: ${new Date().toLocaleDateString()}</span>`;
        }

        // Move card
        targetContainer.appendChild(card);
        card.style.opacity = "1";
        card.style.transform = "scale(1)";

        // Update Badges
        updateBadges();

        // Show empty states if needed
        checkEmptyStates();

        alert(`Invitation ${actionType.toLowerCase()} successfully!`);
    }, 300);
}

function updateBadges() {
    const pendingContainer = document.getElementById('pending-invites-container');
    if (!pendingContainer) return;

    const pendingCount = pendingContainer.children.length;
    const pendingTabBadge = document.querySelector('.tab:nth-child(1) .badge');
    const navbarBadge = document.querySelector('.nav-item.active .badge');

    if (pendingTabBadge) pendingTabBadge.innerText = pendingCount;
    if (navbarBadge) navbarBadge.innerText = pendingCount;

    // Update "Accepted" tab text
    const acceptedContainer = document.getElementById('accepted-invites-container');
    if (acceptedContainer) {
        const acceptedCount = acceptedContainer.children.length;
        const acceptedTab = document.querySelector('.tab:nth-child(2)');
        if (acceptedTab && acceptedTab.childNodes[0]) {
            acceptedTab.childNodes[0].textContent = `Accepted (${acceptedCount})`;
        }
    }

    // Update "Declined" tab text
    const declinedContainer = document.getElementById('declined-invites-container');
    if (declinedContainer) {
        const declinedCount = declinedContainer.children.length;
        const declinedTab = document.querySelector('.tab:nth-child(3)');
        if (declinedTab && declinedTab.childNodes[0]) {
            declinedTab.childNodes[0].textContent = `Declined (${declinedCount})`;
        }
    }
}

function checkEmptyStates() {
    const sectionsList = ['pending', 'accepted', 'declined'];
    sectionsList.forEach(s => {
        const container = document.getElementById(`${s}-invites-container`);
        const empty = document.getElementById(`${s}-empty`);
        if (container && empty) {
            if (container.children.length === 0) {
                empty.style.display = 'block';
            } else {
                empty.style.display = 'none';
            }
        }
    });
}

// Initialize empty states
checkEmptyStates();

// Expose handleAction to global scope for inline onclicks
window.handleAction = handleAction;
