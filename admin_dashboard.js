import { auth, db } from './firebase_setup.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

// Profile Icon & Navbar Logic
const adminAvatar = document.getElementById('adminAvatar');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                if (data.fullName) {
                    adminAvatar.textContent = data.fullName.charAt(0).toUpperCase();
                    adminAvatar.title = `${data.fullName} (${data.adminTitle || 'Admin'})`;
                }
            }
        } catch (error) {
            console.error("Error fetching admin profile:", error);
        }
    }
});

adminAvatar.onclick = () => {
    window.location.href = 'admin_profile.html';
};

window.downloadReports = function () {
    const csvData = "Report Type,Count,Trend\nTotal Students,1248,+98%\nActive Companies,42,+5\nUpcoming Drives,8,Neutral\nStudents Placed,415,+33%";
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin_platform_reports.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    alert("Reports downloaded successfully!");
}

window.openCreateEventModal = function () {
    const modal = document.getElementById('createEventModal');
    if (modal) modal.classList.add('active');
}

window.closeCreateEventModal = function () {
    const modal = document.getElementById('createEventModal');
    if (modal) {
        modal.classList.remove('active');
        document.getElementById('event-title').value = '';
        document.getElementById('event-type').value = 'drive';
        document.getElementById('event-date').value = '';
        document.getElementById('event-branches').value = '';
    }
}

window.renderEventsTable = function () {
    const tbody = document.getElementById('event-table-body');
    if (!tbody) return;

    const placeholderEvents = [
        { title: 'TechCorp Inc.', branches: 'CSE, IT', type: 'drive', date: 'Ongoing', avatar: 'T', color: '#f97316' },
        { title: 'CloudSys Data', branches: 'CSE, IT, ECE', type: 'drive', date: 'Oct 28', avatar: 'C', color: '#0ea5e9' },
        { title: 'Global Finance', branches: 'All Branches', type: 'drive', date: 'Nov 02', avatar: 'G', color: '#10b981' }
    ];

    const adminEvents = JSON.parse(localStorage.getItem('adminEvents') || '[]');
    const allEvents = [...placeholderEvents, ...adminEvents];

    tbody.innerHTML = '';
    allEvents.forEach(event => {
        const tr = document.createElement('tr');
        const avatarChar = event.avatar || event.title.charAt(0).toUpperCase();
        const avatarBg = event.color || (event.type === 'drive' ? '#2563eb' : (event.type === 'talk' ? '#10b981' : '#f59e0b'));

        // Format relative date if it's a dynamic one
        let displayDate = event.date;
        if (displayDate.includes('T')) {
            const dateObj = new Date(displayDate);
            displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }

        tr.innerHTML = `
            <td>
                <div class="student-info">
                    <div class="student-avatar" style="background:${avatarBg}; color:white;">${avatarChar}</div>
                    <div class="student-details-text">
                        <span class="student-name">${event.title}</span>
                        <span class="student-degree">${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</span>
                    </div>
                </div>
            </td>
            <td>${event.branches}</td>
            <td><span class="status-badge" style="background:var(--bg-main); color:var(--primary);">${event.status || 'Active'}</span></td>
            <td>${displayDate}</td>
            <td>
                <button class="action-btn" title="View Details">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialize table
document.addEventListener('DOMContentLoaded', () => {
    window.renderEventsTable();
});

window.submitEvent = function () {
    const titleObj = document.getElementById('event-title');
    const dateObj = document.getElementById('event-date');
    const typeObj = document.getElementById('event-type');
    const branchObj = document.getElementById('event-branches');

    if (!titleObj || !dateObj) return;

    const title = titleObj.value;
    const dateStr = dateObj.value;
    const typeValue = typeObj ? typeObj.value : 'drive';
    const branches = branchObj ? branchObj.value : 'All Branches';

    if (!title || !dateStr) {
        alert("Please fill in the event title and date.");
        return;
    }

    // Persistence
    const newEvent = {
        id: 'event-' + Date.now(),
        title: title,
        date: dateStr, // ISO string from datetime-local
        type: typeValue,
        branches: branches,
        status: 'Scheduled',
        createdAt: new Date().toISOString()
    };

    const existingEvents = JSON.parse(localStorage.getItem('adminEvents') || '[]');
    existingEvents.push(newEvent);
    localStorage.setItem('adminEvents', JSON.stringify(existingEvents));

    alert(`Event "${title}" has been successfully created!`);
    window.closeCreateEventModal();
    window.renderEventsTable();
}
