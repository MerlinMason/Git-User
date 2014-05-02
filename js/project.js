(function ($) {
    "use strict";

    var gituser = {

        templateurl:     window.location.href + "templates/",
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
                        // If there's no name, set it to the username
                        if (!user.name) {
                            user.name = user.login;
                        }
                        gituser.cache.user = user;
                    }).fail(function (response) {
                        var error;
                        if (response.responseJSON.message) {
                            error = response.responseJSON.message;
                        } else {
                            error = "Sorry, this username doesn't exist!";
                        }
                        gituser.errors.messages.push(error);
                    }),

                    $.get(gituser.api + query + "/repos", function (repos) {
                        gituser.cache.repos = repos;
                    }).fail(function (response) {
                        var error;
                        if (response.responseJSON.message) {
                            error = response.responseJSON.message;
                        } else {
                            error = "Sorry, there's been an error fetching repos for this username!";
                        }
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
                // else if users not types anything show error message
                var error = "Please enter a username!";
                gituser.errors.messages.push(error);
                gituser.renderView(gituser.errors, "error.html", "#result-container");
            }
        },

        serialize: function () {
            var langs = [];

            // Go through all the repos and pop them in a tempory collection
            if (gituser.cache.repos.length) {
                _.each(gituser.cache.repos, function (repo) {

                    var existingLanguage = _.findWhere(langs, { name: repo.language });

                    if (!existingLanguage) {
                        // If this language isn't already in the collection, add it
                        var lang = {};
                        lang.name = repo.language;
                        lang.quantity = 1;

                        langs.push(lang);
                    } else {
                        // If it is, then up the count
                        existingLanguage.quantity++;
                    }
                });
            } else {
                var error = "Sorry, this user doesn't appear to have any public repos :(";
                gituser.errors.messages.push(error);
                gituser.renderView(gituser.errors, "error.html", "#result-container");
                return;
            }

            // Use underscore's _.max to get our most popular language
            gituser.cache.favLang = _.max(langs, function (lang) { return lang.quantity; });
            // Use underscore's _.filter to grab all the other languages
            gituser.cache.otherLangs = _.filter(langs, function (lang) { return lang.name !== gituser.cache.favLang.name; });

            // Now we've got all our data, we can render the template
            gituser.renderView(gituser.cache, "result.html", "#result-container");
        },

        renderView: function (data, template, el, callback) {
            $.get(gituser.templateurl + template, function (template) {
                $(el).html(
                    _.template(template, data)
                );

                if (callback) { callback(); }

                // Clear error cache
                gituser.errors.messages = [];
            });
        }
    };

    // DOM Ready
    $(function () { gituser.init(); });

} (jQuery));
