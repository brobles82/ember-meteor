/**
  @class MeteorSerializer
  @constructor
  @namespace DS
  @extends DS.Serializer
*/
DS.MeteorSerializer = DS.JSONSerializer.extend({
  primaryKey: '_id',

  deserialize: function(type, data) {
    this._super(type, data)
    data.id = data._id;
    delete data._id;
    return data;
  }
});

/**
  `DS.MeteorAdapter` is an adapter that uses `Metoer.methods`

  @class MeteorAdapter
  @constructor
  @namespace DS
  @extends DS.Adapter
*/
DS.MeteorAdapter = DS.Adapter.extend(Ember.Evented, {

  serializer: DS.MeteorSerializer.create(),
  /*
    Adapter methods
  */
  generateIdForRecord: function(store, record) {
    return Random.id();
  },

  find: function(store, type, id) {
    var adapter = this;

    var methodName = adapter.methodForType(type, 'find');
    return new Ember.RSVP.Promise(function (resolve, reject) {
      Meteor.call(methodName, { _id: id }, {}, function (err, result) {
        if (err) {
          adapter.didError(store, type, record, err.message);
          throw new Error(err.message);
        }
        adapter.didFindRecord(store, type, result, id);
      });
    });
  },

  // TODO
  // findMany: function(store, type, ids) {
  // },

  findAll: function(store, type) {
    var adapter = this;

    var methodName = adapter.methodForType(type, 'find');
    return new Ember.RSVP.Promise(function (resolve, reject) {
      Meteor.call(methodName, {}, {}, function (err, result) {
        if (err) {
          reject(err.message);
        }
        resolve(result);
      });
    });
  },

  findQuery: function(store, type, query, array) {
    var adapter = this;

    var methodName = adapter.methodForType(type, 'find');
    return new Ember.RSVP.Promise(function (resolve, reject) {
      Meteor.call(methodName, query, {}, function (err, result) {
        if (err) {
          reject(err.message);
        }
        resolve(result);
      });
    });
  },

  createRecord: function(store, type, record) {
    var adapter = this;
    var serilizedRecord = adapter.serialize(record, { includeId: true });
    var methodName = adapter.methodForType(type, 'insert');
    return new Ember.RSVP.Promise(function (resolve, reject) {
      Meteor.call(methodName, serilizedRecord, function (err, result) {
        if (err) {
          reject(err.message);
        }
        serilizedRecord.id = result;
        delete serilizedRecord._id;
        resolve(serilizedRecord);
      });
    });
  },

  updateRecord: function(store, type, record) {
    var adapter = this;

    var id = Ember.get(record, 'id');
    var serilizedRecord = adapter.serialize(record);
    var methodName = adapter.methodForType(type, 'update');
    return new Ember.RSVP.Promise(function (resolve, reject) {
      Meteor.call(methodName, { _id: id }, { $set: serilizedRecord }, function (err, result) {
        if (err) {
          reject(err.message);
        }
        // TODO find real record incase something was changed by the update
        // var recordWithId = adapter.serialize(record, { includeId: true });
        // return adapter.didUpdateRecord(store, type, record, recordWithId);
        resolve();
      });
    });
  },

  deleteRecord: function(store, type, record) {
    var adapter = this;

    var id = Ember.get(record, 'id');
    var methodName = adapter.methodForType(type, 'remove');
    return new Ember.RSVP.Promise(function (resolve, reject) {
      Meteor.call(methodName, { _id: id }, function (err) {
        if (err) {
          reject(err.message);
        }
        resolve();
      });
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
