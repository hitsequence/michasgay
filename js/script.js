const audio = document.getElementById('background_music');
audio.preload = 'auto';
const splash_screen = document.getElementById('splash_screen');
const splash2 = document.getElementById('splash2');
const splash3 = document.getElementById('splash3');
const splash4 = document.getElementById('splash4');
const main_image = document.querySelector('.main_image');
let snowflakeSystem = null;
const title_bar = document.querySelector('.title_bar');
const enter_overlay = document.getElementById('enter_overlay');
const top_nav = document.querySelector('.top_nav');
const activityInlineAvatar = document.getElementById('activity_avatar_inline');
const activityName = document.getElementById('activity_name');
const activityDetails = document.getElementById('activity_details');
const activityDisplay = document.getElementById('activity_display');
const activityStatusInline = document.getElementById('activity_status_inline');
const nav1 = document.getElementById('nav1');
const nav2 = document.getElementById('nav2');
const nav3 = document.getElementById('nav3');
const nav4 = document.getElementById('nav4');
const SPLASH3_DEFAULT_W = 420;
const SPLASH3_DEFAULT_H = 300;
let activityInterval = null;
let activityTick = null;
let lastSpotify = null;
let dragState = { active: false, offsetX: 0, offsetY: 0, nextX: 0, nextY: 0, currentX: 0, currentY: 0, raf: null, target: null };
const splashState = new Map();
const windows = [
    { splash: splash_screen, nav: nav1 },
    { splash: splash2, nav: nav2 },
    { splash: splash3, nav: nav3 },
    { splash: splash4, nav: nav4 }
];
const resizeState = { active: false, target: null, startX: 0, startY: 0, startW: 0, startH: 0 };

function setInlineAvatar(src, alt = 'discord user') {
    if (!activityInlineAvatar) return;
    activityInlineAvatar.src = src;
    activityInlineAvatar.alt = alt;
}

function setInlineStatus(status) {
    if (!activityStatusInline) return;
    activityStatusInline.classList.remove('online', 'idle', 'dnd', 'offline');
    const normalized = (status || '').toLowerCase();
    const supported = ['online', 'idle', 'dnd', 'offline'];
    const target = supported.includes(normalized) ? normalized : 'offline';
    activityStatusInline.classList.add(target);
}

function openWindow(splash, nav) {
    const state = splashState.get(splash);
    if (!state || state.animating || state.open) return;
    state.animating = true;
    splash.style.display = 'block';
    splash.classList.remove('scale_down');
    void splash.offsetWidth;
    splash.classList.add('scale_up');
    const handleEnd = () => {
        state.open = true;
        state.animating = false;
        splash.removeEventListener('animationend', handleEnd);
    };
    splash.addEventListener('animationend', handleEnd);
    if (nav) nav.classList.remove('nav_closed');
}

function closeWindow(splash, nav) {
    const state = splashState.get(splash);
    if (!state || state.animating || !state.open) return;
    state.animating = true;
    splash.classList.remove('scale_up');
    splash.classList.add('scale_down');
    const handleEnd = () => {
        splash.style.display = 'none';
        splash.classList.remove('scale_down');
        splash.removeEventListener('animationend', handleEnd);
        state.open = false;
        state.animating = false;
    };
    splash.addEventListener('animationend', handleEnd);
    if (nav) nav.classList.add('nav_closed');
}

function toggleWindow(splash, nav) {
    const state = splashState.get(splash);
    if (!state) return;
    if (state.open) {
        closeWindow(splash, nav);
    } else {
        openWindow(splash, nav);
    }
}

setInlineAvatar('https://cdn.discordapp.com/embed/avatars/0.png', 'discord user');
setInlineStatus('offline');

function setInlineStatus(status) {
    if (!activityStatusInline) return;
    const normalized = status || 'offline';
    activityStatusInline.className = `activity_status_inline_dot ${normalized}`;
    activityStatusInline.title = normalized;
}

const images = [
    "images/catesp.gif",
    "images/dfxs.gif",
    "images/driverinsideumcheat.gif",
    "images/earsinthecaption.gif",
    "images/headshots.gif",
    "images/kx code.gif",
    "images/lilbaby.gif",
    "images/minion.gif",
    "images/nettspend-lazer.gif",
    "images/pastecheat.gif",
    "images/pastesuccess.gif",
    "images/skiddedbutundetected.gif",
    "images/skiddingleveltoday.gif",
    "images/spityoshittroy.gif",
    "images/thinkingcat.gif",
    "images/werealldetected.gif"
];

