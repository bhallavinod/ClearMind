if ('serviceWorker' in navigator) { navigator.serviceWorker.register('./sw.js'); }

let audioCtx, isPlaying = false, timeLeft = 600, actualDongs = 0, scores = [], currentMood = "";
const glyphs = ['𐤇', '𐤟', '𐦀', '𐦁', '𐦂', '𐦃'];

function playMystic(f, t, v, d) {
    if(!isPlaying) return;
    const o = audioCtx.createOscillator(); const g = audioCtx.createGain();
    o.type = t; o.frequency.setValueAtTime(f, audioCtx.currentTime);
    g.gain.setValueAtTime(0, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(v, audioCtx.currentTime + 0.1);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + d);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(); o.stop(audioCtx.currentTime + d);
}

function speak(text) {
    const u = new SpeechSynthesisUtterance(text); u.rate = 0.7;
    window.speechSynthesis.speak(u);
}

document.getElementById('masterBtn').onclick = () => { if(!isPlaying) showMood(); else end(); };

function showMood() {
    const m = document.getElementById('modalOverlay');
    m.style.display = 'flex';
    document.getElementById('modalBody').innerHTML = `
        <h3>Energy Check-in</h3>
        <button class="chip" onclick="start('Aggressive')">Aggressive</button>
        <button class="chip" onclick="start('Low')">Low</button>
        <button class="chip" onclick="start('Calm')">Calm</button>
    `;
}

function start(mood) {
    currentMood = mood; isPlaying = true;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    document.getElementById('modalOverlay').style.display = 'none';
    document.getElementById('masterBtn').textContent = "STOP";
    playMystic(110, 'sawtooth', 0.2, 3); // Conch Opening
    
    // Schedule Dongs
    actualDongs = 0;
    for(let i=0; i<Math.floor(Math.random()*4+4); i++){
        setTimeout(() => { if(isPlaying){ actualDongs++; playMystic(440, 'sine', 0.5, 1); } }, Math.random()*(timeLeft-20)*1000 + 10000);
    }
    initSensors(); breath(); tick();
}

function breath() {
    if(!isPlaying) return;
    document.getElementById('yogeshwarPortrait').classList.add('inhale');
    document.getElementById('mantraDisplay').textContent = "SO"; speak("So");
    const s = getStillness();
    if(s > 0.90) playMystic(60, 'sine', 0.2, 0.5); // Drum

    setTimeout(() => {
        if(!isPlaying) return;
        document.getElementById('yogeshwarPortrait').classList.remove('inhale');
        document.getElementById('mantraDisplay').textContent = "HAM"; speak("Ham");
        if(s > 0.98) playMystic(110, 'sawtooth', 0.2, 3); // Conch
        else if(s > 0.95) playMystic(523, 'triangle', 0.1, 1); // Flute
        document.getElementById('thirdEye').textContent = glyphs[Math.floor(Math.random()*glyphs.length)];
        setTimeout(breath, 4000);
    }, 4000);
}

function initSensors() {
    window.addEventListener('devicemotion', e => {
        const x = e.accelerationIncludingGravity.x || 0;
        const y = e.accelerationIncludingGravity.y || 0;
        document.getElementById('postureDot').style.left = `${50+(x*4)}%`;
        document.getElementById('postureDot').style.top = `${50+(y*4)}%`;
        scores.push(Math.max(0, 1 - (Math.sqrt(x*x+y*y)/20)));
    });
}

function getStillness() { return scores.length ? scores.reduce((a,b)=>a+b)/scores.length : 0; }

function end() {
    isPlaying = false;
    document.getElementById('modalOverlay').style.display = 'flex';
    document.getElementById('modalBody').innerHTML = `<h3>Dongs heard?</h3><input id="uC" type="number"><button onclick="fin()">Verify</button>`;
}

function fin() {
    const u = parseInt(document.getElementById('uC').value);
    const acc = (1 - Math.abs(actualDongs-u)/(actualDongs||1))*100;
    const s = getStillness();
    let state = s > 0.96 ? "Alpha" : "Beta"; if(s > 0.98 && acc < 30) state = "Theta";
    
    const today = new Date().toISOString().split('T')[0];
    let stats = JSON.parse(localStorage.getItem('zenStats')) || { history: {}, streak: 0 };
    stats.history[today] = { mood: currentMood, acc: acc.toFixed(0), state: state, reward: acc > 90 ? "Bagi Halwa" : "Laddu" };
    localStorage.setItem('zenStats', JSON.stringify(stats));
    location.reload();
}

function toggleTutorial() { document.getElementById('tutorialOverlay').style.display = (document.getElementById('tutorialOverlay').style.display==='flex')?'none':'flex'; }
