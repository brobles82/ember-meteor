Package.describe({
  summary: "Precompile Ember Templates"
});


Package.on_use(function (api) {
  api.use(['jquery', 'ember', 'ember-data', 'ember-handlebars'], 'client');

  api.add_files('compile.js', 'server');
});
