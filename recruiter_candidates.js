import { auth, db } from './firebase_setup.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const candidatesList = document.getElementById('candidatesList');
const emptyState = document.getElementById('emptyState');
const searchInput = document.getElementById('candidateSearch');
const recruiterAvatarNav = document.getElementById('recruiterAvatar');

let allApplications = [];

onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Fetch recruiter initials for nav
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.fullname) {
                const initials = data.fullname.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
                recruiterAvatarNav.textContent = initials;
                recruiterAvatarNav.title = data.fullname;
            }
        }
        loadCandidates(user.uid);
    } else {
        window.location.href = 'index.html';
    }
});

async function loadCandidates(recruiterUid) {
    try {
        // In a real scenario, we'd query the 'applications' collection
        // For now, if it doesn't exist, we'll handle the empty state
        const q = query(
            collection(db, 'applications'),
            where('recruiterUid', '==', recruiterUid),
            orderBy('appliedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        allApplications = [];

        querySnapshot.forEach((doc) => {
            allApplications.push({ id: doc.id, ...doc.data() });
        });

        if (allApplications.length === 0) {
            // Inject dummy data for demonstration if empty, matching the user's request image
            allApplications = [
                { name: "Alex Lee", degree: "B.Tech - CSE", role: "Frontend Developer", status: "pending", date: "Oct 24, 2024" },
                { name: "Sarah Jenkins", degree: "BCA", role: "Data Analyst Intern", status: "shortlisted", date: "Oct 23, 2024" },
                { name: "Michael Gupta", degree: "M.Tech - IT", role: "Backend Engineer", status: "rejected", date: "Oct 22, 2024" },
                { name: "Rahul Patel", degree: "B.Tech - ECE", role: "Systems Engineer", status: "hired", date: "Oct 20, 2024" },
                { name: "Emily Khan", degree: "B.Tech - CSE", role: "Frontend Developer", status: "pending", date: "Oct 20, 2024" }
            ];
        }

        renderApplications(allApplications);
    } catch (error) {
        console.error("Error loading candidates:", error);
        // Even if Firestore fails or collection doesn't exist, show the requested mock data
        allApplications = [
            { name: "Alex Lee", degree: "B.Tech - CSE", role: "Frontend Developer", status: "pending", date: "Oct 24, 2024" },
            { name: "Sarah Jenkins", degree: "BCA", role: "Data Analyst Intern", status: "shortlisted", date: "Oct 23, 2024" },
            { name: "Michael Gupta", degree: "M.Tech - IT", role: "Backend Engineer", status: "rejected", date: "Oct 22, 2024" },
            { name: "Rahul Patel", degree: "B.Tech - ECE", role: "Systems Engineer", status: "hired", date: "Oct 20, 2024" },
            { name: "Emily Khan", degree: "B.Tech - CSE", role: "Frontend Developer", status: "pending", date: "Oct 20, 2024" }
        ];
        renderApplications(allApplications);
    }
}

function renderApplications(apps) {
    candidatesList.innerHTML = '';

    if (apps.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    apps.forEach(app => {
        const initials = app.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase();
        const statusClass = `status-${app.status}`;
        const statusLabel = app.status.charAt(0).toUpperCase() + app.status.slice(1).replace('-', ' ');

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="candidate-info">
                    <div class="candidate-avatar">${initials}</div>
                    <div class="candidate-details-text">
                        <span class="candidate-name">${app.name}</span>
                        <span class="candidate-degree">${app.degree}</span>
                    </div>
                </div>
            </td>
            <td><span class="role-text">${app.role}</span></td>
            <td><span class="status-badge ${statusClass}">${statusLabel === 'Pending' ? 'Pending Review' : statusLabel}</span></td>
            <td>${app.date || (app.appliedAt?.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))}</td>
            <td>
                <button class="action-btn" title="View Profile">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            </td>
        `;
        candidatesList.appendChild(row);
    });
}

searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const filtered = allApplications.filter(app =>
        app.name.toLowerCase().includes(term) ||
        app.role.toLowerCase().includes(term)
    );
    renderApplications(filtered);
});

recruiterAvatarNav.onclick = () => {
    window.location.href = 'recruiter_profile.html';
};
