import { app, auth, db } from './firebase_setup.js';
import { onAuthStateChanged, getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js';
import { doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

// Secondary App config to prevent Admin from being logged out
const secondaryApp = initializeApp(app.options, 'SecondaryStudentSub');
const secondaryAuth = getAuth(secondaryApp);

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

if (adminAvatar) {
    adminAvatar.onclick = () => {
        window.location.href = 'admin_setup_profile.html';
    };
}

window.openAddModal = function () {
    const modal = document.getElementById('addStudentModal');
    if (modal) {
        modal.classList.add('active');
        const firstInput = document.getElementById('new-usn');
        if (firstInput) firstInput.focus();
    }
};

window.closeAddModal = function () {
    const modal = document.getElementById('addStudentModal');
    if (modal) {
        modal.classList.remove('active');
        // Clear inputs
        ['new-usn', 'new-name', 'new-email', 'new-password', 'new-degree', 'new-branch', 'new-grad'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
    }
};

const addStudentBtn = document.getElementById('add-student-btn');
if (addStudentBtn) {
    addStudentBtn.addEventListener('click', async function () {
        const btn = this;
        const originalText = btn.textContent;

        const usn = document.getElementById('new-usn').value.trim();
        const name = document.getElementById('new-name').value.trim() || 'Unknown Name';
        const email = document.getElementById('new-email').value.trim();
        const branch = document.getElementById('new-branch').value.trim();
        const password = document.getElementById('new-password').value;
        const degree = document.getElementById('new-degree').value.trim();
        const gradYear = document.getElementById('new-grad').value.trim();

        if (!usn || !password || !email) {
            alert('Please enter a USN, Email, and Password at minimum.');
            return;
        }

        btn.textContent = 'Adding...';
        btn.disabled = true;

        try {
            // 1. Create Auth Account using Secondary App
            const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
            const uid = userCredential.user.uid;

            // 2. Write to Firestore using Main App's db connection
            await setDoc(doc(db, 'users', uid), {
                uid: uid,
                usn: usn.toLowerCase(),
                name: name,
                email: email,
                role: 'student',
                branch: branch,
                degree: degree,
                gradYear: gradYear,
                createdAt: serverTimestamp()
            });

            // 3. Optional: sign out of secondary app immediately to clear state
            await secondaryAuth.signOut();

            // 4. Update UI table
            const tbody = document.getElementById('student-table-body');
            if (tbody) {
                const newRow = document.createElement('tr');

                newRow.innerHTML = `
                    <td><strong style="color:var(--text-main);">${usn.toUpperCase()}</strong></td>
                    <td>
                        <div class="student-info">
                            <div class="student-avatar" style="background:#e5e7eb; color:#9ca3af;">${name.charAt(0).toUpperCase()}</div>
                            <div class="student-details-text">
                                <span class="student-name">${name}</span>
                            </div>
                        </div>
                    </td>
                    <td>${branch ? branch.toUpperCase() : 'N/A'}</td>
                    <td><span class="status-badge status-pending">Profile Created</span></td>
                    <td>0 Offers</td>
                    <td>
                        <button class="action-btn" title="Resend Invite">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21.5 2v6h-6M2.13 15.57a9 9 0 0 0 15.93 2.15l3.44-3.52M2.5 22v-6h6M21.87 8.43a9 9 0 0 0-15.93-2.15L2.5 9"></path>
                            </svg>
                        </button>
                    </td>
                `;

                tbody.insertBefore(newRow, tbody.children[0]); // Changed to insert at top or index 0
            }

            alert(`Student ${name} (${usn}) has been added successfully! They can now log in using Email or USN.`);
            window.closeAddModal();
        } catch (error) {
            console.error("Error creating student account:", error);
            alert("Creation failed: " + error.message);
        } finally {
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
}

// Add search functionality - fixed selector to match HTML
const searchInput = document.querySelector('input[placeholder="Search by USN or Name..."]');
if (searchInput) {
    searchInput.addEventListener('input', function (e) {
        const searchTerm = e.target.value.toLowerCase();
        const rows = document.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });
}
