/**
  `DS.MeteorAdapter` is an adapter that uses `Metoer.methods`

  @class FixtureAdapter
  @constructor
  @namespace DS
  @extends DS.Adapter
*/
// @export DS.MeteorAdaptor
DS.MeteorAdapter = DS.Adapter.extend({

  serializer: DS.FixtureSerializer.extend({
    primaryKey: function(type){
      // Use MongoDB `_id` attribute instead of `id`
      return '_id';
    }
  }),

  /*
    Adapter methods
  */
  generateIdForRecord: function(store, record) {
    return Random.id();
  },

  find: function(store, type, id) {
    var adapter = this;

    var methodName = adapter.methodForType(type, 'find');
    Meteor.call(methodName, { _id: id }, {}, function (err, result) {
      if (err) {
        adapter.didError(store, type, record, err.message);
        throw new Error(err.message);
      }
      adapter.didFindRecord(store, type, result, id);
    });
  },

  // TODO
  // findMany: function(store, type, ids) {
  // },

  findAll: function(store, type) {
    var adapter = this;

    var methodName = adapter.methodForType(type, 'find');
    Meteor.call(methodName, {}, {}, function (err, result) {
      if (err) {
        adapter.didError(store, type, record, err.message);
        throw new Error(err.message);
      }
      adapter.didFindAll(store, type, result);
    });
  },

  // TODO
  // findQuery: function(store, type, query, array) {
  // },

  createRecord: function(store, type, record) {
    var adapter = this;

    var serilizedRecord = adapter.serialize(record, { includeId: true });
    var methodName = adapter.methodForType(type, 'insert');
    Meteor.call(methodName, serilizedRecord, function (err, result) {
      if (err) {
        adapter.didError(store, type, record, err.message);
        throw new Error(err.message);
      }

      serilizedRecord._id = result;
      return adapter.didCreateRecord(store, type, record, serilizedRecord);
    });
  },

  updateRecord: function(store, type, record) {
    var adapter = this;

    var id = Ember.get(record, 'id');
    var serilizedRecord = adapter.serialize(record);
    var methodName = adapter.methodForType(type, 'update');
    Meteor.call(methodName, { _id: id }, { $set: serilizedRecord }, function (err, result) {
      if (err) {
        adapter.didError(store, type, record, err.message);
        throw new Error(err.message);
      }
      // TODO find real record incase something was changed by the update
      var recordWithId = adapter.serialize(record, { includeId: true });
      return adapter.didUpdateRecord(store, type, record, recordWithId);
    });
  },

  deleteRecord: function(store, type, record) {
    var adapter = this;

    var id = Ember.get(record, 'id');
    var methodName = adapter.methodForType(type, 'remove');
    Meteor.call(methodName, { _id: id }, function (err) {
      if (err) {
        adapter.didError(store, type, record, err.message);
        throw new Error(err.message);
      }
      return adapter.didDeleteRecord(store, type, record);
    });
  },

  methodForType: function(type, method) {
    var typeString = type.toString();

    Ember.assert("Your model must not be anonymous. It was " + type, typeString.charAt(0) !== '(');

    // use the last part of the name as the URL
    var parts = typeString.split(".");
    var name = parts[parts.length - 1];
    // E.g. 'Todo.find'
    return name.replace(/([A-Z])/g, '_$1').slice(1) + '.' + method;
  }

});