const songs = [
    "songs/City - Weiland.mp3",
    "songs/Juvenile - Weiland.mp3",
    "songs/Blue Bands - Weiland.mp3",
    "songs/Demons - Weiland.mp3",
];

const startupFrames = [
    'stages/2.png',
    'stages/3.png',
    'stages/4.png',
    'stages/5.png',
    'stages/6.png',
    'stages/7.png',
    'stages/8.png'
];

function set_random_image() {
    const random_index = Math.floor(Math.random() * images.length);
    main_image.src = images[random_index];
}

function play_sound(src, volume = 0.6) {
    audio.pause();
    audio.src = src;
    audio.currentTime = 0;
    audio.volume = volume;
    audio.loop = false;
    audio.play().catch(() => {});
}

function play_one_shot(src, volume = 0.6) {
    const a = new Audio(src);
    a.volume = volume;
    a.play().catch(() => {});
}

function run_startup_sequence() {
    document.documentElement.style.setProperty('--bg-transition', '0s');
    document.documentElement.style.setProperty('--bg-image', 'none');
    document.documentElement.style.setProperty('--bg-opacity', '0');
    openWindow(splash_screen, nav1);
    const navFrame = document.getElementById('top_nav_frame');
    if (navFrame) navFrame.classList.add('show');
    setTimeout(() => {
        document.documentElement.style.setProperty('--bg-transition', '0.6s');
    }, 100);
    fetch_activity();
}

function play_xp_sound() {
    audio.pause();
    audio.src = 'sounds/xp.mp3';
    audio.currentTime = 0;
    audio.volume = 0.6;
    audio.loop = false;
    audio.play().catch(() => {});
}

window.addEventListener('resize', () => {
    windows.forEach(({ splash }) => {
        if (!splash) return;
        if (window.innerWidth <= 900) {
            splash.style.position = 'static';
            splash.style.left = '';
            splash.style.top = '';
            splash.style.right = '';
            splash.style.bottom = '';
            splash.style.transform = '';
            splash.style.margin = '0 auto 16px';
        } else {
            // Re-apply desktop positioning if needed
            if (splash === splash_screen || splash === splash2) {
                splash.style.position = 'absolute';
                splash.style.margin = '';
            }
        }
    });
});

window.addEventListener('load', () => {
    splash_screen.style.display = 'none';
    const startApp = () => {
        run_startup_sequence();
        if (typeof openWindow === 'function') {
            if (typeof splash2 !== 'undefined' && typeof nav2 !== 'undefined') {
                openWindow(splash2, nav2);
            }
            if (window.innerWidth >= 1024 && typeof splash3 !== 'undefined' && typeof nav3 !== 'undefined') {
                openWindow(splash3, nav3);
            }
        }
        enter_overlay.style.opacity = '0';
        setTimeout(() => {
            enter_overlay.classList.add('hidden');
        }, 400);
        if (snowflakeSystem && typeof snowflakeSystem.startAudio === 'function') {
            snowflakeSystem.startAudio(true);
        }
        enableDrag();
        if (!activityInterval) {
            activityInterval = setInterval(fetch_activity, 10000);
        }
        if (!activityTick) {
            activityTick = setInterval(tick_progress, 1000);
        }
    };
    enter_overlay.addEventListener('click', startApp, { once: true });
    initWindows();
    initSettings();
});

