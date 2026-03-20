import { auth, db } from './firebase_setup.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const profileForm = document.getElementById('adminProfileForm');
const saveBtn = document.getElementById('saveBtn');
const statusMsg = document.getElementById('statusMsg');
const avatarLarge = document.getElementById('profileAvatarLarge');
const displayName = document.getElementById('displayAdminName');
const displayTitle = document.getElementById('displayAdminTitle');

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        loadProfileData(user.uid);
    } else {
        window.location.href = 'index.html';
    }
});

async function loadProfileData(uid) {
    try {
        const adminDoc = await getDoc(doc(db, 'admins', uid));
        if (adminDoc.exists()) {
            const data = adminDoc.data();
            document.getElementById('fullName').value = data.fullName || '';
            document.getElementById('adminTitle').value = data.adminTitle || '';
            document.getElementById('department').value = data.department || '';
            document.getElementById('collegeName').value = data.collegeName || '';
            document.getElementById('officeLocation').value = data.officeLocation || '';
            document.getElementById('contactPhone').value = data.contactPhone || '';

            updateDisplayHeader(data.fullName, data.adminTitle);
        }
    } catch (error) {
        console.error("Error loading profile:", error);
        showStatus("Error loading profile data.", "error");
    }
}

function updateDisplayHeader(name, title) {
    if (name) {
        avatarLarge.textContent = name.charAt(0).toUpperCase();
        displayName.textContent = name;
    }
    if (title) {
        const titleMap = {
            'placement-officer': 'Chief Placement Officer',
            'coordinator': 'Faculty Coordinator',
            'system-admin': 'System Administrator',
            'dept-head': 'Department Head'
        };
        displayTitle.textContent = titleMap[title] || title;
    }
}

function showStatus(msg, type) {
    statusMsg.textContent = msg;
    statusMsg.className = `status-msg ${type}`;
    statusMsg.style.display = 'block';
    setTimeout(() => {
        statusMsg.style.display = 'none';
    }, 5000);
}

if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        const profileData = {
            uid: currentUser.uid,
            fullName: document.getElementById('fullName').value,
            adminTitle: document.getElementById('adminTitle').value,
            department: document.getElementById('department').value,
            collegeName: document.getElementById('collegeName').value,
            officeLocation: document.getElementById('officeLocation').value,
            contactPhone: document.getElementById('contactPhone').value,
            updatedAt: new Date()
        };

        try {
            // Save to 'admins' collection
            await setDoc(doc(db, 'admins', currentUser.uid), profileData);

            // Update 'users' collection with the name for quick access in dashboard
            await setDoc(doc(db, 'users', currentUser.uid), {
                fullName: profileData.fullName,
                adminTitle: profileData.adminTitle
            }, { merge: true });

            updateDisplayHeader(profileData.fullName, profileData.adminTitle);
            showStatus("Profile updated successfully!", "success");
        } catch (error) {
            console.error("Error saving profile:", error);
            showStatus("Failed to update profile.", "error");
        } finally {
            saveBtn.textContent = 'Save Profile';
            saveBtn.disabled = false;
        }
    });
}
