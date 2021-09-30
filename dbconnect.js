var mysql        = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    database: 'feder',
    user: 'root',
    password: '',
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
});

connection.connect(function (error) {
    if (!!error) {
        console.log(error);
    } else {
        console.log('Connected!:)');
    }
});
module.exports = connection;