
var path = Npm.require('path');

CompileEmberTemplates = function (p, compileStep, contents) {
  // get the path on the other side of templates minus the ext., e.g.
  // 'template/todo/index.html' -> 'todo/index'
  var templateName = p.match(/templates\/(.+)\.(html|handlebars|hbs|hbars)/)[1];
  var precompiled = Package['ember-precompile'].precompile(contents, templateName);

  var path_part = path.dirname(compileStep.inputPath);
  var ext = path.extname(compileStep.inputPath);
  var basename = path.basename(compileStep.inputPath, ext);
  compileStep.addJavaScript({
    path: path.join(path_part, "ember.template." + basename + ".js"),
    sourcePath: compileStep.inputPath,
    data: precompiled
  });
  return;
};
