Package.describe({
  summary: "Ember"
});

Package.on_use(function (api, where) {
  api.use('handlebars', 'client');

  api.add_files('ember.js', 'client', { raw: true });

  // api.exportSymbol('Ember', where);
});

Package.on_test(function (api) {

});
