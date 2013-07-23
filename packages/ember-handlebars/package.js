Package.describe({
  summary: "Handlebars for use with Ember"
});

Package.on_use(function (api, where) {

  api.add_files('handlebars.js', 'client', { raw: true });

  // api.exportSymbol('Handlebars', 'client');
});

Package.on_test(function (api) {

});
