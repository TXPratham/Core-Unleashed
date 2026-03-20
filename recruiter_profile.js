import { auth, db } from './firebase_setup.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

const profileForm = document.getElementById('recruiterProfileForm');
const saveBtn = document.getElementById('saveBtn');
const statusMsg = document.getElementById('statusMsg');
const avatarLarge = document.getElementById('profileAvatarLarge');
const recruiterAvatarNav = document.getElementById('recruiterAvatar');
const displayName = document.getElementById('displayRecruiterName');
const displayCompany = document.getElementById('displayCompanyName');

let currentUser = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        loadProfileData(user.uid);
    } else {
        window.location.href = 'index.html';
    }
});

if (recruiterAvatarNav) {
    recruiterAvatarNav.onclick = () => {
        window.location.href = 'recruiter_profile.html';
    };
}

async function loadProfileData(uid) {
    try {
        // 1. Fetch data from 'users' collection (base data)
        const userDoc = await getDoc(doc(db, 'users', uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById('fullname').value = userData.fullname || '';
            document.getElementById('email').value = userData.email || '';
            document.getElementById('phone').value = userData.phone || '';
            document.getElementById('company_name').value = userData.company_name || '';

            if (userData.fullname && recruiterAvatarNav) {
                const initials = userData.fullname.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
                recruiterAvatarNav.textContent = initials;
                recruiterAvatarNav.title = `${userData.fullname} (${userData.company_name || 'Recruiter'})`;
            }
            updateDisplayHeader(userData.fullname, userData.company_name);
        }

        // 2. Fetch specific data from 'recruiters' collection
        const recruiterDoc = await getDoc(doc(db, 'recruiters', uid));
        if (recruiterDoc.exists()) {
            const recData = recruiterDoc.data();
            document.getElementById('companyWebsite').value = recData.companyWebsite || '';
            document.getElementById('industry').value = recData.industry || '';
            document.getElementById('designation').value = recData.designation || '';
            document.getElementById('companySize').value = recData.companySize || '';
            document.getElementById('linkedin').value = recData.linkedin || '';
        }
    } catch (error) {
        console.error("Error loading profile:", error);
        showStatus("Error loading profile data.", "error");
    }
}

function updateDisplayHeader(name, company) {
    if (name) {
        if (avatarLarge) avatarLarge.textContent = name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().substring(0, 2);
        if (displayName) displayName.textContent = name;
    }
    if (company && displayCompany) {
        displayCompany.textContent = company;
    }
}

function showStatus(msg, type) {
    if (!statusMsg) return;
    statusMsg.textContent = msg;
    statusMsg.className = `status-msg ${type}`;
    statusMsg.style.display = 'block';
    setTimeout(() => {
        statusMsg.style.display = 'none';
    }, 6000);
}

if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentUser) return;

        saveBtn.textContent = 'Saving...';
        saveBtn.disabled = true;

        const baseData = {
            fullname: document.getElementById('fullname').value,
            phone: document.getElementById('phone').value,
            company_name: document.getElementById('company_name').value,
        };

        const recData = {
            uid: currentUser.uid,
            companyWebsite: document.getElementById('companyWebsite').value,
            industry: document.getElementById('industry').value,
            designation: document.getElementById('designation').value,
            companySize: document.getElementById('companySize').value,
            linkedin: document.getElementById('linkedin').value,
            updatedAt: new Date()
        };

        try {
            // Update 'users' collection
            await setDoc(doc(db, 'users', currentUser.uid), baseData, { merge: true });

            // Update 'recruiters' collection
            await setDoc(doc(db, 'recruiters', currentUser.uid), recData);

            updateDisplayHeader(baseData.fullname, baseData.company_name);
            showStatus("Profile updated successfully!", "success");
        } catch (error) {
            console.error("Error saving profile:", error);
            showStatus("Failed to update profile.", "error");
        } finally {
            saveBtn.textContent = 'Save Changes';
            saveBtn.disabled = false;
        }
    });
}
