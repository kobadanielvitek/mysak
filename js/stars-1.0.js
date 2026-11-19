/**
 *  STARS - nastavení obtížnosti
 * 
 *  @param data-obtiznost - výchozí obtížnost (0-5) 
 *  @param pocet - počet hvězd (1-5)
 *  @param data-label - popisek před hvězdami
 *  @param data-continous - true: sčítání obtížností, false: přepínání obtížnosti
 * 
 */

(function ($) {

    var stars_methods = {
        init: function () {

            return this.each(function () {

                let me = $(this);

                let obtiznost = num(me.data("data-obtiznost"), 0);
                let pocet = num(me.attr("data-pocet"), 5);
                let continous = me.attr("data-continous");

                let btn_help = $('<button type="button" class="help">?</button>').appendTo(me);

                let div = $("<div></div>").appendTo(me);

                div.addClass("stars_wrap");

                for (let i = 0; i < pocet; i++) {
                    let btn = $('<button type="button" class="star"></button>');
                    let tit = obtiznost_titles[i];

                    // -- remove html tags from the title

                    tit = tit.replace(/<[^>]*>?/gm, '');

                    btn.html(i + 1);
                    btn.attr("title", tit);

                    if (i < obtiznost) {
                        btn.addClass("on");
                    }

                    btn.appendTo(div);

                    btn.click(function () {
                        if (!continous) {
                            $(this).toggleClass("on");
                            gameReload();
                            return;
                        }

                        let ind = $(this).index();

                        if ($(this).hasClass("on")) {
                            ind--;
                        }

                        me.find("button").each(function (j) {
                            if (j <= ind + 1) {
                                $(this).addClass("on");
                            }
                            else {
                                $(this).removeClass("on");
                            }
                        });

                        gameReload();
                    });
                }
            });
        },

        /** Nejvyšší aktivní obtížnost (počet zapnutých hvězd) */
        max: function () {
            return this.find(".stars_wrap button.on").length;
        },

        length: function () {
            return this.find(".stars_wrap button").length;
        },

        /** Stav obtížnosti (hvězdičky) jako pole boolean hodnot */
        list: function () {
            let list = [];

            this.find(".stars_wrap button").each(function () {
                list.push($(this).hasClass("on"));
            });

            return list;
        },

        /** Je daná obtížnost aktivní? */

        is: function (obtiznost) {
            let continous = this.attr("data-continous");
            let starsWrap = this.find(".stars_wrap");

            if (continous) {
                return obtiznost <= starsWrap.find(".on").length;
            }

            return starsWrap.find("button").eq(obtiznost - 1).hasClass("on");
        }
    };

    $.fn.stars = function (method) {
        if (stars_methods[method]) {
            return stars_methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }

        return stars_methods.init.apply(this, arguments);
    };
})(jQuery);