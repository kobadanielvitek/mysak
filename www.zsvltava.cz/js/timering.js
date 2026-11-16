/**
 * Animovaný progress bar
 * 
 *      js plugin
 * 
 *       10/2026
 * 
 */

/*

  const myEventsData = {
    default: [
      { start: "08:00", end: "12:00" }
    ],
    work: [
      { start: "09:00", end: "17:00" }
    ]
  };

  Použití:

  const tracker = new EventProgressTracker(myEventsData, {
    // lineColor: '#ff0000', 
    selector: '.timer'
  });

*/


(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory();
    } else {
        global.EventProgressTracker = factory();
    }
})(typeof window !== "undefined" ? window : this, function () {
    "use strict";

    var odpocet_force = null;
    var current_odpocet = false;
    var current_odpocet_type = 0;

    class EventProgressTracker {
        // @param {Object} eventsData - array eventů (e.g., { default: [...], group1: [...] })
        // @param {Object} options

        constructor(eventsData, options = {}) {
            // 1. Validate data dependency

            if (!eventsData) {
                // throw new Error('EventProgressTracker: "events"
                // data object must be provided.');
                return;
            }

            this.eventsData = eventsData;
            this.selector = options.selector || ".timer";
            this.lineColor = options.lineColor || "#000";

            this._trackedElements = [];
            this._timerId = null;

            this.init();
        }

        _setHodiny(now, odpocet) {
            odpocet = odpocet || false;
            const prefix = odpocet ? "T-" : "";

            let days = 0;
            let hours, minutes, seconds;

            if (odpocet) {
                days = Math.floor(odpocet / (1000 * 60 * 60 * 24));
                hours = Math.floor(
                    (odpocet % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                minutes = Math.floor((odpocet % (1000 * 60 * 60)) / (1000 * 60));
                seconds = Math.floor((odpocet % (1000 * 60)) / 1000);
            } else {
                hours = now.getHours();
                minutes = now.getMinutes();
                seconds = now.getSeconds();
            }

            if (days == 0) {
                days = "";
            } else {
                days = days + ":";
            }

            if (hours <= 9) hours = "0" + hours;
            if (minutes <= 9) minutes = "0" + minutes;
            if (seconds <= 9) seconds = "0" + seconds;

            return prefix + days + hours + ":" + minutes + ":" + seconds;
        }

        /**
         *  Procházení eventů
         *
         *  - najít odpovídající interval
         *  - zjistit diff start/end
         *
         *  @return float - zbývající čas v procentech
         *
         */

        _scanEvents(events) {
            if (!events || !Array.isArray(events)) return 0;

            const now = new Date();
            const day_of_week = now.getDay();

            let label = "";
            let percentLeft = 0;
            let odpocet = 0;
            let duration = 0;

            if (day_of_week == 0 || day_of_week == 6) {

                label = "Víkend";

                const countDown = new Date();
                const pfx = day_of_week == 0 ? 0 : 1;

                countDown.setDate(now.getDate() + (day_of_week == 0 ? 0 : 1));
                countDown.setHours(23, 59, 59, 0);

                const t3 = new Date();
                t3.setHours(0, 0, 0, 0);

                odpocet = countDown.getTime() - now.getTime();
                duration = countDown.getTime() - t3.getTime();

                percentLeft = Math.round((odpocet / duration) * 1000) / 10;

            } else {

                // --- Scan events

                events.forEach((me) => {


                    const t1 = new Date();
                    const t2 = new Date();

                    const start = me.start.split(":");
                    t1.setHours(parseInt(start[0], 10), parseInt(start[1], 10), 0, 0);

                    const end = me.end.split(":");
                    t2.setHours(parseInt(end[0], 10), parseInt(end[1], 10), 0, 0);

                    if (odpocet_force != null) {
                        me.odpocet = odpocet_force;
                    }

                    if (now >= t1 && now <= t2) {

                        current_odpocet = me.odpocet;

                        const rest = t2 - now;

                        duration = t2 - t1;
                        odpocet = me.odpocet ? rest : false;
                        percentLeft = Math.round((rest / duration) * 1000) / 10;
                        label = me.label;
                    }
                })
            }


            return {
                procenta: percentLeft,
                label: label,
                hodiny: this._setHodiny(now, odpocet),
                odpocet: odpocet
            };
        }

        /**
         * loop driver
         */

        _tick() {
            this._trackedElements.forEach((item) => {
                const result = this._scanEvents(item.eventsList);

                item.element.style.width = `${result.procenta}%`;
                item.element.setAttribute("title", `${result.procenta}%`);

                if (item.label) {
                    item.label.innerHTML = result.label;
                }

                if (item.clock) {
                    if (current_odpocet_type > 1) {
                        if (current_odpocet_type == 2) {
                            result.hodiny = result.procenta * -1;
                        }
                        else {
                            result.procenta = 100 - result.procenta;
                        }

                        result.hodiny = new Intl.NumberFormat("cs-CZ", {
                            style: "percent",
                            minimumFractionDigits: 1,
                        }).format(
                            result.procenta / 100,
                        );
                    }

                    item.clock.innerHTML = result.hodiny;
                }
            });

            this._timerId = setTimeout(() => this._tick(), 1000);
        }

        /**
         * - Prepares DOM infrastructure
         * - starts monitoring
         */

        init() {
            // set wrapper

            const wrappers = document.querySelectorAll(this.selector);
            const $this = this;

            wrappers.forEach((el) => {
                // Look up target sub-element or construct fallback
                let timerLine = el.querySelector(".line");

                if (!timerLine) {
                    timerLine = document.createElement("div");
                    timerLine.classList.add("line");
                    el.appendChild(timerLine);
                }

                // Apply customized styling overrides safely
                // -- if not via css:
                // timerLine.style.background = this.lineColor;

                // Match group parameters accurately
                // <div data-group=""> --> myEventsData[group]

                const grp = el.dataset.group || "default";
                const eventsList = this.eventsData[grp];

                // Register configuration payload to central queue
                this._trackedElements.push({
                    element: timerLine,
                    eventsList: eventsList,
                    label: el.querySelector(".label"),
                    clock: el.querySelector(".clock")
                });

                el.addEventListener("click", function (e) {

                    if (e.detail == 2) {
                        el.classList.toggle("full");
                        return;
                    }

                    if (odpocet_force === null) {
                        odpocet_force = current_odpocet;
                        current_odpocet_type = current_odpocet ? 2 : 1;
                    }
                    else {
                        current_odpocet_type++;
                        if (current_odpocet_type > 3) {
                            current_odpocet_type = 0;
                        }

                    }

                    odpocet_force = !odpocet_force;

                    $this._tick();
                });
            });

            this._tick(); // tick/tack
        }

        /**
         * RIP
         */

        destroy() {
            if (this._timerId) {
                clearTimeout(this._timerId);
            }
            this._trackedElements = [];
            console.log("Tracker instances halted.");
        }
    }

    return EventProgressTracker;
});

const tracker = new EventProgressTracker(events, {
    lineColor: "#ff0000", // Option to custom color bars dynamically
    selector: ".timer"
});