function initWindows() {
    let homePlacement = null;
    windows.forEach(({ splash, nav }, idx) => {
        if (!splash) return;
        splashState.set(splash, { open: false, animating: false });
        splash.style.display = 'none';
        if (splash === splash3) {
            if (!splash.style.width) splash.style.width = `${SPLASH3_DEFAULT_W}px`;
            if (!splash.style.height) splash.style.height = `${SPLASH3_DEFAULT_H}px`;
        }
        const viewportW = window.innerWidth || document.documentElement.clientWidth || 800;
        const viewportH = window.innerHeight || document.documentElement.clientHeight || 600;
        const defaultW = splash.offsetWidth || 420;
        const defaultH = splash.offsetHeight || 180;
        const gap = -2;

        if (splash === splash_screen) {
            const left = Math.max(gap, (viewportW - defaultW) / 2);
            const top = Math.max(gap, (viewportH - defaultH) / 2 - 40);
            splash.style.position = 'absolute';
            splash.style.left = `${left}px`;
            splash.style.top = `${top}px`;
            homePlacement = { left, top, height: defaultH };
        } else if (splash === splash2) {
            const left = homePlacement ? homePlacement.left : Math.max(gap, (viewportW - defaultW) / 2);
            const top = homePlacement ? homePlacement.top + (homePlacement.height || defaultH) + gap : Math.max(gap, (viewportH - defaultH) / 2 + 40);
            splash.style.position = 'absolute';
            splash.style.left = `${left}px`;
            splash.style.top = `${top}px`;
        } else if (idx > 0 && splash !== splash2) {
            splash.style.position = 'absolute';
            const pad = 20;
            const w = defaultW;
            const h = defaultH;
            const maxLeft = Math.max(pad, viewportW - w - pad);
            const maxTop = Math.max(pad, viewportH - h - pad);
            const left = Math.floor(Math.random() * maxLeft);
            const top = Math.floor(Math.random() * maxTop);
            splash.style.left = `${left}px`;
            splash.style.top = `${top}px`;
        }
        if (window.innerWidth <= 900) {
            splash.style.position = 'static';
            splash.style.left = '';
            splash.style.top = '';
            splash.style.right = '';
            splash.style.bottom = '';
            splash.style.transform = '';
            splash.style.margin = '0 auto 16px';
        }
        const closeBtns = splash.querySelectorAll('.title_close_btn');
        closeBtns.forEach((btn) => btn.addEventListener('click', () => closeWindow(splash, nav)));
        if (nav) {
            nav.classList.add('nav_closed');
            nav.addEventListener('click', () => toggleWindow(splash, nav));
        }
        const bar = splash.querySelector('.title_bar');
        if (bar) {
            bar.addEventListener('mousedown', (e) => startDrag(e, splash));
        }
        splash.addEventListener('dragstart', (e) => e.preventDefault());
        if (splash === splash3) ensureResizeHandle(splash);
    });
    initImageSelectors();
}

function startDrag(e, splash) {
    dragState.active = true;
    dragState.target = splash;
    const rect = splash.getBoundingClientRect();
    dragState.offsetX = e.clientX - rect.left;
    dragState.offsetY = e.clientY - rect.top;
    dragState.nextX = rect.left;
    dragState.nextY = rect.top;
    dragState.currentX = rect.left;
    dragState.currentY = rect.top;
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd, { once: true });
    if (!dragState.raf) {
        dragState.raf = requestAnimationFrame(applyDragPosition);
    }
}

function enableDrag() {
}

function onDragMove(e) {
    if (!dragState.active || !dragState.target) return;
    dragState.nextX = e.clientX - dragState.offsetX;
    dragState.nextY = e.clientY - dragState.offsetY;
    if (!dragState.raf) {
        dragState.raf = requestAnimationFrame(applyDragPosition);
    }
}

function onDragEnd() {
    dragState.active = false;
    document.removeEventListener('mousemove', onDragMove);
    if (!dragState.raf) {
        dragState.raf = requestAnimationFrame(applyDragPosition);
    }
}

function applyDragPosition() {
    dragState.raf = null;
    if (!dragState.target) return;
    const lerp = 0.05;
    dragState.currentX += (dragState.nextX - dragState.currentX) * lerp;
    dragState.currentY += (dragState.nextY - dragState.currentY) * lerp;
    dragState.target.style.position = 'absolute';
    dragState.target.style.left = `${dragState.currentX}px`;
    dragState.target.style.top = `${dragState.currentY}px`;
    const distX = Math.abs(dragState.nextX - dragState.currentX);
    const distY = Math.abs(dragState.nextY - dragState.currentY);
    if (dragState.active || distX > 0.5 || distY > 0.5) {
        dragState.raf = requestAnimationFrame(applyDragPosition);
    }
}

function ensureResizeHandle(splash) {
    let handle = splash.querySelector('.resize_handle');
    if (!handle) {
        handle = document.createElement('div');
        handle.className = 'resize_handle';
        splash.appendChild(handle);
    }
    handle.addEventListener('mousedown', (e) => startResize(e, splash));
}

function startResize(e, splash) {
    e.stopPropagation();
    resizeState.active = true;
    resizeState.target = splash;
    resizeState.startX = e.clientX;
    resizeState.startY = e.clientY;
    const rect = splash.getBoundingClientRect();
    resizeState.startW = rect.width;
    resizeState.startH = rect.height;
    document.addEventListener('mousemove', onResizeMove);
    document.addEventListener('mouseup', endResize, { once: true });
}

