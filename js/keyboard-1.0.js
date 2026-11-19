/**
 *  JQUERY PLUGIN 
 * 
 *  keyboard only input handling + typing stats
 * 
 *  Usage:
 * 
 *    $("textarea").keyboardonly();
 *    $("textarea").keyboardonly({ allowedKeys: [8, 13, 32, 37, 38, 39, 40] });
 *    $("textarea").keyboardonly({ disableMouse: false, trackStats: true, onStats: function (stats) {} });
 *    $("textarea").keyboardonly("stats");       // -> { characters, newLines, spaces }
 *    $("textarea").keyboardonly("resetStats");
 * 
 */

(function (global) {
    "use strict";

    // c/v/x/a/z keycodes used for clipboard/select/undo shortcuts
    var CLIPBOARD_KEYS = [65, 67, 86, 88, 90];

    function isClipboardShortcut(event) {
        var code = event.which || event.keyCode;

        return (event.ctrlKey || event.metaKey) && CLIPBOARD_KEYS.indexOf(code) !== -1;
    }

    function createStats() {
        return { characters: 0, newLines: 0, spaces: 0 };
    }

    function updateStats(stats, event) {
        var key = event.key;

        if (key === "Enter") {
            stats.newLines++;
        } else if (key === " ") {
            stats.spaces++;
        } else if (typeof key === "string" && key.length === 1) {
            stats.characters++;
        }
    }

    // -- reflects stats into any [data-stat="chars|spaces|lines"] element on the page

    function renderStats(stats) {
        global.jQuery("[data-stat='chars']").text(stats.characters);
        global.jQuery("[data-stat='spaces']").text(stats.spaces);
        global.jQuery("[data-stat='lines']").text(stats.newLines);
    }

    function bindElement(element, options) {
        var settings = options || {};
        var allowedKeys = settings.allowedKeys;
        var disableMouse = settings.disableMouse !== false;
        var trackStats = settings.trackStats !== false;
        var onStats = typeof settings.onStats === "function" ? settings.onStats : null;
        var $element = global.jQuery(element);
        var stats = createStats();

        $element.data("keyboard.stats", stats);

        $element.off(".keyboard");
        $element.attr({ spellcheck: false });

        $element.on("keydown.keyboard", function (event) {
            var code = event.which || event.keyCode;

            if (isClipboardShortcut(event)) {
                return;
            }

            if (Array.isArray(allowedKeys) && allowedKeys.length > 0 && allowedKeys.indexOf(code) === -1) {
                event.preventDefault();
                return;
            }

            if (trackStats) {
                updateStats(stats, event);
                renderStats(stats);

                if (onStats) {
                    onStats(global.jQuery.extend({}, stats), event);
                }
            }
        });

        if (disableMouse) {
            $element.on("click.keyboard", function () {
                // -- set timer for 1 second to show loading icon

                $element.addClass("loading");

                setTimeout(function () {
                    $element.removeClass("loading");
                }, 600);

                if (typeof global.newGame === "function") {
                    global.newGame();
                }
            });
        }
    }

    if (global.jQuery && !global.jQuery.fn.keyboard) {
        global.jQuery.fn.keyboard = function (options) {
            if (options === "stats") {
                return this.data("keyboard.stats");
            }

            if (options === "resetStats") {
                return this.each(function () {
                    var stats = global.jQuery(this).data("keyboard.stats");

                    if (stats) {
                        stats.characters = 0;
                        stats.newLines = 0;
                        stats.spaces = 0;
                    }
                });
            }

            return this.each(function () {
                bindElement(this, options);
            });
        };
    }

}(typeof window !== "undefined" ? window : this));
