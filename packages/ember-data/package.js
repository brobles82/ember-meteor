Package.describe({
  summary: "Ember Data"
});

Package.on_use(function (api, where) {
  api.use('random');

  // api.add_files('bower_components/ember-data/ember-data.js', 'client', { bare: true });
  api.add_files('bower_components/ember-data-latest.js/index.js', 'client', { bare: true });
  api.add_files('meteor_adapter.js', 'client');
  // api.add_files('bower_components/ember-localstorage-adapter/localstorage_adapter.js', 'client', { bare: true });
  api.export('ds');
});

Package.on_test(function (api) {

});
