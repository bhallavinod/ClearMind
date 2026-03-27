// State variables
let timeLeft = 600;
let isPlaying = false;
let timerInterval;
let breathInterval;

const display = document.getElementById('display');
const masterBtn = document.getElementById('masterBtn');
const visual = document.getElementById('visual');
const guide = document.getElementById('guide');

// UI Updates
function updateDisplay() {
    let mins = Math.floor(timeLeft / 60);
    let secs = timeLeft % 60;
    display.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Control Logic
function toggleApp() {
    if (!isPlaying) {
        startMeditation();
    } else {
        stopMeditation();
    }
}

function startMeditation() {
    isPlaying = true;
    masterBtn.textContent = "PAUSE";
    
    timerInterval = setInterval(() => {
        if (timeLeft > 0) {
            timeLeft--;
            updateDisplay();
        } else {
            stopMeditation();
        }
    }, 1000);

    runBreathing();
    breathInterval = setInterval(runBreathing, 8000);
}

function runBreathing() {
    guide.textContent = "Inhale...";
    visual.classList.add('inhale');
    
    setTimeout(() => {
        if(isPlaying) {
            guide.textContent = "Exhale...";
            visual.classList.remove('inhale');
        }
    }, 4000);
}

function stopMeditation() {
    isPlaying = false;
    masterBtn.textContent = "RESUME";
    guide.textContent = "Paused";
    clearInterval(timerInterval);
    clearInterval(breathInterval);
    visual.classList.remove('inhale');
}

// Event Listeners
masterBtn.addEventListener('click', toggleApp);

document.querySelectorAll('.time-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        timeLeft = parseInt(e.target.dataset.sec);
        updateDisplay();
        stopMeditation();
        masterBtn.textContent = "START";
    });
});

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(err => console.error('SW Registration Failed', err));
    });
}
