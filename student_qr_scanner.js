let html5QrcodeScanner = null;
let isScanning = false;

// Custom config for the scanner
const config = {
    fps: 10,
    qrbox: { width: 250, height: 250 },
    aspectRatio: 1.0,
    disableFlip: false
};

function initScanner() {
    if (!html5QrcodeScanner) {
        html5QrcodeScanner = new Html5Qrcode("reader");
    }
}

async function startScanner() {
    try {
        initScanner();

        // Update UI Start
        setUIStatus('scanning');

        // Request camera (prefer back camera for phones)
        await html5QrcodeScanner.start(
            { facingMode: "environment" },
            config,
            onScanSuccess,
            onScanFailure
        );

        isScanning = true;

    } catch (err) {
        console.error("Error starting scanner:", err);
        setUIStatus('error', "Camera access denied or unavailable.");
    }
}

async function stopScanner() {
    if (html5QrcodeScanner && isScanning) {
        try {
            await html5QrcodeScanner.stop();
            html5QrcodeScanner.clear();
            isScanning = false;
            setUIStatus('idle');
        } catch (err) {
            console.error("Error stopping scanner:", err);
        }
    }
}

function onScanSuccess(decodedText, decodedResult) {
    // Stop scanning immediately on success to prevent multiple reads
    stopScanner();
    setUIStatus('success', "QR Code detected!");

    try {
        // We expect a JSON payload like the one generated in preplacement_talks.html
        // Example: {"eventId":"PPT-123456","company":"Google","type":"attendance"}
        const payload = JSON.parse(decodedText);

        if (payload.type === 'attendance' && payload.eventId) {
            showResult(payload);
        } else {
            throw new Error("Invalid QR code format for attendance.");
        }
    } catch (e) {
        // Fallback if not JSON or parsing fails (maybe scanning a random QR code)
        console.warn("QR Format mismatch:", e);
        showResult({
            company: "Unknown Event / External Link",
            eventId: "Raw Data: " + decodedText.substring(0, 20) + "..."
        });
    }
}

function onScanFailure(error) {
    // handle scan failure, usually better to ignore and keep scanning
    // console.warn(`Code scan error = ${error}`);
}

function showResult(data) {
    // Hide scanner controls somewhat
    document.querySelector('.scanner-container').style.display = 'none';
    const resCard = document.getElementById('result-card');

    // Populate Data
    document.getElementById('res-company').textContent = data.company || "N/A";
    document.getElementById('res-event-id').textContent = data.eventId || "N/A";

    const now = new Date();
    document.getElementById('res-time').textContent = now.toLocaleTimeString() + " " + now.toLocaleDateString();

    resCard.style.display = 'block';

    // Play a success sound (optional enhancement)
    // const audio = new Audio('path/to/beep.mp3'); audio.play();
}

function resetScanner() {
    document.getElementById('result-card').style.display = 'none';
    document.querySelector('.scanner-container').style.display = 'flex';
    startScanner();
}

function setUIStatus(state, message = "") {
    const statusBar = document.getElementById('status-bar');
    const statusText = document.getElementById('status-text');
    const pulse = document.getElementById('status-pulse');
    const btnStart = document.getElementById('btn-start');
    const btnStop = document.getElementById('btn-stop');
    const overlay = document.getElementById('scan-overlay');

    // Reset classes
    statusBar.className = 'status-bar';
    pulse.style.display = 'block';

    switch (state) {
        case 'idle':
            statusText.textContent = "Camera ready to scan";
            pulse.style.backgroundColor = "var(--text-muted)";
            btnStart.style.display = 'inline-flex';
            btnStop.style.display = 'none';
            overlay.style.display = 'none';
            break;
        case 'scanning':
            statusText.textContent = "Looking for QR code...";
            statusBar.classList.add('status-active');
            pulse.style.backgroundColor = "var(--primary)";
            btnStart.style.display = 'none';
            btnStop.style.display = 'inline-flex';
            overlay.style.display = 'block';
            break;
        case 'success':
            statusText.textContent = message || "Success!";
            statusBar.classList.add('status-success');
            pulse.style.display = 'none';
            btnStart.style.display = 'inline-flex';
            btnStop.style.display = 'none';
            overlay.style.display = 'none';
            break;
        case 'error':
            statusText.textContent = message || "An error occurred";
            statusBar.classList.add('status-error');
            pulse.style.backgroundColor = "var(--danger)";
            btnStart.style.display = 'inline-flex';
            btnStop.style.display = 'none';
            overlay.style.display = 'none';
            break;
    }
}

// Initialize
applyReadStatus();
loadUpcomingDrives();

function applyReadStatus() {
    // This function depends on applyReadStatus being available, 
    // but the original code had it as a global call.
    // However, applyReadStatus was NOT defined in the inline script of student_qr_scanner.html.
    // It must be in home.js or another linked file.
    if (window.applyReadStatus) window.applyReadStatus();
}

function loadUpcomingDrives() {
    if (window.loadUpcomingDrives) window.loadUpcomingDrives();
}
