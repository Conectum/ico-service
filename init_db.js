var Database = require('better-sqlite3');
var db = new Database('ico.db');

db.exec("CREATE TABLE log (id integer PRIMARY KEY AUTOINCREMENT, method VARCHAR NOT NULL, status INTEGER NOT NULL, response TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");

db.close();
