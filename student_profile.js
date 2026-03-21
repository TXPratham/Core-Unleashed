import { auth, db } from './firebase_setup.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

// DOM Elements
const displayNameSidebar = document.getElementById('display-name-sidebar');
const displayIdSidebar = document.getElementById('display-id-sidebar');
const displayCompletionText = document.getElementById('display-completion-text');
const displayCompletionFill = document.getElementById('display-completion-fill');

const fullNameInput = document.getElementById('full-name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const dobInput = document.getElementById('dob');
const bioInput = document.getElementById('bio');

const degreeInput = document.getElementById('degree');
const branchInput = document.getElementById('branch');
const gradYearInput = document.getElementById('grad-year');
const cgpaInput = document.getElementById('cgpa');

// Action Buttons
const editBtn = document.getElementById('edit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const saveBtn = document.getElementById('save-btn');
const profileActions = document.getElementById('profile-actions');

let userData = {};

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (userDoc.exists()) {
                userData = userDoc.data();

                if (userData.role !== 'student') {
                    console.warn("User is not a student.");
                }

                populateFields(userData);
                calculateCompletion(userData);

            } else {
                console.error("No user document found in Firestore.");
            }
        } catch (error) {
            console.error("Error fetching student profile:", error);
        }
    } else {
        window.location.href = 'index.html';
    }
});

function populateFields(data) {
    // Update Sidebar
    if (displayNameSidebar) displayNameSidebar.textContent = data.name || 'Student Name';
    if (displayIdSidebar) displayIdSidebar.textContent = `Reg ID: ${data.usn?.toUpperCase() || 'N/A'}`;

    // Update Form Fields
    if (fullNameInput) fullNameInput.value = data.name || '';
    if (emailInput) emailInput.value = data.email || '';
    if (phoneInput) phoneInput.value = data.phone || '';
    if (dobInput) dobInput.value = data.dob || '';
    if (bioInput) bioInput.value = data.bio || '';

    if (degreeInput) degreeInput.value = data.degree || '';
    if (branchInput) branchInput.value = data.branch || '';
    if (gradYearInput) gradYearInput.value = data.gradYear || '';
    if (cgpaInput) cgpaInput.value = data.cgpa || '';
}

function calculateCompletion(data) {
    const fields = ['name', 'email', 'phone', 'dob', 'bio', 'degree', 'branch', 'gradYear', 'cgpa'];
    let filledCount = 0;
    fields.forEach(field => {
        if (data[field] && data[field] !== '') filledCount++;
    });

    const percentage = Math.round((filledCount / fields.length) * 100);

    if (displayCompletionText) displayCompletionText.textContent = `${percentage}%`;
    if (displayCompletionFill) displayCompletionFill.style.width = `${percentage}%`;
}

// Edit Mode Logic
if (editBtn) {
    editBtn.addEventListener('click', () => toggleEditMode(true));
}

if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
        populateFields(userData);
        toggleEditMode(false);
    });
}

if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
        const user = auth.currentUser;
        if (!user) return;

        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        const updatedData = {
            name: fullNameInput.value.trim(),
            phone: phoneInput.value.trim(),
            dob: dobInput.value,
            bio: bioInput.value.trim(),
            degree: degreeInput.value.trim(),
            branch: branchInput.value.trim(),
            gradYear: gradYearInput.value,
            cgpa: cgpaInput.value.trim(),
            updatedAt: new Date()
        };

        try {
            await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });
            userData = { ...userData, ...updatedData };
            populateFields(userData);
            calculateCompletion(userData);
            toggleEditMode(false);
            alert("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("Failed to update profile: " + error.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Changes';
        }
    });
}

function toggleEditMode(isEditing) {
    const inputs = [fullNameInput, phoneInput, dobInput, bioInput, degreeInput, branchInput, gradYearInput, cgpaInput];
    inputs.forEach(input => {
        if (input) input.disabled = !isEditing;
    });

    if (editBtn) editBtn.style.display = isEditing ? 'none' : 'flex';
    if (profileActions) profileActions.style.display = isEditing ? 'flex' : 'none';
}
