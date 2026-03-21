import { auth, db } from './firebase_setup.js';
import { onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js';

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

onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));

            if (userDoc.exists()) {
                const data = userDoc.data();

                if (data.role !== 'student') {
                    console.warn("User is not a student. Redirecting...");
                    // Optional: handle non-student users on this page
                }

                // Update Sidebar
                if (displayNameSidebar) displayNameSidebar.textContent = data.name || 'Student Name';
                if (displayIdSidebar) displayIdSidebar.textContent = `Reg ID: ${data.usn?.toUpperCase() || 'N/A'}`;

                // Update Personal Info
                if (fullNameInput) fullNameInput.value = data.name || '';
                if (emailInput) emailInput.value = data.email || '';
                if (phoneInput) phoneInput.value = data.phone || '';
                if (dobInput) dobInput.value = data.dob || '';
                if (bioInput) bioInput.value = data.bio || '';

                // Update Academic Info
                if (degreeInput) degreeInput.value = data.degree || 'B.Tech';
                if (branchInput) branchInput.value = data.branch || 'CSE';
                if (gradYearInput) gradYearInput.value = data.gradYear || '';
                if (cgpaInput) cgpaInput.value = data.cgpa || '';

                // Profile Completion Calculation (Simple heuristic)
                calculateCompletion(data);

            } else {
                console.error("No user document found in Firestore.");
            }
        } catch (error) {
            console.error("Error fetching student profile:", error);
        }
    } else {
        // Not logged in, redirect to login page
        window.location.href = 'index.html';
    }
});

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
