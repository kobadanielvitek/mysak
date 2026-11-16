/**
 *  Etudy pro klávesnici a myš
 */

function num(v, fallback) {
    var n = parseFloat(v);
    return isNaN(n) ? fallback : n;
}

/**
 *  Shuffle an array randomly
 */

function shuffleArrayKeys(a) {
    // -- array contains list of shuffled indexes

    let indexes = Array.from(a.keys());
    for (let i = indexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }

    return indexes;
}

function shuffleArray(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}



/**
 *  Stav obtížnosti (hvězdičky)
 * 
 *  @returns array of booleans representing the state of each star (true = on, false = off) 
 */

function obtiznostList() {
    return $(".stars").stars("list");
}

/**
 *  Je daná obtížnost aktivní?
 * 
 *  @param int obtiznost 
 *  @returns boolean - true if the given obtiznost is currently active (on), false otherwise
 */

function isObtiznost(obtiznost) {
    return $(".stars").stars("is", obtiznost);
}

function maxObtiznost() {
    return $(".stars").stars("max");
}

/**
 *  POPUP WINDOW - zobrazí popup okno s textem
 * 
 *  @param element to paste as content 
 */

function popupWindow(content, width, height) {

    let popup = $(".popup-window");

    if (!(popup.length)) {
        popup = $('<div class="popup-window"></div>');


        $('<div class="popup-pad"></div>').appendTo(popup);

        // Create the close button
        $('<button class="close-button">Zavřít</button>').appendTo(popup).click(function () {
            popup.remove();
        });

        //$("body").append($('<h2>Nastavení obtížnosti</h2>'));
        $("body").append(popup);
    }

    const popupIn = popup.find(".popup-pad");;

    popupIn.html(content);

    // -- center the popup window on the screen
    popup.css({
        "position": "fixed",
        "top": "35%",
        "left": "50%",
        "transform": "translate(-50%, -50%)",
        "z-index": "1000",
        "width": width + "px",
    });

    // Append the popup window to the body    
}


/**
 *  Draw text into a canvas using its own computed font/color, so the
 *  rendered value only exists as pixels (not as editable DOM text/HTML).
 */

function drawCanvasText(canvas, text) {
    // remembered so the canvas can be redrawn once fonts/layout are ready
    canvas.dataset.text = text;

    const style = getComputedStyle(canvas);
    const fontSize = parseFloat(style.fontSize) || 16;
    const dpr = window.devicePixelRatio || 1;
    const font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`;

    const ctx = canvas.getContext("2d");
    ctx.font = font;

    const width = Math.ceil(ctx.measureText(text).width) + 4;
    const height = Math.ceil(fontSize * 1);

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = font;
    ctx.fillStyle = style.color;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.clearRect(0, 0, width, height);
    ctx.fillText(text, width / 2, height / 2);
}

const BASE_DPR = window.devicePixelRatio || 1;

// Counter the user's page zoom so the final window keeps its designed size
function updateFinScale() {
    const browserZoom = (window.devicePixelRatio || 1) / BASE_DPR;
    const pinchZoom = (window.visualViewport && window.visualViewport.scale) || 1;
    const scale = Math.min(1 / (browserZoom * pinchZoom), 2);
    document.documentElement.style.setProperty("--fin-scale", scale.toFixed(3));
}

window.addEventListener("resize", updateFinScale);
if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", updateFinScale);
}

/**
 *  SCORE BOARD - init all .score-board canvases with 0 and redraw them
 *  after web fonts load, so the first paint never uses a fallback font.
 */

function redrawScoreBoards() {
    document.querySelectorAll(".score-board canvas").forEach(function (canvas) {
        drawCanvasText(canvas, canvas.dataset.text || "0");
    });
}

$(function () {
    redrawScoreBoards();

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(redrawScoreBoards);
    }
});

/**
 *  FIREWORKS - full-screen canvas effect shown with the final window
 */

let fireworksState = null;

function startFireworks() {
    stopFireworks();

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
    }

    const canvas = document.createElement("canvas");
    canvas.id = "fireworks";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const particles = [];
    const state = { canvas: canvas, frame: 0, nextBurst: 0, start: performance.now() };
    fireworksState = state;

    function burst() {
        const x = width * (0.15 + Math.random() * 0.7);
        const y = height * (0.1 + Math.random() * 0.4);
        const hue = Math.floor(Math.random() * 360);

        for (let i = 0; i < 70; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 5;

            particles.push({
                x: x, y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.008 + Math.random() * 0.012,
                color: "hsl(" + (hue + Math.random() * 40) + ",100%,60%)"
            });
        }
    }

    function tick(now) {
        if (fireworksState !== state) {
            return;
        }

        const elapsed = now - state.start;

        // -- bursts keep coming while the window is open, first ones quickly
        if (now >= state.nextBurst) {
            burst();
            state.nextBurst = now + (elapsed < 2000 ? 250 : 700) + Math.random() * 400;
        }

        ctx.clearRect(0, 0, width, height);

        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];

            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.06;
            p.vx *= 0.99;
            p.life -= p.decay;

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2.2, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;
        state.frame = requestAnimationFrame(tick);
    }

    state.frame = requestAnimationFrame(tick);
}

function stopFireworks() {
    if (!fireworksState) {
        return;
    }

    cancelAnimationFrame(fireworksState.frame);
    fireworksState.canvas.remove();
    fireworksState = null;
}

function fin() {
    updateFinScale();

    // -- every game exposes checkSolution(); re-verify here so calling fin()
    // directly (e.g. from the console) can't show a win without a real solve
    if (typeof checkSolution === "function" && !checkSolution()) {
        return;
    }

    const winFin = $("#final");

    const best_varians = ["JSI NEJLEPŠÍ", "NEUVĚŘITELNÉ!", "SKVĚLÉ!!", "MISTR SVĚTA", "MEGA SUPER", "JSI VÍTĚZ!!", "BLAHOPŘEJEME!", "NÁDHERA!"];
    const randomIndex = Math.floor(Math.random() * best_varians.length);
    const bestVariant = best_varians[randomIndex];

    GlobalTimer.stop();

    drawCanvasText(document.getElementById("lbl_fin_time"), GlobalTimer.getStopwatch());
    $("#lbl_fin_title").html(bestVariant);

    // -- copy the exercise score board (if it has one) into the final window
    const srcRight = document.getElementById("right");
    const srcWrong = document.getElementById("wrong");
    const finScore = document.getElementById("fin_score");

    if (srcRight && srcWrong && srcRight.closest(".score-board")) {
        finScore.hidden = false;
        drawCanvasText(document.getElementById("fin_right"), srcRight.dataset.text || "0");
        drawCanvasText(document.getElementById("fin_wrong"), srcWrong.dataset.text || "0");
    } else {
        finScore.hidden = true;
    }

    winFin.addClass("on");
    startFireworks();

    $("#btn_fin_restart").off("click.fin").on("click.fin", function () {
        stopFireworks();
        winFin.removeClass("on");
        gameReload();
    });

    // -- check if STAR is object

    if (typeof STARS !== "object") {
        return;
    }
    
    // -- Create stars for the final popup

    const starsContainer = $("#fin_stars");

    starsContainer.empty();
        
    $.each(STARS.stars("list"), function (index, value) {
        let star = $("<span></span>");

        if (value) {
            star.addClass("on");
        }

        starsContainer.append(star);
    });
}