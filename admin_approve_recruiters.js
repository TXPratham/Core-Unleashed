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

window.approveRow = function (rowId, companyName) {
    if (confirm(`Are you sure you want to approve the request for ${companyName}?`)) {
        const row = document.getElementById(rowId);
        if (row) row.remove();
        alert(`${companyName} has been approved and granted access.`);
    }
}

window.rejectRow = function (rowId, companyName) {
    if (confirm(`Are you sure you want to reject the request for ${companyName}?`)) {
        const row = document.getElementById(rowId);
        if (row) row.remove();
        alert(`Request for ${companyName} has been rejected.`);
    }
}
