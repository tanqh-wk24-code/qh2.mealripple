function toggleReadMore(postId, btn) {
    const post = document.getElementById(postId);
    if (post.style.display === "block") {
        post.style.display = "none";
        btn.innerHTML = "Read More →";
    } else {
        post.style.display = "block";
        btn.innerHTML = "Read Less ←";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const guide = document.getElementById('audio-guide');
    const audio = document.getElementById('bgMusic');

    if (guide && audio) {
        guide.addEventListener('click', () => {
            // 1. Force the overlay to disappear NO MATTER WHAT
            guide.classList.add('hide-overlay');

            // 2. Try to play the audio
            audio.volume = 0.4;
            audio.play().catch(error => {
                console.log("Audio play failed, but overlay removed: ", error);
            });
        });
    } else {
        console.error("Missing HTML elements: check if IDs 'audio-guide' or 'bgMusic' exist.");
    }
});


/**
 * Using window.onload ensures that all HTML elements (buttons and audio) 
 * are fully loaded before the script attempts to bind click events.
 */
window.onload = function() {
    const audio = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('music-toggle');
    const musicIcon = document.getElementById('music-icon');
    const guide = document.getElementById('audio-guide');

    // 1. Handle Overlay Click (Start Playback)
    if (guide) {
        guide.onclick = function() {
            guide.style.display = 'none'; // Hide the welcome overlay
            
            if (audio) {
                audio.volume = 0.5; // Set volume to 50%
                audio.play().then(() => {
                    console.log("Playback started successfully.");
                }).catch(e => {
                    console.log("Playback failed (check file path):", e);
                });
                
                // Update the icon to show it is playing
                if (musicIcon) musicIcon.innerText = "🔊";
            }
        };
    }

    // 2. Handle the Toggle Button (Fixes the "Cannot Stop" issue)
    if (musicBtn) {
        musicBtn.onclick = function(e) {
            /** * e.stopPropagation() prevents the click from "bubbling up" 
             * and accidentally triggering other background events.
             */
            e.stopPropagation(); 
            
            if (audio) {
                if (audio.paused) {
                    audio.play();
                    if (musicIcon) musicIcon.innerText = "🔊";
                    console.log("Music Resumed");
                } else {
                    audio.pause();
                    /** * Optional: reset song to beginning 
                     * audio.currentTime = 0; 
                     */
                    if (musicIcon) musicIcon.innerText = "🔇";
                    console.log("Music Paused");
                }
            }
        };
    }
};

/**
 * Magic Canvas Effect:
 * 1. Gradient Trail: A smooth line that changes color based on time.
 * 2. Optimized Confetti: Rare bursts to keep the UI clean.
 */

const canvas = document.getElementById('magic-canvas');
const ctx = canvas.getContext('2d');

let particles = [];    // Array for the burst confetti
let trailPoints = [];  // Array for the fading center trail lines

/**
 * Syncs canvas size with the browser window
 */
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

/**
 * Confetti Class:
 * Handles the logic for individual "rare" confetti pieces.
 */
class Confetti {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 2; // Slightly smaller for a cleaner look
        
        // Random HSL color for the confetti bits
        this.color = `hsl(${Math.random() * 360}, 70%, 60%)`;
        
        this.vx = (Math.random() - 0.5) * 6;
        this.vy = (Math.random() - 0.5) * 6;
        
        this.life = 1.0;     
        this.decay = Math.random() * 0.03 + 0.02; // Faster decay to reduce clutter
        this.gravity = 0.15; 
        this.rotation = Math.random() * 360;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += this.gravity; 
        this.life -= this.decay;  
        this.rotation += 5;       
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation * Math.PI / 180);
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        // Draw confetti rectangle
        ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size/2);
        ctx.restore();
    }
}

/**
 * Mouse Movement Listener:
 * Manages the rainbow trail logic and the spawn rate of confetti.
 */
window.addEventListener('mousemove', (e) => {
    // 1. Record trail point with a time-based Hue for the rainbow effect
    const hue = (Date.now() / 10) % 360; 
    trailPoints.push({ x: e.clientX, y: e.clientY, age: 0, color: hue });

    // 2. Confetti spawn probability: Only 15% chance per movement
       if (Math.random() < 0.2) { 
        for (let i = 0; i < 5; i++) {
        particles.push(new Confetti(e.clientX, e.clientY));
    }
}
   
});



/**
 * Trail Logic:
 * Uses the saved hue to create a smooth, color-shifting line.
 */
function drawTrail() {
    if (trailPoints.length < 2) return;

    for (let i = 1; i < trailPoints.length; i++) {
        const p1 = trailPoints[i - 1];
        const p2 = trailPoints[i];
        
        // Calculate transparency and thickness based on age
        const opacity = 1 - (p1.age / 25);
        const width = 4 * (1 - p1.age / 25);

        ctx.beginPath();
        // Use HSLA for the colorful trail effect
        ctx.strokeStyle = `hsla(${p1.color}, 80%, 60%, ${opacity})`; 
        ctx.lineWidth = width;
        ctx.lineCap = 'round';
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
    }
}

/**
 * Main Loop
 */
function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw the Rainbow Trail
    for (let i = 0; i < trailPoints.length; i++) {
        trailPoints[i].age++;
        if (trailPoints[i].age > 25) { 
            trailPoints.splice(i, 1);
            i--;
        }
    }
    drawTrail();

    // Update and draw the Rare Confetti
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
            i--;
        }
    }

    requestAnimationFrame(animate);
}

animate();

let mybutton = document.getElementById("backToTop");

