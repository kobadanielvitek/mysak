
function getSunriseSunset(latitude, longitude, date) {
    const rad = Math.PI / 180;
    const deg = 180 / Math.PI;

    // Datum ve formátu YYYY-MM-DD.
    const [year, month, day] = date.split("-").map(Number);

    // Pořadové číslo dne v roce.
    const startOfYear = Date.UTC(year, 0, 1);
    const currentDay = Date.UTC(year, month - 1, day);
    const dayOfYear = Math.floor(
        (currentDay - startOfYear) / 86400000
    ) + 1;

    // Zjednodušený NOAA výpočet pro daný den.
    const gamma = 2 * Math.PI / 365 *
        (dayOfYear - 1);

    const equationOfTime = 229.18 * (
        0.000075
        + 0.001868 * Math.cos(gamma)
        - 0.032077 * Math.sin(gamma)
        - 0.014615 * Math.cos(2 * gamma)
        - 0.040849 * Math.sin(2 * gamma)
    );

    const declination =
        0.006918
        - 0.399912 * Math.cos(gamma)
        + 0.070257 * Math.sin(gamma)
        - 0.006758 * Math.cos(2 * gamma)
        + 0.000907 * Math.sin(2 * gamma)
        - 0.002697 * Math.cos(3 * gamma)
        + 0.00148 * Math.sin(3 * gamma);

    const lat = latitude * rad;
    const zenith = 90.833 * rad;

    const cosHourAngle = (
        Math.cos(zenith) -
        Math.sin(lat) * Math.sin(declination)
    ) / (
        Math.cos(lat) * Math.cos(declination)
    );

    // Polární den nebo polární noc.
    if (cosHourAngle < -1 || cosHourAngle > 1) {
        return {
            sunrise: null,
            sunset: null,
            message: cosHourAngle < -1
                ? "Slunce nezapadá."
                : "Slunce nevychází."
        };
    }

    const hourAngle = Math.acos(cosHourAngle) * deg;

    // Časy v minutách od půlnoci UTC.
    const sunriseMinutes =
        720 - 4 * (longitude + hourAngle) - equationOfTime;

    const sunsetMinutes =
        720 - 4 * (longitude - hourAngle) - equationOfTime;

    const midnightUTC = Date.UTC(year, month - 1, day);

    return {
        sunrise: new Date(
            midnightUTC + sunriseMinutes * 60000
        ),
        sunset: new Date(
            midnightUTC + sunsetMinutes * 60000
        ),
        message: null
    };
}



document.addEventListener("DOMContentLoaded", () => {
    const stage = document.getElementById("stage");

    if (!stage) {
        console.error('Scéna "#stage" nebyla nalezena.');
        return;
    }

    const DEFAULT_DURATION = 4000;
    const trajectories = new Map();

    const objects = [
        ...stage.querySelectorAll("object[data-trajectory]")
    ];

    const images = [
        ...stage.querySelectorAll("img[data-path]")
    ];

    // Načtení SVG a registrace všech jeho trajektorií.
    function loadSVG(obj) {
        return new Promise((resolve, reject) => {
            function read() {
                const trajectoryId = obj.dataset.trajectory;
                const doc = obj.contentDocument;

                if (!doc) {
                    reject(
                        new Error(`Nelze načíst SVG "${trajectoryId}".`)
                    );
                    return;
                }

                const paths = [...doc.querySelectorAll("path")];

                if (!paths.length) {
                    reject(
                        new Error(
                            `SVG "${trajectoryId}" neobsahuje žádný path.`
                        )
                    );
                    return;
                }

                let firstValidPath = null;

                paths.forEach((path, index) => {
                    const pathId = path.id || `__path${index}`;
                    const key = `${trajectoryId}:${pathId}`;
                    const length = path.getTotalLength();

                    if (length <= 0) return;

                    if (!firstValidPath) {
                        firstValidPath = { path, length };
                    }

                    if (trajectories.has(key)) {
                        console.warn(
                            `Duplicitní trajektorie "${key}".`
                        );
                        return;
                    }

                    trajectories.set(key, { path, length });
                });

                // Výchozí trajektorie je první platný path.
                if (firstValidPath) {
                    trajectories.set(
                        `${trajectoryId}:__default`,
                        firstValidPath
                    );
                }

                resolve();
            }

            if (obj.contentDocument?.documentElement) {
                read();
            } else {
                obj.addEventListener("load", read, { once: true });

                obj.addEventListener("error", () => {
                    reject(
                        new Error(`Nepodařilo se načíst SVG: ${obj.data}`)
                    );
                }, { once: true });
            }
        });
    }

    Promise.all(objects.map(loadSVG))
        .then(() => {
            const animations = images.flatMap(img => {
                const trajectoryId = img.dataset.path;
                const pathId = img.dataset.pathId;

                const key = pathId
                    ? `${trajectoryId}:${pathId}`
                    : `${trajectoryId}:__default`;

                const trajectory = trajectories.get(key);

                if (!trajectory) {
                    console.error(
                        `Trajektorie "${key}" nebyla nalezena pro obrázek "${img.src}".`
                    );
                    return [];
                }

                // Počáteční pozice v rozsahu 0–100 %.
                const startValue = Number(img.dataset.start);
                const startProgress = Math.min(
                    100,
                    Math.max(
                        0,
                        img.dataset.start === undefined ||
                            !Number.isFinite(startValue)
                            ? 0
                            : startValue
                    )
                ) / 100;

                return [{
                    img,
                    path: trajectory.path,
                    length: trajectory.length,
                    duration: Math.max(
                        1,
                        Number(img.dataset.duration) || DEFAULT_DURATION
                    ),
                    startProgress,
                    startTime: null
                }];
            });

            if (!animations.length) return;

            // Umístění objektů na jejich výchozí body.
            function positionObject(a, progress) {
                const point = a.path.getPointAtLength(
                    progress * a.length
                );

                const svg = a.path.ownerSVGElement;
                const svgPoint = svg.createSVGPoint();

                svgPoint.x = point.x;
                svgPoint.y = point.y;

                const matrix = a.path.getScreenCTM();
                if (!matrix) return;

                const screen = svgPoint.matrixTransform(matrix);
                const rect = stage.getBoundingClientRect();

                a.img.style.left =
                    `${screen.x - rect.left - stage.clientLeft}px`;

                a.img.style.top =
                    `${screen.y - rect.top - stage.clientTop}px`;
            }

            // Všechny objekty se nejprve umístí na začátek animace.
            animations.forEach(a => {
                positionObject(a, a.startProgress);
            });

            function animate(timestamp) {
                let running = false;

                for (const a of animations) {
                    if (a.startTime === null) {
                        a.startTime = timestamp;
                    }

                    const progress = Math.min(
                        (timestamp - a.startTime) / a.duration,
                        1
                    );

                    if (progress < 1) {
                        running = true;
                    }

                    // Pohyb od výchozího procenta do konce trajektorie.
                    const pathProgress =
                        a.startProgress +
                        (1 - a.startProgress) * progress;

                    positionObject(a, pathProgress);
                }

                if (running) {
                    requestAnimationFrame(animate);
                }
            }

            requestAnimationFrame(animate);
        })
        .catch(error => console.error("Chyba animace:", error));
});


const sun = getSunriseSunset(
    48.9747,       // zeměpisná šířka
    14.4743,       // zeměpisná délka
    "2026-10-22"   // datum
);

console.log("Východ UTC:", sun.sunrise);
console.log("Západ UTC:", sun.sunset);