Package.describe({
  summary: "Ember Data"
});

Package.on_use(function (api, where) {

  api.add_files('ember-data.js', 'client');

  api.exportSymbol('DS', where);
});

Package.on_test(function (api) {

});
