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
                    }).fail(function () {
                        alert("error fetching user");
                    }),
                    $.get(gituser.api + query + "/repos", function (repos) {
                        gituser.cache.repos = repos;
                    }).fail(function () {
                        alert("error fetching repos");
                    })
                ).then(function () {
                    gituser.discoverFavourites();
                });
            }
        },

        discoverFavourites: function () {
            var langs = [];

            _.each(gituser.cache.repos, function (repo) {

                var existingLanguage = _.findWhere(langs, { name: repo.language });

                if (!existingLanguage) {
                    var lang = {};
                    lang.name = repo.language;
                    lang.quantity = 1;

                    langs.push(lang);
                } else {
                    existingLanguage.quantity++;
                }
            });

            gituser.cache.favLang = _.max(langs, function (lang) { return lang.quantity; });
            gituser.cache.otherLangs = _.filter(langs, function (lang) { return lang.name !== gituser.cache.favLang.name; });
            console.log(gituser.cache);

            gituser.renderView(gituser.cache, "result.html", "#result", false);
        },

        renderView: function (data, template, el, callback) {
            $.get(gituser.templateurl + template, function (template) {
                $(el).html(
                    _.template(template, data)
                );

                $(el).fadeIn("slow");

                if (callback) { callback(); }
            });
        }
    };

    // DOM Ready
    $(function () { gituser.init(); });

} (jQuery));
