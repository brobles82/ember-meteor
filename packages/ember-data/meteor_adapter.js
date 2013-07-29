/**
  @class MeteorSerializer
  @constructor
  @namespace DS
  @extends DS.Serializer
*/

var get = Ember.get, set = Ember.set;

DS.MeteorSerializer = DS.Serializer.extend({
  deserializeValue: function(value, attributeType) {
    return value;
  },

  serializeValue: function(value, attributeType) {
    return value;
  },

  addId: function(data, key, id) {
    data[key] = id;
  },

  addAttribute: function(hash, key, value) {
    hash[key] = value;
  },

  addBelongsTo: function(hash, record, key, relationship) {
    var id = get(record, relationship.key+'.id');
    if (!Ember.isNone(id)) { hash[key] = id; }
  },

  addHasMany: function(hash, record, key, relationship) {
    var ids = get(record, relationship.key).map(function(item) {
      return item.get('id');
    });

    hash[relationship.key] = ids;
  },

  extract: function(loader, fixture, type, record) {
    var references = [];
    if (record) { loader.updateId(record, fixture); }
    this.extractRecordRepresentation(loader, type, fixture);
  },

  extractMany: function(loader, fixtures, type, records) {
    var objects = fixtures, references = [];
    if (records) { records = records.toArray(); }

    for (var i = 0; i < objects.length; i++) {
      if (records) { loader.updateId(records[i], objects[i]); }
      var reference = this.extractRecordRepresentation(loader, type, objects[i]);
      references.push(reference);
    }

    loader.populateArray(references);
  },

  extractId: function(type, hash) {
    var primaryKey = this._primaryKey(type);

    if (hash.hasOwnProperty(primaryKey)) {
      // Ensure that we coerce IDs to strings so that record
      // IDs remain consistent between application runs; especially
      // if the ID is serialized and later deserialized from the URL,
      // when type information will have been lost.
      return hash[primaryKey]+'';
    } else {
      return null;
    }
  },

  extractAttribute: function(type, hash, attributeName) {
    // XXX for some reason `hash` is some times an Array
    // Instead of finding out why just return the first item of the Array
    if (_.isArray(hash)) {
      hash = hash[0];
    }
    var key = this._keyForAttributeName(type, attributeName);
    return hash[key];
  },

  extractHasMany: function(type, hash, key) {
    return hash[key];
  },

  extractBelongsTo: function(type, hash, key) {
    var val = hash[key];
    if (val != null) {
      val = val + '';
    }
    return val;
  },

  extractBelongsToPolymorphic: function(type, hash, key) {
    var keyForId = this.keyForPolymorphicId(key),
        keyForType,
        id = hash[keyForId];

    if (id) {
      keyForType = this.keyForPolymorphicType(key);
      return {id: id, type: hash[keyForType]};
    }

    return null;
  },

  keyForPolymorphicId: function(key) {
    return key;
  },

  keyForPolymorphicType: function(key) {
    return key + '_type';
  }
});

/**
  `DS.MeteorAdapter` is an adapter that uses `Metoer.methods`

  @class FixtureAdapter
  @constructor
  @namespace DS
  @extends DS.Adapter
*/
// @export DS.MeteorAdaptor
DS.MeteorAdapter = DS.Adapter.extend({

  serializer: DS.MeteorSerializer.extend({
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

  findQuery: function(store, type, query, array) {
    var adapter = this;

    var methodName = adapter.methodForType(type, 'find');
    Meteor.call(methodName, query, {}, function (err, result) {
      if (err) {
        adapter.didError(store, type, array, err.message);
        throw new Error(err.message);
      }
      adapter.didFindQuery(store, type, result, array);
    });
  },

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
