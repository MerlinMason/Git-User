(function ($) {
    "use strict";

    var gituser = {

        init: function () {
            this.bindUIActions();
        },

        bindUIActions: function () {
            $(".btn").on("click", function (e) { gituser.sayHello(e); });
        },

        sayHello: function (e) {
            var button = $(e.currentTarget);
            alert("Hello from " + button);
        }

    };

    // DOM Ready
    $(function () { gituser.init(); });

} (jQuery));
