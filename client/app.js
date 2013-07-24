window.Todos = Ember.Application.create();

Todos.Router.map(function () {
  this.resource('todos', { path: '/' }, function () {
    // additional child routes    
    this.route('active');
    this.route('completed');
  });
});

Todos.TodosRoute = Ember.Route.extend({
  model: function () {
    return Todos.Todo.find();
  }
});

Todos.TodosIndexRoute = Ember.Route.extend({
  model: function () {
    return Todos.Todo.find();
  }
});

Todos.TodosActiveRoute = Ember.Route.extend({
  model: function(){
    return Todos.Todo.filter(function (todo) {
      if (!todo.get('isCompleted')) { return true; }
    });
  },
  renderTemplate: function(controller){
    this.render('todos/index', {controller: controller});
  }
});

Todos.TodosCompletedRoute = Ember.Route.extend({
  model: function(){
    return Todos.Todo.filter(function (todo) {
      if (todo.get('isCompleted')) { return true; }
    });
  },
  renderTemplate: function(controller){
    this.render('todos/index', {controller: controller});
  }
});

Todos.Store = DS.Store.extend({
  revision: 12,
  adapter: DS.FixtureAdapter.create()
});

Todos.Todo = DS.Model.extend({
  title: DS.attr('string'),
  isCompleted: DS.attr('boolean')
});

Todos.Todo.FIXTURES = [
  {
    id: 1,
    title: 'Learn Ember.js',
    isCompleted: true
  },
  {
    id: 2,
    title: '...',
    isCompleted: false
  },
  {
    id: 3,
    title: 'Profit!',
    isCompleted: false
  }
];

Todos.TodoController = Ember.ObjectController.extend({
  isEditing: false,

  editTodo: function () {
    this.set('isEditing', true);
  },

  removeTodo: function () {
    var todo = this.get('model');
    todo.deleteRecord();
    todo.save();
  },

  acceptChanges: function () {
    if (this.get('model').get('isSaving')) return;

    this.set('isEditing', false);
    this.get('model').save();
  },

  isCompleted: function(key, value){
    var model = this.get('model');

    if (value === undefined) {
      // property being used as a getter
      return model.get('isCompleted');
    } else {
      // property being used as  setter
      model.set('isCompleted', value);
      model.save();
      return value;
    }
  }.property('model.isCompleted')
});

Todos.TodosController = Ember.ArrayController.extend({
  createTodo: function () {
    // Get the todo title set by the "New Todo" text field
    var title = this.get('newTitle');
    if (!title.trim()) { return; }

    // Create the new Todo model
    var todo = Todos.Todo.createRecord({
      title: title,
      isCompleted: false
    });

    // Clear the "New Todo" text field
    this.set('newTitle', '');

    // Save the new model
    todo.save();
  },

  remaining: function () {
    return this.filterProperty('isCompleted', false).get('length');
  }.property('@each.isCompleted'),

  inflection: function () {
    var remaining = this.get('remaining');
    return remaining === 1 ? 'item' : 'items';
  }.property('remaining'),

  hasCompleted: function () {
    return this.get('completed') > 0;
  }.property('completed'),

  completed: function () {
    return this.filterProperty('isCompleted', true).get('length');
  }.property('@each.isCompleted'),
  
  clearCompleted: function () {
    var completed = this.filterProperty('isCompleted', true);
    completed.invoke('deleteRecord');

    this.get('store').save();
  },

  allAreDone: function (key, value) {
    if (value === undefined) {
      return !!this.get('length') && this.everyProperty('isCompleted', true);
    } else {
      this.setEach('isCompleted', value);
      this.get('store').save();
      return value;
    }
  }.property('@each.isCompleted')
});

Todos.EditTodoView = Ember.TextField.extend({
  classNames: ['edit'],
  insertNewline: function () {
    this.get('controller').acceptChanges();
  },

  focusOut: function () {
    this.get('controller').acceptChanges();
  },

  didInsertElement: function () {
    this.$().focus();
  }
});
