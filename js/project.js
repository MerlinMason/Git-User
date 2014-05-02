(function ($) {
    "use strict";

    var gituser = {

        templateurl:     window.location.href + "/templates/",
        api: "https://api.github.com/users/",
        cache: {},

        init: function () {
            this.bindUIActions();
        },

        bindUIActions: function () {
            $("#getuser").on("submit", function (e) { gituser.getUser(e); });
        },

        getUser: function (e) {
            e.preventDefault();
            var query = $("#getuser .username").val();

            if (query.length) {
                $.when(
                    $.get(gituser.api + query, function (user) {
                        gituser.cache.user = user;
                    }),
                    $.get(gituser.api + query + "/repos", function (repos) {
                        gituser.cache.repos = repos;
                    })
                ).then(function () {
                    console.log(gituser.cache);
                    gituser.renderView(gituser.cache, "result.html", "#result", false);
                });
            }
        },

        renderView: function (data, template, el, callback) {
            $.get(gituser.templateurl + template, function (template) {
                $(el).html(
                    _.template(template, data)
                );

                $(el).fadeIn("slow");

                if (callback) { callback(); }
            });
        },

    };

    // DOM Ready
    $(function () { gituser.init(); });

} (jQuery));
