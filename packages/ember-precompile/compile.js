//
// Sets up the context needed to use Ember with Node
//

var fs = Npm.require('fs');
var vm = Npm.require('vm');
var path = Npm.require('path');


var getBaseSandbox = function () {
  var jQuery = fs.readFileSync('packages/ember/bower_components/jquery/jquery.js', 'utf8');

  //dummy jQuery
  jQuery = function () { return jQuery };
  jQuery.ready = function () { return jQuery };
  jQuery.inArray = function () { return jQuery };
  jQuery.jquery = "1.8.1";
  jQuery.event = { fixHooks: {} };

  //dummy DOM element
  var element = {
    firstChild: function () { return element },
    innerHTML: function () { return element },
    // needed for "movesWhitespace()" test
    childNodes: [
      {nodeValue: 'Test: '},
      {nodeValue: ''},
      {nodeValue: 'Value'}
    ]
  };

  var sandbox = {
    // DOM
    document: {
      createRange: false,
      createElement: function () { return element }
    },

    // Console
    console: console,

    // jQuery
    jQuery: jQuery,
    $: jQuery,

    // setTimeout is needed by Ember's run loop
    setTimeout: setTimeout
  }

  // window
  sandbox.window = sandbox;

  return sandbox;
}

var getContext = function (sandboxExtras){
  var HANDLEBARSJS = fs.readFileSync('packages/ember/bower_components/handlebars/handlebars.js', 'utf8');
  var EMBERJS = fs.readFileSync('packages/ember/bower_components/ember/ember.js', 'utf8');

  sandbox = getBaseSandbox();
  sandboxExtras = sandboxExtras || {};
  for (var attrname in sandboxExtras){
    sandbox[attrname] = sandboxExtras[attrname];
  }

  // create a context for the vm using the sandbox data
  var context = vm.createContext(sandbox);

  // load Handlebars and Ember into the sandbox
  vm.runInContext(HANDLEBARSJS, context, 'handlebars.js');
  vm.runInContext(EMBERJS, context, 'ember.js');
  return context;
};

// @export precompile
precompile = function (compiledTemplateString, templateName, templateContext) {

  var context = getContext({
    // handlebars template string
    template: compiledTemplateString,

    // compiled handlebars template
    templatejs: null
  });

  // compile the handlebars template inside the vm context
  vm.runInContext('templatejs = Ember.Handlebars.precompile(template).toString()', context);

  var namedTemplateJs = 'Ember.TEMPLATES["' +
    templateName +
    '"] = Ember.Handlebars.template(' + context.templatejs + ');';

  return namedTemplateJs;
};
