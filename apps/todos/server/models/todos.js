Todos = new Meteor.Collection('todos');

Meteor.methods({
  'Todo.find': function (selector, options) {
    // perform checks

    // Be sure to call .fetch() to return the records
    return Todos.find(selector, options).fetch();
  },

  'Todo.insert': function (doc, options) {
    // perform checks

    return Todos.insert(doc);
  },

  'Todo.update': function (selector, modifier, options) {
    // perform checks

    return Todos.update(selector, modifier, options);
  },

  'Todo.remove': function (selector) {
    // perform checks

    return Todos.remove(selector);
  }
});

if (Meteor.isServer) {

  Meteor.startup(function () {
    if (Todos.find().count() < 1) {
      Meteor._debug('Adding some fixtures');
      // Add some fixtures
      var t = [
        {
          title: 'Learn Ember.js',
          isCompleted: true
        },
        {
          title: '...',
          isCompleted: false
        },
        {
          title: 'Profit!',
          isCompleted: false
        }
      ];
      _.each(t, function (doc) {
        Todos.insert(doc);
      });
    }
  });
  
}
