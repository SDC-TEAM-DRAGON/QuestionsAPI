const fs = require("fs");
const fastcsv = require("fast-csv");



const promise = require('bluebird'); // or any other Promise/A+ compatible library;

const initOptions = {
    promiseLib: promise // overriding the default (ES6 Promise);
};

const pgp = require('pg-promise')(initOptions);
// See also: http://vitaly-t.github.io/pg-promise/module-pg-promise.html

// Database connection details;
const cn = {
    // host: '18.221.231.160', // 'localhost' is the default;
    host: '18.220.23.177',
    port: 5432, // 5432 is the default;
    database: 'sdc',
    user: 'postgres',
    password: '1234',
    // timeout: 10000

};
var loaded = true;


const db = pgp(cn); // database instance;

if (!loaded) {
db.query(`drop table if exists data`).then((res) => {}).then(() => {


    db.query(`CREATE TABLE IF NOT EXISTS data(
      id SERIAL PRIMARY KEY,
      product_id INT NOT NULL,
      body TEXT NOT NULL ,
      date_written VARCHAR(14) NOT NULL,
      asker_name TEXT NOT NULL,
      asker_email TEXT NOT NULL,
      reported SMALLINT NOT NULL,
      helpful SMALLINT NOT NULL
    )`)}).then((res) => {
      let stream = fs.createReadStream("/Users/mantaqaaoheen/desktop/SDC_Dat/questions.csv");
      let csvData = [];
      let csvStream = fastcsv
        .parse()
        .on("data", function(data) {
          csvData.push(data);
          if (data[0] % 10000 === 0) {
            console.log('a', data[0]);
          }
          // console.log(csvData);
        })
        .on("end", function() {
          // remove the first line: header
          csvData.shift();

          // var query = "INSERT INTO data (id, product_id, body, date_written, asker_name, asker_email, reported, helpful) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
          const cs = new pgp.helpers.ColumnSet(['id', 'product_id', 'body', 'date_written', 'asker_name', 'asker_email', 'reported', 'helpful'], {table: 'data'})

          var obj;
          var container = [];

          for (var i = 0; i< csvData.length; i++) {
            var num = csvData[i][0];
            if (num % 100000 === 0){
              console.log(num)
            }
            // console.log('length', container.length);

            if (container.length <= csvData.length/10000) {
              container.push({id: parseInt(csvData[i][0]), product_id: parseInt(csvData[i][1]), body: csvData[i][2], date_written: csvData[i][3], asker_name: csvData[i][4], asker_email: csvData[i][5], reported: parseInt(csvData[i][6]), helpful: parseInt(csvData[i][7])})
            } else {
              container.push({id: parseInt(csvData[i][0]), product_id: parseInt(csvData[i][1]), body: csvData[i][2], date_written: csvData[i][3], asker_name: csvData[i][4], asker_email: csvData[i][5], reported: parseInt(csvData[i][6]), helpful: parseInt(csvData[i][7])})
              const values = container;
              const query = pgp.helpers.insert(values, cs);

              db.any(query)
              container = []
            }

          }
          if (container.length > 0) {
            const values = container;
            const query = pgp.helpers.insert(values, cs);

            db.any(query)
          }

        });

      stream.pipe(csvStream);
    }).then(() => {
      db.query(`drop table if exists answers`).then((res) => {
        db.query(`CREATE TABLE IF NOT EXISTS answers(
          id SERIAL PRIMARY KEY,
          question_id INT NOT NULL,
          body TEXT NOT NULL,
          date_written VARCHAR(14) NOT NULL,
          answerer_name TEXT NOT NULL,
          answerer_email TEXT NOT NULL,
          reported SMALLINT NOT NULL,
          helpful SMALLINT NOT NULL
        )`)
      }).then((res) => {
          let stream = fs.createReadStream("/Users/mantaqaaoheen/desktop/SDC_Dat/answers.csv");
          let csvData = [];
          let csvStream = fastcsv
            .parse()
            .on("data", function(data) {
              csvData.push(data);
              if (data[0] % 10000 === 0) {
                console.log('b', data[0]);
              }
              // console.log(csvData);
            })
            .on("end", function() {
              // remove the first line: header
              csvData.shift();

              // var query = "INSERT INTO data (id, product_id, body, date_written, asker_name, asker_email, reported, helpful) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
              const cs = new pgp.helpers.ColumnSet(['id', 'question_id', 'body', 'date_written', 'answerer_name', 'answerer_email', 'reported', 'helpful'], {table: 'answers'})

              var obj;
              var container = [];

              for (var i = 0; i< csvData.length; i++) {
                var num = csvData[i][0];
                if (num % 100000 === 0){
                  console.log('loading answers', num)
                }
                // console.log('length', container.length);

                if (container.length <= csvData.length/10000) {
                  container.push({id: parseInt(csvData[i][0]), question_id: parseInt(csvData[i][1]), body: csvData[i][2], date_written: csvData[i][3], answerer_name: csvData[i][4], answerer_email: csvData[i][5], reported: csvData[i][6], helpful: csvData[i][7]})
                } else {
                  container.push({id: parseInt(csvData[i][0]), question_id: parseInt(csvData[i][1]), body: csvData[i][2], date_written: csvData[i][3], answerer_name: csvData[i][4], answerer_email: csvData[i][5], reported: csvData[i][6], helpful: csvData[i][7]})
                  const values = container;
                  const query = pgp.helpers.insert(values, cs);

                  db.any(query)
                  container = []
                }

              }
              if (container.length > 0) {
                const values = container;
                const query = pgp.helpers.insert(values, cs);

                db.any(query);
              }

            });

          stream.pipe(csvStream);
        })
    }).then(() => {
      db.query(`drop table if exists pictures`).then((res) => {
        db.query(`CREATE TABLE IF NOT EXISTS pictures(
          id SERIAL PRIMARY KEY,
          answer_id INT NOT NULL,
          url TEXT NOT NULL
        )`)
      }).then((res) => {
          let stream = fs.createReadStream("/Users/mantaqaaoheen/desktop/SDC_Dat/answers_photos.csv");
          let csvData = [];
          let csvStream = fastcsv
            .parse()
            .on("data", function(data) {
              csvData.push(data);
              if (data[0] % 10000 === 0) {
                console.log('c', data[0]);
              }
              // console.log(csvData);
            })
            .on("end", function() {
              // remove the first line: header
              csvData.shift();

              // var query = "INSERT INTO data (id, product_id, body, date_written, asker_name, asker_email, reported, helpful) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)";
              const cs = new pgp.helpers.ColumnSet(['id', 'answer_id', 'url', ], {table: 'pictures'})

              var obj;
              var container = [];

              for (var i = 0; i< csvData.length; i++) {
                var num = csvData[i][0];
                if (num % 100000 === 0){
                  console.log('loading pictures', num)
                }
                // console.log('length', container.length);

                if (container.length <= csvData.length/10000) {
                  container.push({id: parseInt(csvData[i][0]), answer_id: csvData[i][1], url: csvData[i][2]})
                } else {
                  container.push({id: parseInt(csvData[i][0]), answer_id: csvData[i][1], url: csvData[i][2]})
                  const values = container;
                  const query = pgp.helpers.insert(values, cs);

                  db.any(query)
                  container = []
                }

              }
              if (container.length > 0) {
                const values = container;
                const query = pgp.helpers.insert(values, cs);

                db.any(query);
              }

            });

          stream.pipe(csvStream);
        }).then(() => {
          db.any(`create index if not exists p_id  on data using btree(product_id asc nulls last)`).then(() => {
            db.any(`create index if not exists q_id  on answers using btree(question_id asc nulls last)`).then(() => {
              db.any(`create index if not exists a_id  on pictures using btree(answer_id asc nulls last)`)
            })
          })
        })
    })

  };






module.exports = {db};




