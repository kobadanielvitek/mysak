/**
 *  JQUERY PLUGIN 
 * 
 *  FONT SETTING
 * 
 *  Usage:
 * 
 *    $("element").fontsetting();
 * 
 */

(function (global) {
    "use strict";

    const font_list = [
        {
            name: "Arial", serif: 0, monospace: 0
        },
        {
            name: "Times New Roman", serif: 1, monospace: 0
        },
        {
            name: "Georgia", serif: 1, monospace: 0
        },
        {
            name: "Courier New", serif: 1, monospace: 1
        },
        {
            name: "Verdana", serif: 0, monospace: 0
        },
        {
            name: "Tahoma", serif: 0, monospace: 0
        },
        {
            name: "Impact", serif: 0, monospace: 0
        },
        {
            name: "Lucida Console", serif: 0, monospace: 1
        },
        {
            name: "Trebuchet MS", serif: 0, monospace: 0
        },
        {
            name: "Palatino Linotype", serif: 1, monospace: 0
        },
        {
            name: "Garamond", serif: 1, monospace: 0
        },
        {
            name: "Book Antiqua", serif: 1, monospace: 0
        },
        {
            name: "Helvetica", serif: 0, monospace: 0
        },
        {
            name: "Symbol", serif: 0, monospace: 0
        },
        {
            name: "Comic Sans MS", serif: 0, monospace: 0
        },
        {
            name: "Calibri", serif: 0, monospace: 0
        },
        {
            name: "Futura", serif: 1, monospace: 0
        },
        {
            name: "Franklin Gothic", serif: 0, monospace: 0
        },
        {
            name: "Bahnschrift", serif: 0, monospace: 0
        },
        {
            name: "Candara", serif: 0, monospace: 0
        },
        {
            name: "Segoe UI", serif: 0, monospace: 0
        },
        {
            name: "Lucida Handwriting", serif: 0, monospace: 0
        },
        {
            name: "Segoe Script", serif: 0, monospace: 0
        },
        {
            name: "Consolas", serif: 0, monospace: 1
        }
    ];

    function setFontFamily($element, $settings) {

        let fontName = $settings.fontList.val();

        console.log("Selected font:", fontName);

        if (fontName) {

console.log($settings.areas);

            $settings.areas.css("font-family", fontName);
            $settings.areas.attr("placeholder", fontName);
        }
    }

    function setFontSettings($element, $settings) {

        let x;
        let options = {
            monospace: false,
            serif: null,
        }

        x = $element.find("[name='fontSerif[]']:checked");

        if (x.val() != undefined) {
            options.serif = x.val();
        }

        x = $element.find("[name='fontMonospace']:checked");

        if (x.length) {
            options.monospace = x.is(":checked");
        }

        if ($settings.fontList.length) {

            $settings.fontList.empty();

            const sortedFonts = font_list.slice().sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });

            for (const font of sortedFonts) {

                if (options.serif !== null) {
                    if (options.serif == 'serif' && font.serif == 0) {
                        continue;
                    }

                    if (options.serif == 'sans' && font.serif == 1) {
                        continue;
                    }
                }

                if (options.monospace && font.monospace == 0) {
                    continue;
                }

                const option = global.jQuery("<option>")
                    .val(font.name)
                    .text(font.name)
                    .data("serif", font.serif)
                    .data("monospace", font.monospace);

                $settings.fontList.append(option);
            }

            setFontFamily($element, $settings);
        }

        // --

        if ($settings.weight.length) {
            $settings.areas.css("font-weight", $settings.weight.val());
        }
        if ($settings.style.length) {
            $settings.areas.css("font-style", $settings.style.val());
        }
    }

    function bindElement(element, options) {

        options = options || {};

        let $element = global.jQuery(element);

        let $settings = {
            monospace: $element.find("[name='fontMonospace']"),
            serif: $element.find("[name='fontSerif[]']"),
            fontList: $element.find("select[name='fontFamily']"),
            weight: $element.find("[name='fontWeight']"),
            style: $element.find("[name='fontStyle']"),
            areas: $element.find("textarea, input[type='text']")
        };

        if ($settings.fontList.length) {
            $settings.fontList.on("change", function () {
                setFontFamily($element, $settings);
            });
        }

        $element.on("change", "input[data-font]", function () {
            setFontSettings($element, $settings);
        });

        setFontSettings($element, $settings);
    }

    if (global.jQuery && !global.jQuery.fn.fontsetting) {
        global.jQuery.fn.fontsetting = function (options) {
            return this.each(function () {
                bindElement(this, options);
            });
        };
    }

}(typeof window !== "undefined" ? window : this));