/**
 * Function to display the enlarged image
 * @param {string} src - The file path/URL of the image to be displayed
 */
function showImage(src) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("expandedImg");
    
    // Display the modal using flex to ensure centering
    modal.style.display = "flex"; 
    
    // Assign the clicked image's source to the modal's image container
    modalImg.src = src;           
}

/**
 * Function to hide the modal and close the image
 */
function closeImage() {
    const modal = document.getElementById("imageModal");
    
    // Hide the modal container
    modal.style.display = "none"; 
}

/**
 * Keyboard support: Closes the image when the "Escape" key is pressed
 */
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        closeImage();
    }
});

// Enhanced version to support captions
function showImage(src, altText) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("expandedImg");
    const caption = document.getElementById("caption");
    
    modal.style.display = "flex";
    modalImg.src = src;
    caption.innerText = altText; // Displays the image description below the photo
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