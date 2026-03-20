import { auth, db } from './firebase_setup.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

// Profile Icon Logic
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

window.verifyRow = function (rowId) {
    if (confirm("Are you sure you want to verify this student profile?")) {
        const row = document.getElementById(rowId);
        if (row) {
            row.remove();
            alert("Student profile verified successfully.");
        }
    }
}

window.rejectRow = function (rowId) {
    if (confirm("Are you sure you want to reject this student profile?")) {
        const row = document.getElementById(rowId);
        if (row) {
            row.remove();
            alert("Student profile request rejected.");
        }
    }
}

// Add search functionality for pending verifications
const searchInput = document.querySelector('input[placeholder="Search by name or USN..."]');
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
