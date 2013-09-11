Package.describe({
  summary: "Ember"
});

Package.on_use(function (api, where) {

  api.use('jquery', 'client');

  api.add_files([
    'bower_components/handlebars/handlebars.js',
    'bower_components/ember/ember.js'
  ], 'client');

  api.export('Handlebars');
  api.export('Ember');
});

Package.on_test(function (api) {

});
