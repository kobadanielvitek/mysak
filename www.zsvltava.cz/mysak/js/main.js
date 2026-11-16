/**
 *  Set globals
 */

$(document).ready(function () {

    STARS = $(".stars").stars();

    // $(".stars").stars();

    $(".reload").click(function () {
        gameReload();
    });

    $("#lbl_time").stopwatch(false);

    $("[data-width]").each(function () {
        $(this).css("width", $(this).data("width") + 'vw');
        $(this).css("height", $(this).data("height") + 'vh');
    });

    $("button.help").click(function () {
        showHelp();
    });

    $(".font-setting").fontsetting();

    $("[data-font]").change(function () {

        let event = $(this).data("font");

        const group = $(this).closest(".group");
        const tarea = group.find("textarea");
        const check = $(this).is(":checked");

        if (event === "bold") {
            tarea.css("font-weight", check ? "bold" : "normal");
        }

        if (event === "italic") {
            tarea.css("font-style", check ? "italic" : "normal");
        }

        if (event === "serif") {

            const serif = check ? "serif" : "sans-serif";
            const monospace = $("[data-font='monospace']").is(":checked");

            let font_list = group.find("select[name='fontFamily']");

            if (font_list.length) {
                // -- find the current selected font option
                const selected_font = font_list.val();
                if (serif && selected_font !== "serif") {
                    font_list.val("serif");
                } else if (monospace && selected_font !== "monospace") {
                    font_list.val("monospace");
                }
            }
        }

        if (event === "font") {
            tarea.css("font-family", $(this).val());
        }


        // Handle font family change
    });
});