document.addEventListener("DOMContentLoaded", () => {
    // =========================
    // 1. Welcome overlay + music
    // =========================
    const guide = document.getElementById("audio-guide");
    const audio = document.getElementById("bgMusic");
    const musicBtn = document.getElementById("music-toggle");
    const musicIcon = document.getElementById("music-icon");

    if (guide) {
        guide.addEventListener("click", () => {
            // Hide the welcome overlay when clicked.
            guide.classList.add("hide-overlay");
            guide.style.display = "none";

            // Start background music if the audio element exists.
            if (audio) {
                audio.volume = 0.4;

                audio.play()
                    .then(() => {
                        if (musicIcon) musicIcon.textContent = "🔊";
                    })
                    .catch((error) => {
                        console.log("Audio playback failed:", error);
                        if (musicIcon) musicIcon.textContent = "🔇";
                    });
            }
        }, { once: true });
    }

    // Music on/off button.
    if (musicBtn && audio) {
        musicBtn.addEventListener("click", (event) => {
            event.stopPropagation();

            if (audio.paused) {
                audio.play()
                    .then(() => {
                        if (musicIcon) musicIcon.textContent = "🔊";
                    })
                    .catch((error) => {
                        console.log("Music could not be played:", error);
                        if (musicIcon) musicIcon.textContent = "🔇";
                    });
            } else {
                audio.pause();
                if (musicIcon) musicIcon.textContent = "🔇";
            }
        });
    }

    // =========================
    // 2. Campaign progress bar
    // =========================
    const progressBar = document.querySelector(".progress-bar-fill");

    if (progressBar && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const percentage =
                        progressBar.getAttribute("data-percentage") || "0%";

                    progressBar.style.width = percentage;
                } else {
                    progressBar.style.width = "0%";
                }
            });
        }, { threshold: 0.2 });

        observer.observe(progressBar);
    } else if (progressBar) {
        progressBar.style.width =
            progressBar.getAttribute("data-percentage") || "0%";
    }

    // =========================
    // 3. Back-to-top button
    // =========================
    const backToTopButton = document.getElementById("backToTop");

    if (backToTopButton) {
        backToTopButton.style.display = "none";

        window.addEventListener("scroll", () => {
            const scrollPosition =
                window.scrollY ||
                document.documentElement.scrollTop ||
                document.body.scrollTop ||
                0;

            backToTopButton.style.display =
                scrollPosition > 20 ? "block" : "none";
        });

        backToTopButton.addEventListener("click", () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    // =========================
    // 4. Magic canvas mouse effect
    // =========================
    const canvas = document.getElementById("magic-canvas");
    const ctx = canvas ? canvas.getContext("2d") : null;

    // Skip the effect safely if canvas is unavailable.
    if (!canvas || !ctx) {
        return;
    }

    let particles = [];
    let trailPoints = [];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    class Confetti {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 4 + 2;
            this.color =
                `hsl(${Math.random() * 360}, 70%, 60%)`;

            this.vx = (Math.random() - 0.5) * 6;
            this.vy = (Math.random() - 0.5) * 6;
            this.life = 1;
            this.decay = Math.random() * 0.03 + 0.02;
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
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.fillStyle = this.color;

            ctx.fillRect(
                -this.size / 2,
                -this.size / 2,
                this.size,
                this.size / 2
            );

            ctx.restore();
        }
    }

    window.addEventListener("mousemove", (event) => {
        const hue = (Date.now() / 10) % 360;

        trailPoints.push({
            x: event.clientX,
            y: event.clientY,
            age: 0,
            color: hue
        });

        // Occasionally create a small confetti burst.
        if (Math.random() < 0.2) {
            for (let i = 0; i < 5; i++) {
                particles.push(
                    new Confetti(event.clientX, event.clientY)
                );
            }
        }

        // Prevent unlimited growth.
        if (trailPoints.length > 100) {
            trailPoints.splice(0, trailPoints.length - 100);
        }

        if (particles.length > 300) {
            particles.splice(0, particles.length - 300);
        }
    });

    function drawTrail() {
        if (trailPoints.length < 2) return;

        for (let i = 1; i < trailPoints.length; i++) {
            const point1 = trailPoints[i - 1];
            const point2 = trailPoints[i];

            const opacity = Math.max(0, 1 - point1.age / 25);
            const width = Math.max(0, 4 * (1 - point1.age / 25));

            ctx.beginPath();

            ctx.strokeStyle =
                `hsla(${point1.color}, 80%, 60%, ${opacity})`;

            ctx.lineWidth = width;
            ctx.lineCap = "round";
            ctx.moveTo(point1.x, point1.y);
            ctx.lineTo(point2.x, point2.y);
            ctx.stroke();
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = trailPoints.length - 1; i >= 0; i--) {
            trailPoints[i].age++;

            if (trailPoints[i].age > 25) {
                trailPoints.splice(i, 1);
            }
        }

        drawTrail();

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();

            if (particles[i].life <= 0) {
                particles.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
});
