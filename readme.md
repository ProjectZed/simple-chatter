# Instructions for server

1. `cd simple-chatter/server`
2. `npm install`
3. Create the directory `chatter-data` at the same level as simple-chatter
4. **Mac/Linux**: Initialize database with `mongod --dbpath chatter-data`
5. In `simple-chatter/server/node_modules/mongo-express/config.default.js`, change `db: 'db'` to `db: 'chatter'`
6. Initialize the database with `node simple-chatter/server/src/resetdatabase.js`
7. Run `node simple-chatter/server/src/server.js`
