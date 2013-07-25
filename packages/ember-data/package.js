Package.describe({
  summary: "Ember Data"
});

Package.on_use(function (api, where) {
  api.use('random');

  api.add_files('ember-data.js', 'client');
  api.add_files('meteor_adapter.js', 'client');

  api.exportSymbol('DS', where);
});

Package.on_test(function (api) {

});