function onResizeMove(e) {
    if (!resizeState.active || !resizeState.target) return;
    const dx = e.clientX - resizeState.startX;
    const dy = e.clientY - resizeState.startY;
    const isSplash3 = resizeState.target === splash3;
    const minW = isSplash3 ? SPLASH3_DEFAULT_W : 200;
    const minH = isSplash3 ? SPLASH3_DEFAULT_H : 150;
    const newW = Math.max(minW, resizeState.startW + dx);
    const newH = Math.max(minH, resizeState.startH + dy);
    resizeState.target.style.width = `${newW}px`;
    resizeState.target.style.height = `${newH}px`;
}

function endResize() {
    resizeState.active = false;
    resizeState.target = null;
    document.removeEventListener('mousemove', onResizeMove);
}

function initImageSelectors() {
    const preview = document.getElementById('preview3');
    const buttons = document.querySelectorAll('#splash3 .selector_btn');
    if (!preview || !buttons.length) return;
    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const src = btn.getAttribute('data-src');
            if (src) {
                preview.src = src;
            }
        });
    });
}

function initSettings() {
    const renderSnowflakes = document.getElementById('renderSnowflakes');
    const audioVisRow = document.getElementById('audioVisRow');
    const visualizeAudio = document.getElementById('visualizeAudio');
    if (!renderSnowflakes || !audioVisRow || !visualizeAudio) return;
    renderSnowflakes.checked = true;
    visualizeAudio.checked = true;
    const updateVisibility = () => {
        audioVisRow.style.display = renderSnowflakes.checked ? 'block' : 'none';
        if (!renderSnowflakes.checked) {
            visualizeAudio.checked = false;
        }
    };
    renderSnowflakes.addEventListener('change', updateVisibility);
    updateVisibility();
}

async function fetch_activity() {
    if (!activityName || !activityDetails) return;
    try {
        const res = await fetch('https://api.lanyard.rest/v1/users/1122202569519923361');
        if (!res.ok) throw new Error('network');
        const json = await res.json();
        if (!json || !json.success) throw new Error('bad payload');
        render_activity(json.data);
    } catch (err) {
        activityDisplay.textContent = 'offline';
        activityName.textContent = 'no activity';
        activityDetails.textContent = 'unable to load activity';
        setInlineAvatar('https://cdn.discordapp.com/embed/avatars/0.png', 'discord user');
        setInlineStatus('offline');
        lastSpotify = null;
    }
}

function render_activity(data) {
    if (!data) return;
    const { discord_status, discord_user, activities } = data;
    setInlineStatus(discord_status || 'offline');

    if (activityDisplay && discord_user) {
        activityDisplay.textContent = discord_user.global_name || discord_user.username || 'discord user';
    }

    if (activityInlineAvatar && discord_user) {
        const { id, avatar } = discord_user;
        if (avatar) {
            activityInlineAvatar.src = `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=64`;
        } else {
            activityInlineAvatar.src = `https://cdn.discordapp.com/embed/avatars/${(Number(id) || 0) % 5}.png`;
        }
        activityInlineAvatar.alt = discord_user.username || 'discord user';
    }

    const list = Array.isArray(activities) ? activities : [];
    const spotify = list.find(a => a.type === 2 && a.name === 'Spotify');
    const active = spotify || list.find(a => a.type === 0) || list[0] || null;

    if (spotify) {
        activityName.textContent = 'Spotify';
        const track = spotify.details || 'Unknown track';
        const artist = spotify.state || '';
        const timeText = formatTimestamps(spotify.timestamps);
        const secondaryBits = [artist].filter(Boolean);
        const progressBar = renderProgressBar(spotify.timestamps);
        activityDetails.innerHTML = `
            <div class="activity_detail_primary">${track}</div>
            ${secondaryBits.length ? `<div class="activity_detail_secondary">${secondaryBits.join(' • ')}</div>` : ''}
            ${progressBar}
            ${timeText ? `<div class="activity_detail_secondary activity_detail_time">${timeText}</div>` : ''}
        `;
        lastSpotify = spotify;
    } else if (active) {
        activityName.textContent = active.name || 'activity';
        const detailParts = [active.state, active.details].filter(Boolean);
        activityDetails.textContent = detailParts.join(' • ') || 'online';
        lastSpotify = null;
    } else {
        activityName.textContent = 'no activity';
        activityDetails.textContent = '';
        lastSpotify = null;
    }
}

