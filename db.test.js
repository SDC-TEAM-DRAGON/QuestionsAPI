const database = require('./queries');

const db = database.db;
function sum(a, b) {
  return a + b;
}


test('tests count of entries in data', () => {
  return db.query(`select count(product_id) from data`).then((res) => {
    console.log(res);
    var count = res[0].count;
    expect(count).toBe('3518970')
    // db.$pool.end()
  })
});

test('tests count of entries in answers', () => {
  return db.query(`select count(question_id) from answers`).then((res) => {
    console.log(res);
    var count = res[0].count;
    expect(count).toBe('6879306')
    // db.$pool.end()
  })
});

test('tests count of entries in pictures', () => {
  return db.query(`select count(answer_id) from pictures`).then((res) => {
    console.log(res);
    var count = res[0].count;
    expect(count).toBe('2063759')
    // db.$pool.end()
  })
});

test('data returns query', () => {
  return db.query(`select * from data where product_id = 4`).then((res) => {
    console.log(res);
    expect(res.length).toBe(3)
    db.$pool.end()
  })
});