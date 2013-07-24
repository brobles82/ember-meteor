// TodosModel - Todos makes a better name, but it's taken
// TODO move this to the server
// TODO change name to Todos
TodosModel = new Meteor.Collection('todos');

Meteor.methods({
  'Todo.find': function (selector, options) {
    // perform checks

    // Be sure to call .fetch() to return the records
    return TodosModel.find(selector, options).fetch();
  },

  'Todo.findOne': function (selector, options) {
    // perform checks

    return TodosModel.findOne(selector, options);
  },

  'Todo.insert': function (doc, options) {
    // perform checks

    return TodosModel.insert(doc);
  },

  'Todo.update': function (selector, modifier, options) {
    // perform checks

    return TodosModel.update(selector, modifier, options);
  },

  'Todo.remove': function (selector) {
    // perform checks

    return TodosModel.remove(selector);
  }
});

if (Meteor.isServer) {

  Meteor.startup(function () {
    if (TodosModel.find().count() < 1) {
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
        TodosModel.insert(doc);
      });
    }
  });
  
}