function formatTimestamps(timestamps) {
    if (!timestamps || !timestamps.start || !timestamps.end) return '';
    const now = Date.now();
    const start = Number(timestamps.start);
    const end = Number(timestamps.end);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return '';
    const total = end - start;
    const elapsed = Math.max(0, Math.min(now - start, total));
    return `${toMMSS(elapsed)} / ${toMMSS(total)}`;
}

function toMMSS(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

function renderProgressBar(timestamps) {
    const percent = calcProgress(timestamps);
    const safePercent = Math.max(0, Math.min(percent, 100));
    return `
        <div class="activity_progress">
            <div class="activity_progress_fill" style="width:${safePercent}%"></div>
        </div>
    `;
}

function calcProgress(timestamps) {
    if (!timestamps || !timestamps.start || !timestamps.end) return 0;
    const now = Date.now();
    const start = Number(timestamps.start);
    const end = Number(timestamps.end);
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
    const total = end - start;
    const elapsed = Math.max(0, Math.min(now - start, total));
    return (elapsed / total) * 100;
}

function tick_progress() {
    if (!lastSpotify || !activityDetails) return;
    const percent = calcProgress(lastSpotify.timestamps);
    const fill = activityDetails.querySelector('.activity_progress_fill');
    const timeLine = activityDetails.querySelector('.activity_detail_time');
    if (fill) {
        fill.style.width = `${Math.max(0, Math.min(percent, 100))}%`;
    }
    if (timeLine) {
        const timeText = formatTimestamps(lastSpotify.timestamps);
        timeLine.textContent = timeText;
    }
}

class SnowflakeSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.snowflakes = [];
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.baseSpeed = 2;
        this.tickRate = 16;
        this.lastTick = 0;
        this.enabled = false;
        this.audioVisualization = false;
        this.audioElement = null;
        this.previousEnergy = 0;
        this.beatThreshold = 1.15;
        this.init();
    }

    init() {
        this.createCanvas();
        this.setupAudio();
        this.createDebug();
        this.bindSettings();
        window.addEventListener('resize', () => this.resizeCanvas());
        this.animate();
    }

    createDebug() {
        this.debugEl = document.createElement('div');
        this.debugEl.style.position = 'fixed';
        this.debugEl.style.top = '10px';
        this.debugEl.style.right = '10px';
        this.debugEl.style.color = '#fff';
        this.debugEl.style.font = '12px monospace';
        this.debugEl.style.background = 'rgba(0,0,0,0.5)';
        this.debugEl.style.padding = '4px 6px';
        this.debugEl.style.borderRadius = '4px';
        this.debugEl.style.zIndex = '9999';
        this.debugEl.style.pointerEvents = 'none';
        this.debugEl.style.display = 'none';
        document.body.appendChild(this.debugEl);
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'snowflakes-canvas';
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '0';
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupAudio() {
        this.audioElement = document.getElementById('background_music');
        if (!this.audioElement) {
            this.audioElement = new Audio();
            document.body.appendChild(this.audioElement);
        }
        this.audioElement.src = 'sounds/clutch.mp3';
        this.audioElement.loop = true;
        this.audioElement.volume = 0.6;
        this.audioElement.setAttribute('playsinline', '');
        console.log('Audio element ready:', this.audioElement.src);
        try {
            this.connectAnalyser();
        } catch (e) {
            console.warn('Audio visualization not supported', e);
        }
    }

    connectAnalyser() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.source = this.audioContext.createMediaElementSource(this.audioElement);
            this.source.connect(this.analyser);
            this.analyser.connect(this.audioContext.destination);
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }
            console.log('Audio analyser connected');
        } catch (e) {
            console.warn('Failed to connect analyser', e);
        }
    }

    bindSettings() {
        const renderSnowflakesEl = document.getElementById('renderSnowflakes');
        const muteMusicEl = document.getElementById('muteMusic');
        const visualizeAudioEl = document.getElementById('visualizeAudio');
        if (renderSnowflakesEl) {
            const applyRenderState = () => {
                this.enabled = renderSnowflakesEl.checked;
                if (!this.enabled) {
                    this.snowflakes = [];
                    if (visualizeAudioEl) {
                        visualizeAudioEl.checked = false;
                        this.audioVisualization = false;
                    }
                } else {
                    this.ensureSnowflakes();
                    if (visualizeAudioEl && visualizeAudioEl.checked) {
                        this.audioVisualization = true;
                    }
                }
                const audioVisRow = document.getElementById('audioVisRow');
                if (audioVisRow) {
                    audioVisRow.style.display = this.enabled ? 'block' : 'none';
                }
            };
            renderSnowflakesEl.addEventListener('change', applyRenderState);
            renderSnowflakesEl.checked = true;
            applyRenderState();
        }
        if (muteMusicEl) {
            muteMusicEl.addEventListener('change', (e) => {
                if (this.audioElement) this.audioElement.muted = e.target.checked;
            });
        }
        if (visualizeAudioEl) {
            const applyVisualization = () => {
                const active = !!visualizeAudioEl.checked && (!renderSnowflakesEl || renderSnowflakesEl.checked);
                this.audioVisualization = active;
            };
            visualizeAudioEl.addEventListener('change', applyVisualization);
            visualizeAudioEl.checked = true;
            applyVisualization();
        }
        if (this.enabled) {
            this.ensureSnowflakes();
        }
        if (this.audioVisualization) {
            this.audioVisualization = true;
        }
        const startAudioHandler = () => {
            this.startAudio();
        };
        document.addEventListener('click', startAudioHandler, { once: true });
        document.addEventListener('keydown', startAudioHandler, { once: true });
    }

    startAudio(force = false) {
        const attemptPlay = () => {
            if (!this.audioElement) return;
            this.audioElement.play().then(() => {
                console.log('Audio playing');
            }).catch(err => {
                console.warn('Audio play failed:', err);
            });
        };
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(attemptPlay).catch(() => attemptPlay());
        } else if (force) {
            attemptPlay();
        } else if (this.audioElement && this.audioElement.paused) {
            attemptPlay();
        }
    }

    ensureSnowflakes() {
        const targetCount = Math.floor((this.canvas.width * this.canvas.height) / 15000);
        while (this.snowflakes.length < targetCount) {
            this.snowflakes.push(this.createSnowflake(true));
        }
        while (this.snowflakes.length > targetCount) {
            this.snowflakes.pop();
        }
    }

    createSnowflake(forceTop = false) {
        return {
            x: Math.random() * this.canvas.width,
            y: forceTop ? -10 : Math.random() * this.canvas.height,
            radius: Math.random() * 2.5 + 0.5,
            speed: Math.random() * 0.8 + 0.2,
            wind: Math.random() * 0.4 - 0.2,
            opacity: Math.random() * 0.6 + 0.4
        };
    }

    updateTickRate() {
        if (!this.audioVisualization || !this.analyser) {
            this.tickRate = 33; // 30fps normal speed
            if (this.debugEl) {
                this.debugEl.style.display = 'none';
            }
            return;
        }
        const bufferLength = this.analyser.frequencyBinCount;
        const timeData = new Uint8Array(bufferLength);
        this.analyser.getByteTimeDomainData(timeData);
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            const sample = (timeData[i] - 128) / 128;
            sum += sample * sample;
        }
        const rms = Math.sqrt(sum / bufferLength);
        const amplitude = rms * 255;
        const threshold = 25;
        if (amplitude < threshold) {
            this.tickRate = 33;
        } else {
            const normalizedAmplitude = (amplitude - threshold) / (255 - threshold);
            const speedMultiplier = 1 + normalizedAmplitude * 63 * 2;
            this.tickRate = 33 / speedMultiplier;
        }
        if (this.debugEl) {
            this.debugEl.style.display = 'none';
        }
    }

    update() {
        if (!this.enabled) return;
        this.ensureSnowflakes();
        for (let flake of this.snowflakes) {
            flake.y += flake.speed * this.baseSpeed;
            flake.x += flake.wind;
            if (flake.y > this.canvas.height + 10) {
                flake.y = -10;
                flake.x = Math.random() * this.canvas.width;
            }
            if (flake.x > this.canvas.width + 10) flake.x = -10;
            if (flake.x < -10) flake.x = this.canvas.width + 10;
        }
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (!this.enabled) return;
        this.ctx.fillStyle = '#ffffff';
        for (let flake of this.snowflakes) {
            this.ctx.globalAlpha = flake.opacity;
            this.ctx.beginPath();
            this.ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.globalAlpha = 1;
    }

    animate(timestamp = 0) {
        this.updateTickRate();
        const delta = timestamp - this.lastTick;
        if (delta >= this.tickRate) {
            this.update();
            this.draw();
            this.lastTick = timestamp;
        }
        requestAnimationFrame((t) => this.animate(t));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    snowflakeSystem = new SnowflakeSystem();
});
