/**
 * Café Dhara Invitation Application Script (v1.1)
 * Features: Interactive Welcome Envelope, YouTube Ambience Player, Countdown Clock,
 * Map markers, Calendar links, and Copy/Sharing options.
 */

document.addEventListener('DOMContentLoaded', () => {
    // App Constants
    const EVENT_DATE = new Date('2026-07-11T16:00:00'); // July 11, 2026 at 4:00 PM IST
    const MOCK_COORDINATES = [13.0718196, 77.6159629]; // Jakkur, Bengaluru
    
    // Audio Ambience Engine using YouTube IFrame Player API
    class YouTubeAmbience {
        constructor() {
            this.player = null;
            this.isPlaying = false;
            this.isReady = false;
            this.videoID = 'V-o_40bAfIw'; // Starbucks cafe jazz playlist ID
            this.loadScript();
        }

        loadScript() {
            // Load YouTube IFrame Player API script
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            // YouTube callback
            window.onYouTubeIframeAPIReady = () => {
                this.player = new YT.Player('yt-helper-player', {
                    events: {
                        'onReady': () => {
                            this.isReady = true;
                            if (this.player && typeof this.player.setVolume === 'function') {
                                this.player.setVolume(50);
                            }
                            if (this.isPlaying) {
                                this.start();
                            }
                        },
                        'onStateChange': (event) => {
                            // Loop safety: if video ends, play again
                            if (event.data === YT.PlayerState.ENDED) {
                                this.player.playVideo();
                            }
                        }
                    }
                });
            };
        }

        start() {
            this.isPlaying = true;
            if (this.isReady && this.player) {
                try {
                    this.player.playVideo();
                } catch (e) {
                    console.error("YouTube play failed:", e);
                }
            }
        }

        stop() {
            this.isPlaying = false;
            if (this.isReady && this.player) {
                try {
                    this.player.pauseVideo();
                } catch (e) {
                    console.error("YouTube pause failed:", e);
                }
            }
        }
    }

    const ambience = new YouTubeAmbience();

    // Elements
    const welcomeOverlay = document.getElementById('welcome-overlay');
    const envelopeWrapper = document.querySelector('.envelope-wrapper');
    const btnOpenEnvelope = document.getElementById('btn-open-envelope');
    const waxSeal = document.getElementById('wax-seal');
    const navbar = document.getElementById('navbar');
    const musicToggle = document.getElementById('music-toggle');
    const equalizer = document.getElementById('equalizer');
    
    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    
    const btnCopyLink = document.getElementById('btn-copy-link');
    const shareLinkInput = document.getElementById('share-link-input');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    // Set current URL in Share link
    shareLinkInput.value = window.location.href;

    // 1. Envelope Welcome Opening Animation
    const openEnvelope = () => {
        // Start ambience immediately on user click to comply with mobile autoplay gesture restrictions
        startAmbience();
        
        envelopeWrapper.classList.add('open');
        setTimeout(() => {
            welcomeOverlay.style.opacity = '0';
            setTimeout(() => {
                welcomeOverlay.classList.add('hidden');
            }, 1200);
        }, 1500);
    };

    if (waxSeal) waxSeal.addEventListener('click', openEnvelope);
    if (btnOpenEnvelope) btnOpenEnvelope.addEventListener('click', openEnvelope);

    // 2. Audio Ambience Control
    const startAmbience = () => {
        try {
            ambience.start();
            equalizer.classList.add('playing');
            showToast("Ambient Coffee Jazz Started ☕");
        } catch (e) {
            console.error("Audio failed to load:", e);
        }
    };

    const stopAmbience = () => {
        ambience.stop();
        equalizer.classList.remove('playing');
    };

    musicToggle.addEventListener('click', () => {
        if (ambience.isPlaying) {
            stopAmbience();
        } else {
            startAmbience();
        }
    });

    // 3. Navbar Styling on Scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile Navbar Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        const icon = mobileToggle.querySelector('i');
        if (navMenu.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });

    // Close menu when link is clicked (mobile)
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggle.querySelector('i').className = 'fas fa-bars';
        });
    });

    // 4. Countdown Timer Logic
    const updateCountdown = () => {
        const now = new Date();
        const difference = EVENT_DATE - now;

        if (difference <= 0) {
            document.getElementById('countdown').innerHTML = `<h3 style="font-family: var(--font-serif); color: var(--color-primary-gold); font-size: 2rem; text-shadow: 0 0 10px rgba(143,179,57,0.3);">Our Doors Are Open! Welcome to Café Dhara.</h3>`;
            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        daysEl.textContent = String(days).padStart(2, '0');
        hoursEl.textContent = String(hours).padStart(2, '0');
        minutesEl.textContent = String(minutes).padStart(2, '0');
        secondsEl.textContent = String(seconds).padStart(2, '0');
    };

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Draw functional, scannable QR Code using QRious
    const inviteQRCanvas = document.getElementById('invite-url-qr');
    if (inviteQRCanvas) {
        new QRious({
            element: inviteQRCanvas,
            value: window.location.href,
            size: 160,
            background: '#ffffff',
            foreground: '#1e4a28' // Botanical Green to match Dhara!
        });
    }

    // 5. Sharing Dashboard Event Handlers
    btnCopyLink.addEventListener('click', () => {
        shareLinkInput.select();
        shareLinkInput.setSelectionRange(0, 99999);
        navigator.clipboard.writeText(shareLinkInput.value)
            .then(() => {
                showToast("Invitation link copied!");
                document.getElementById('copy-btn-text').textContent = "Copied!";
                setTimeout(() => {
                    document.getElementById('copy-btn-text').textContent = "Copy Link";
                }, 3000);
            })
            .catch(err => {
                console.error("Failed to copy link:", err);
            });
    });

    // Prefill Share Links
    const messageTemplate = "Join us for the Grand Opening of Café Dhara! ☕✨ Experience Bengaluru's refreshing new garden cafe. View your invitation details here: ";
    const shareUrl = window.location.href;

    document.getElementById('btn-share-whatsapp').href = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageTemplate + shareUrl)}`;
    document.getElementById('btn-share-facebook').href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    
    document.getElementById('btn-share-email').addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = `mailto:?subject=You%20are%20invited%3A%20Caf%C3%A9%20Dhara%20Grand%20Opening&body=${encodeURIComponent(messageTemplate + "\n\n" + shareUrl)}`;
    });

    // 6. Interactive Leaflet Map Setup centered on Jakkur, Bengaluru
    let map = L.map('map', {
        center: MOCK_COORDINATES,
        zoom: 15,
        zoomControl: false,
        attributionControl: false
    });

    // Add Dark Tile Layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20
    }).addTo(map);

    // Custom Green Pin Marker
    const greenIcon = L.divIcon({
        className: 'custom-green-marker',
        html: `<div style="background-color: #8fb339; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 0 15px #8fb339;"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
    });

    const marker = L.marker(MOCK_COORDINATES, { icon: greenIcon }).addTo(map);
    marker.bindPopup(`
        <div style="background-color: #0f1711; color: #faf8f5; font-family: var(--font-sans); padding: 5px;">
            <strong style="color: #8fb339; font-family: var(--font-serif); font-size: 1.1rem; display:block; margin-bottom:2px;">Café Dhara</strong>
            <span style="font-size:0.75rem; color:#cbd4cd;">11th Cross Rd, MCECHS Layout Phase 2, Dr. Shivaram Karanth Nagar, Jakkur, Bengaluru – 560077</span>
        </div>
    `).openPopup();

    // 7. Add to Calendar Functionality
    document.getElementById('btn-cal-google').addEventListener('click', () => {
        const details = "We're opening our doors! Join us at Café Dhara for a journey filled with warm brews, delicious bites and memorable moments.";
        const location = "Café Dhara, 11th Cross Road, MCECHS Layout Phase 2, Dr. Shivaram Karanth Nagar, Jakkur, Bengaluru – 560077";
        const title = "Café Dhara Grand Opening";
        
        // Start date July 11, 2026 at 4:00 PM IST (UTC: July 11, 2026 at 10:30 AM)
        const googleUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=20260711T103000Z/20260711T163000Z&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
        window.open(googleUrl, '_blank');
    });

    document.getElementById('btn-cal-ical').addEventListener('click', () => {
        const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cafe Dhara//Invitation//EN
BEGIN:VEVENT
UID:uid_cafe_dhara_opening_2026@cafedhara.com
DTSTAMP:20260711T103000Z
DTSTART:20260711T103000Z
DTEND:20260711T163000Z
SUMMARY:Café Dhara Grand Opening
DESCRIPTION:Join us at Café Dhara for our grand opening. We're excited to welcome you!
LOCATION:Café Dhara\\, 11th Cross Road\\, MCECHS Layout Phase 2\\, Dr. Shivaram Karanth Nagar\\, Jakkur\\, Bengaluru – 560077
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'cafe_dhara_grand_opening.ics';
        link.click();
    });

    // 8. Toast Notifications Utility
    const showToast = (message) => {
        toastMessage.textContent = message;
        toast.classList.remove('hidden');
        toast.style.opacity = '1';
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => {
                toast.classList.add('hidden');
            }, 500);
        }, 3000);
    };
});