// Show the button when user scrolls down 20px from the top
window.onscroll = function() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
};

// Scroll to the top when the user clicks the button
mybutton.onclick = function() {
    window.scrollTo({top: 0, behavior: 'smooth'}); // Smooth scrolling effect
};

const readMoreBtn = document.getElementById('readMoreBtn');
const readMoreBtn2 = document.getElementById('readMoreBtn2');
const readMoreBtn3 = document.getElementById('readMoreBtn3');
const readMoreBtn4 = document.getElementById('readMoreBtn4');
const readMoreBtn5 = document.getElementById('readMoreBtn5');
const readMoreBtn6 = document.getElementById('readMoreBtn6');
const readMoreBtn7 = document.getElementById('readMoreBtn7');
const readMoreBtn8 = document.getElementById('readMoreBtn8');
const readMoreBtn1 = document.getElementById('readMoreBtn1');
const modalOverlay = document.getElementById('modalOverlay');
const modalOverlay1 = document.getElementById('modalOverlay1');
const modalOverlay2 = document.getElementById('modalOverlay2');
const modalOverlay3 = document.getElementById('modalOverlay3');
const modalOverlay4 = document.getElementById('modalOverlay4');
const modalOverlay5 = document.getElementById('modalOverlay5');
const modalOverlay6 = document.getElementById('modalOverlay6');
const modalOverlay7 = document.getElementById('modalOverlay7');
const modalOverlay8 = document.getElementById('modalOverlay8');
const closeBtn = document.getElementById('closeBtn');
const closeBtn1 = document.getElementById('closeBtn1');
const closeBtn2 = document.getElementById('closeBtn2');
const closeBtn3 = document.getElementById('closeBtn3');
const closeBtn4 = document.getElementById('closeBtn4');
const closeBtn5 = document.getElementById('closeBtn5');
const closeBtn6 = document.getElementById('closeBtn6');
const closeBtn7 = document.getElementById('closeBtn7');
const closeBtn8 = document.getElementById('closeBtn8');

// 点击按钮打开弹窗
readMoreBtn.addEventListener('click', () => {
  modalOverlay.style.display = 'flex';
});

// 点击 X 关闭弹窗
closeBtn.addEventListener('click', () => {
  modalOverlay.style.display = 'none';
});

// 点击弹窗外部背景也可以关闭
window.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.style.display = 'none';
  }
});

// 点击按钮打开弹窗
readMoreBtn1.addEventListener('click', () => {
  modalOverlay1.style.display = 'flex';
});

// 点击 X 关闭弹窗
closeBtn1.addEventListener('click', () => {
  modalOverlay1.style.display = 'none';
});

// 点击弹窗外部背景也可以关闭
window.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay1.style.display = 'none';
  }
});

// 点击按钮打开弹窗
readMoreBtn2.addEventListener('click', () => {
  modalOverlay2.style.display = 'flex';
});

// 点击 X 关闭弹窗
closeBtn2.addEventListener('click', () => {
  modalOverlay2.style.display = 'none';
});

// 点击弹窗外部背景也可以关闭
window.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay2.style.display = 'none';
  }
});

// 点击按钮打开弹窗
readMoreBtn3.addEventListener('click', () => {
  modalOverlay3.style.display = 'flex';
});

// 点击 X 关闭弹窗
closeBtn3.addEventListener('click', () => {
  modalOverlay3.style.display = 'none';
});

// 点击弹窗外部背景也可以关闭
window.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay3.style.display = 'none';
  }
});

// 点击按钮打开弹窗
readMoreBtn4.addEventListener('click', () => {
  modalOverlay4.style.display = 'flex';
});

// 点击 X 关闭弹窗
closeBtn4.addEventListener('click', () => {
  modalOverlay4.style.display = 'none';
});

// 点击弹窗外部背景也可以关闭
window.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay4.style.display = 'none';
  }
});

// 点击按钮打开弹窗
readMoreBtn5.addEventListener('click', () => {
  modalOverlay5.style.display = 'flex';
});

// 点击 X 关闭弹窗
closeBtn5.addEventListener('click', () => {
  modalOverlay5.style.display = 'none';
});

// 点击弹窗外部背景也可以关闭
window.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay5.style.display = 'none';
  }
});

// 点击按钮打开弹窗
readMoreBtn6.addEventListener('click', () => {
  modalOverlay6.style.display = 'flex';
});

// 点击 X 关闭弹窗
closeBtn6.addEventListener('click', () => {
  modalOverlay6.style.display = 'none';
});

// 点击弹窗外部背景也可以关闭
window.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay6.style.display = 'none';
  }
});

// 点击按钮打开弹窗
readMoreBtn7.addEventListener('click', () => {
  modalOverlay7.style.display = 'flex';
});

// 点击 X 关闭弹窗
closeBtn7.addEventListener('click', () => {
  modalOverlay7.style.display = 'none';
});

// 点击弹窗外部背景也可以关闭
window.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay7.style.display = 'none';
  }
});

// 点击按钮打开弹窗
readMoreBtn8.addEventListener('click', () => {
  modalOverlay8.style.display = 'flex';
});

// 点击 X 关闭弹窗
closeBtn8.addEventListener('click', () => {
  modalOverlay8.style.display = 'none';
});

// 点击弹窗外部背景也可以关闭
window.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay8.style.display = 'none';
  }
});

function closeModal() {
    document.getElementById('modalOverlay').style.display = 'none';
    document.body.style.overflow = 'auto';   // 关闭时恢复底层网页滚动
}

