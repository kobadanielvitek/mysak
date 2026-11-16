/**
 * Global timer / stopwatch utility.
 *
 * Usage:
 *   GlobalTimer.start();
 *   GlobalTimer.stop();
 *   GlobalTimer.getValue(); // elapsed milliseconds
 *   GlobalTimer.getStopwatch(); // "HH:MM:SS.mmm"
 *   GlobalTimer.getStopwatch(false); // "HH:MM:SS"
 */

(function (global) {
    "use strict";

    var startTime = 0;
    var elapsedBeforeStart = 0;
    var running = false;

    function now() {
        return Date.now();
    }

    function pad(number, size) {
        return String(number).padStart(size, "0");
    }

    function getElapsedMs() {
        if (!running) {
            return elapsedBeforeStart;
        }

        return elapsedBeforeStart + (now() - startTime);
    }

    function renderStopwatchToElement(element, showMilliseconds) {
        element.innerHTML = GlobalTimer.getStopwatch(showMilliseconds);
    }

    function normalizeInterval(intervalMs) {
        var parsed = Number(intervalMs);

        if (!Number.isFinite(parsed) || parsed <= 0) {
            return 50;
        }

        return Math.floor(parsed);
    }

    var GlobalTimer = {
        /** Start or resume timer. */
        start: function () {
            if (running) {
                return;
            }

            startTime = now();
            running = true;
        },

        /** Stop/pause timer and keep elapsed value. */
        stop: function () {
            if (!running) {
                return;
            }

            elapsedBeforeStart = getElapsedMs();
            running = false;
        },

        /** Set timer value back to 0 and stop it. */
        reset: function () {
            running = false;
            startTime = 0;
            elapsedBeforeStart = 0;
        },

        /** Get current elapsed value in milliseconds. */
        getValue: function () {
            return getElapsedMs();
        },

        /** Get elapsed value as HH:MM:SS(.mmm) string. */

        getStopwatch: function (showMilliseconds, hh) {
            var totalMs = getElapsedMs();
            var ms = totalMs % 1000;
            var totalSec = Math.floor(totalMs / 1000);
            var sec = totalSec % 60;
            var totalMin = Math.floor(totalSec / 60);
            var min = totalMin % 60;
            var hours = Math.floor(totalMin / 60);
            var withMilliseconds = showMilliseconds !== false;

            hh = hh || totalMin >= 60;

            let result = "";

            if (hh) {
                result += pad(hours, 2) + ":";
            }

            result += pad(min, 2) + ":" + pad(sec, 2);

            if (withMilliseconds) {
                result += "." + pad(ms, 3);
            }

            return result;
        },

        /** Returns true when timer is currently running. */
        isRunning: function () {
            return running;
        },

        /** Write stopwatch value into element as HTML (single render). */
        render: function (element, showMilliseconds) {
            if (!element || typeof element.innerHTML === "undefined") {
                return;
            }

            renderStopwatchToElement(element, showMilliseconds);
        },

        /**
         * Bind stopwatch rendering to an element.
         * - default: starts auto update
         * - "once": render one time only
         * - "stop": stop auto update
         */
        bindElement: function (element, mode, intervalMs, showMilliseconds) {
            var updateInterval;
            var withMilliseconds;

            if (!element || typeof element.innerHTML === "undefined") {
                return element;
            }

            if (typeof mode === "boolean") {
                showMilliseconds = mode;
                mode = undefined;
            }

            if (typeof intervalMs === "boolean") {
                showMilliseconds = intervalMs;
                intervalMs = undefined;
            }

            withMilliseconds = showMilliseconds !== false;

            if (mode === "stop") {
                if (element.__globalTimerIntervalId) {
                    clearInterval(element.__globalTimerIntervalId);
                    element.__globalTimerIntervalId = null;
                }

                return element;
            }

            renderStopwatchToElement(element, withMilliseconds);

            if (mode === "once") {
                return element;
            }

            if (element.__globalTimerIntervalId) {
                clearInterval(element.__globalTimerIntervalId);
            }

            updateInterval = normalizeInterval(intervalMs);
            element.__globalTimerIntervalId = setInterval(function () {
                renderStopwatchToElement(element, withMilliseconds);
            }, updateInterval);

            return element;
        }
    };

    if (typeof global.Element !== "undefined" && !global.Element.prototype.stopwatch) {
        global.Element.prototype.stopwatch = function (mode, intervalMs, showMilliseconds) {
            return GlobalTimer.bindElement(this, mode, intervalMs, showMilliseconds);
        };
    }

    if (global.jQuery && !global.jQuery.fn.stopwatch) {
        global.jQuery.fn.stopwatch = function (mode, intervalMs, showMilliseconds) {
            return this.each(function () {
                GlobalTimer.bindElement(this, mode, intervalMs, showMilliseconds);
            });
        };
    }

    global.GlobalTimer = GlobalTimer;
})(typeof window !== "undefined" ? window : this);