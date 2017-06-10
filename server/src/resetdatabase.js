var ObjectID = require('mongodb').ObjectID;

var databaseName = "chatter";
// Put the initial mock objects here.
var initialData = {
  // The "user" collection. Contains all of the users in our Facebook system.
  "users": {
    // This user has id "1".
    "1": {
      "_id": new ObjectID("000000000000000000000004"),
      "fullName": "Kenny Tsui",
      "joined_conversations": [new ObjectID("000000000000000000000001")]
    }
  },
  "conversations": {
    "1": {
      "_id": new ObjectID("000000000000000000000001"),
      "sent_messages": [new ObjectID("000000000000000000000001")]
    }
  },
  "messages": {
    "1": {
      "_id": new ObjectID("000000000000000000000001"),
      "author": new ObjectID("000000000000000000000004"),
      "content": "Hello!",
      "timestamp": 1497106982973
    }
  }
};

/**
 * Resets a collection.
 */
function resetCollection(db, name, cb) {
  // Drop / delete the entire object collection.
  db.collection(name).drop(function() {
    // Get all of the mock objects for this object collection.
    var collection = initialData[name];
    var objects = Object.keys(collection).map(function(key) {
      return collection[key];
    });
    // Insert objects into the object collection.
    if (objects.length > 0) {
      db.collection(name).insertMany(objects, cb);
    } else {
      cb();
    }
  });
}

/**
 * Reset the MongoDB database.
 * @param db The database connection.
 */
function resetDatabase(db, cb) {
  // The code below is a bit complex, but it basically emulates a
  // "for" loop over asynchronous operations.
  var collections = Object.keys(initialData);
  var i = 0;

  // Processes the next collection in the collections array.
  // If we have finished processing all of the collections,
  // it triggers the callback.
  function processNextCollection() {
    if (i < collections.length) {
      var collection = collections[i];
      i++;
      // Use myself as a callback.
      resetCollection(db, collection, processNextCollection);
    } else {
      addIndexes(db, cb);
    }
  }

  // Start processing the first collection!
  processNextCollection();
}

// Check if called directly via 'node', or required() as a module.
// http://stackoverflow.com/a/6398335
if (require.main === module) {
  // Called directly, via 'node src/resetdatabase.js'.
  // Connect to the database, and reset it!
  var MongoClient = require('mongodb').MongoClient;
  var url = 'mongodb://localhost:27017/' + databaseName;
  MongoClient.connect(url, function(err, db) {
    if (err) {
      throw new Error("Could not connect to database: " + err);
    } else {
      console.log("Resetting database...");
      resetDatabase(db, function() {
        console.log("Database reset!");
        // Close the database connection so NodeJS closes.
        db.close();
      });
    }
  });
} else {
  // require()'d.  Export the function.
  module.exports = resetDatabase;
}

/**
 * Adds any desired indexes to the database.
 */
function addIndexes(db, cb) {
  db.collection('feedItems').createIndex({
    "contents.contents": "text"
  }, null, cb);
}
