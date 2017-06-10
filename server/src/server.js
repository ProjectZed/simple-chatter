// Imports the express Node module.
var express = require('express');
// Creates an Express server.
var app = express();
// Parses response bodies.
var bodyParser = require('body-parser');
var CommentSchema = require('./schemas/comment.json');
var validate = require('express-jsonschema').validate;
var ResetDatabase = require('./resetdatabase');

var mongo_express = require('mongo-express/lib/middleware');
// Import the default Mongo Express configuration
var mongo_express_config = require('mongo-express/config.default.js');
var MongoDB = require('mongodb');
var MongoClient = MongoDB.MongoClient;
var ObjectID = MongoDB.ObjectID;
var url = 'mongodb://localhost:27017/chatter';

MongoClient.connect(url, function(err, db) {
  app.use(bodyParser.text());
  app.use(bodyParser.json());
  app.use(express.static('../client/build'));
  app.use('/mongo_express', mongo_express(mongo_express_config));

  /**
   * Get the feed data for a particular user.
   * @param user The ObjectID of the user document.
   */
  function getJoinedConversations(user, callback) {
    db.collection('users').findOne({
      _id: user
    }, function(err, userData) {
      if (err) {
        return callback(err);
      } else if (userData === null) {
        // User not found.
        return callback(null, null);
      }
      callback(null, userData.joined_conversations);
    });
  }

  /**
   * Get the user ID from a token. Returns "" (an invalid ID) if it fails.
   */
  function getUserIdFromToken(authorizationLine) {
    try {
      // Cut off "Bearer " from the header value.
      var token = authorizationLine.slice(7);
      // Convert the base64 string to a UTF-8 string.
      var regularString = new Buffer(token, 'base64').toString('utf8');
      // Convert the UTF-8 string into a JavaScript object.
      var tokenObj = JSON.parse(regularString);
      var id = tokenObj['id'];
      // Check that id is a string.
      if (typeof id === 'string') {
        return id;
      } else {
        // Not a number. Return "", an invalid ID.
        return "";
      }
    } catch (e) {
      // Return an invalid ID.
      return "";
    }
  }

  app.get('/me', function(req, res) {
    var fromUser = getUserIdFromToken(req.get('Authorization'));
    db.collection('users').findOne({
      _id: new ObjectID(fromUser)
    }, function(err, userData) {
      if (err) {
        return res.status(500).send("Database error: " + err);
      } else if (userData === null) {
        return res.status(400).send("Could not look up user " + fromUser);
      }
      res.send(userData);
    });
  })

  /**
   * Get the joined conversations for a particular user.
   */
  app.get('/user/:userid/conversations', function(req, res) {
    var userid = req.params.userid;
    var fromUser = getUserIdFromToken(req.get('Authorization'));
    if (fromUser === userid) {
      // Convert userid into an ObjectID before passing it to database queries.
      getJoinedConversations(new ObjectID(userid), function(err, conversations) {
        if (err) {
          // A database error happened.
          // Internal Error: 500.
          res.status(500).send("Database error: " + err);
        } else if (conversations === null) {
          // Couldn't find the conversations in the database.
          res.status(400).send("Could not look up conversations for user " + userid);
        } else {
          // Send data.
          res.send(conversations);
        }
      });
    } else {
      // 403: Unauthorized request.
      res.status(403).end();
    }
  });

  app.get('/conversations/:convoId/messages', function(req, res) {
    var conversationId = req.params.convoId;
    var fromUser = getUserIdFromToken(req.get('Authorization'));
    db.collection('users').findOne({
      _id: new ObjectID(fromUser)
    }, function(err, userData) {
      if (err) {
        return res.status(500).send("Database error: " + err);
      } else if (userData === null) {
        return res.status(400).send("Could not look up user " + fromUser);
      }
      getConversationMessages(new ObjectID(conversationId), function(err, messages) {
        if (err) {
          // A database error happened.
          // Internal Error: 500.
          res.status(500).send("Database error: " + err);
        } else if (messages === null) {
          // Couldn't find the messages in the database.
          res.status(400).send("Could not look up messages for user " + fromUser);
        } else {
          // Send data.
          res.send(messages);
        }
      });
    });
  });

  /**
   * Get the messages for a particular conversation.
   * @param convoIndex Integer of conversation.
   */
  function getConversationMessages(convoId, callback) {
    db.collection('conversations').findOne({
      _id: convoId
    }, function(err, conversation) {
      if (err) {
        return callback(err);
      } else if (conversation === null) {
        // conversation not found.
        return callback(null, null);
      }
      var messageIds = conversation.sent_messages.map((messageId) => new ObjectID(messageId));
      db.collection('messages').find({
        _id: {
          $in: messageIds
        }
      }).toArray(function(err, messages) {
        if (err) {
          return callback(err);
        }
        resolveAuthor(messages, function(err, userMap) {
          var userList = [];
          messages.forEach((message) => {
            userList.push(userMap[message.author])
          })
          for (var i = 0; i < messages.length; i++) {
            messages[i].author = userList[i];
          }
          return callback(null, messages)
        })
      });
    });
  }

  function resolveAuthor(messageList, cb) {
    if (messageList.length === 0) {
      return cb(null, {})
    }
    var messageIds = messageList.map((message) => new ObjectID(message.author));
    db.collection('users').find({
      _id: {
        $in: messageIds
      }
    }).toArray(function(err, userList) {
      if (err) {
        return cb(err)
      }
      var userMap = {};
      userList.forEach((user) => {
        userMap[user._id] = user;
      });
      cb(null, userMap)
    });
  }

  app.post('/messages', function(req, res) {
    db.collection('conversations').find({}).toArray(function(err, messages) {
      if (err) {
        res.status(500).send("A database error occurred: " + err);
      }
      res.send(messages)
    });
  });

  app.post('/conversations/:convoId/messages', validate({
    body: CommentSchema
  }), function(req, res) {
    var body = req.body;
    var conversationId = req.params.convoId;
    var fromUser = getUserIdFromToken(req.get('Authorization'));
    if (fromUser === body.author) {
      postMessage(new ObjectID(conversationId), new ObjectID(fromUser), body.content, function(err, newMessage) {
        if (err) {
          res.status(500).send("A database error occurred: " + err);
        } else {
          res.status(201);
          res.send(newMessage);
        }
      });
    } else {
      res.status(401).end();
    }
  })

  function postMessage(convoId, authorId, content, callback) {
    var newMessage = {
      "author": authorId,
      "content": content,
      "timestamp": new Date().getTime()
    };
    db.collection('messages').insertOne(newMessage, function(err, result) {
      if (err) {
        return callback(err);
      }
      newMessage._id = result.insertedId;
      db.collection('conversations').updateOne({
        _id: convoId
      }, {
        $push: {
          sent_messages: newMessage._id
        }
      }, function(err) {
        if (err) {
          return callback(err);
        }
        db.collection('users').findOne({
          _id: authorId
        }, function(err, user) {
          if (err) {
            return callback(err);
          }
          newMessage.author = user;
          callback(null, newMessage);
        });
      });
    });
  }

  // Reset the database.
  app.post('/resetdb', function(req, res) {
    console.log("Resetting database...");
    ResetDatabase(db, function() {
      res.send();
    });
  });

  /**
   * Translate JSON Schema Validation failures into error 400s.
   */
  app.use(function(err, req, res, next) {
    if (err.name === 'JsonSchemaValidation') {
      // Set a bad request http response status
      res.status(400).end();
    } else {
      // It's some other sort of error; pass it to next error middleware handler
      next(err);
    }
  });

  // Starts the server on port 3000!
  app.listen(3000, function() {
    console.log('Example app listening on port 3000!');
  });
});
