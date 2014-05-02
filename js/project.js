(function ($) {
    "use strict";

    var gituser = {

        templateurl:     window.location.href + "/templates/",
        api: "https://api.github.com/users/",
        cache: {},
        errors: { messages: [] },

        init: function () {
            this.bindUIActions();
        },

        bindUIActions: function () {
            $("#getuser").on("submit", function (e) { gituser.getUser(e); });
        },

        getUser: function (e) {
            e.preventDefault();
            var input = $("#getuser .username");
            var query = $(input).val();

            if (query.length) {
                $.when(

                    $.get(gituser.api + query, function (user) {
                        // If there's no name, set it to username
                        if (!user.name) {
                            user.name = user.login;
                        }
                        gituser.cache.user = user;
                    }).fail(function () {
                        var error = "Sorry, this username doesn't exist!";
                        gituser.errors.messages.push(error);
                    }),

                    $.get(gituser.api + query + "/repos", function (repos) {
                        gituser.cache.repos = repos;
                    }).fail(function () {
                        var error = "Sorry, there's been an error fetching repos for this username!";
                        gituser.errors.messages.push(error);
                        gituser.renderView(gituser.errors, "error.html", "#result-container");
                    })

                ).then(function () {
                    // Clear the input field
                    $(input).val("");
                    // Go through data to get what we need
                    gituser.serialize();
                });
            } else {
                var error = "Please enter a username!";
                gituser.errors.messages.push(error);
                gituser.renderView(gituser.errors, "error.html", "#result-container");
            }
        },

        serialize: function () {
            var langs = [];

            if (gituser.cache.repos.length) {
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
            } else {
                var error = "Sorry, this user doesn't appear to have any public repos :(";
                gituser.errors.messages.push(error);
                gituser.renderView(gituser.errors, "error.html", "#result-container");
                return;
            }

            gituser.cache.favLang = _.max(langs, function (lang) { return lang.quantity; });
            gituser.cache.otherLangs = _.filter(langs, function (lang) { return lang.name !== gituser.cache.favLang.name; });

            // Render the template
            gituser.renderView(gituser.cache, "result.html", "#result-container");
        },

        renderView: function (data, template, el, callback) {
            $.get(gituser.templateurl + template, function (template) {
                $(el).html(
                    _.template(template, data)
                );

                $(el).fadeIn("slow");

                if (callback) { callback(); }

                // Clear error cache
                gituser.errors.messages = [];
            });
        }
    };

    // DOM Ready
    $(function () { gituser.init(); });

} (jQuery));
