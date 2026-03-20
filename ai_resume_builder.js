function simulateFileUpload() {
    startGenerationProcess('Analyzing uploaded document...');
}

function generateResume() {
    startGenerationProcess('Generating ATS-friendly resume...');
}

function startGenerationProcess(initialText) {
    const emptyState = document.getElementById('empty-state');
    const generatedDoc = document.getElementById('generated-doc');
    const scanner = document.getElementById('scanner');
    const pText = emptyState ? emptyState.querySelector('p') : null;
    const btn = document.querySelector('.btn-generate');

    if (!emptyState || !generatedDoc || !scanner || !pText || !btn) return;

    // UI Updating State
    emptyState.style.display = 'flex';
    generatedDoc.style.display = 'none';
    scanner.style.display = 'block';
    pText.innerText = initialText;

    btn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 2s linear infinite;">
            <line x1="12" y1="2" x2="12" y2="6"></line>
            <line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
            <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line>
            <line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
            <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg>
        Processing...
    `;

    pText.style.color = 'var(--ai-accent)';
    pText.style.fontWeight = '500';

    // Simulate Delay, then show Resume
    setTimeout(() => {
        emptyState.style.display = 'none';
        generatedDoc.style.display = 'block';
        btn.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Resume Generated
        `;
        btn.style.backgroundColor = 'var(--success)';
    }, 1800);
}

// Expose functions to global scope for inline onclick handlers if necessary
// (Though we should ideally update the HTML to use addEventListener)
window.simulateFileUpload = simulateFileUpload;
window.generateResume = generateResume;
