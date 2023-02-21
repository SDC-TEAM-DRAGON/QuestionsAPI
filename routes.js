const qyrs = require('./queries')

const questData = (req, res, paramID) => {
  // console.log(paramID)
  // qyrs.db.none('SET enable_seqscan = OFF').then(() => {
    // qyrs.db.any(`ALTER TABLE data SET (parallel_workers = 6);`)
    var count = 5;
    var page = 1;
    if (count === undefined) {

    }
    // qyrs.db.any(`set enable_seqscan = off`).then((off)=> {
      // console.log('off', off)
    qyrs.db.any(`select * from data where product_id = $1 order by product_id`, [paramID, count])
    .then((results) => {
      var id = results.id;
      var shaped = {};
      shaped['product_id'] = paramID;
      shaped['results'] = results

      return shaped;
    }).then((shaped) => {
      var promises = [];

      for (var i = 0; i < shaped.results.length; i++) {
        promises.push(qyrs.db.any(`select * from answers where question_id = $1 order by id`, [shaped.results[i].id, count]));
      }

      Promise.all(promises).then((resp) => {
        console.log('explain analyze', resp)

        for (var i = 0; i < resp.length; i++) {
          // console.log('each resp', resp[i]);
          for (var j = 0; j < resp[i].length; j++) {

            for (var l = 0; l < shaped.results.length; l++) {
              if (shaped.results[i].id === resp[i][j].question_id) {
                if (!shaped.results[i].question) {
                  shaped.results[i].question = []
                }
                if (!shaped.results[i].question.includes(resp[i][j])){
                  shaped.results[i].question.push(resp[i][j]);
                }

              }
            }
          }
        }
        return shaped;
      }).then((shaped) => {
        var promises = [];
        var checked = []

        for (var i = 0; i < shaped.results.length; i++) {
          if (shaped.results[i].question) {
            for(var j = 0; j < shaped.results[i].question.length; j ++) {
              if (!checked.includes(shaped.results[i].question[j].id)) {
                promises.push(qyrs.db.any(`select * from pictures where answer_id = $1 order by id`, [shaped.results[i].question[j].id]))
                checked.push(shaped.results[i].question[j].id);
              }
            }
          }
        }
        // console.log('queuing promises', promises);
        Promise.all(promises).then((picResults) => {
          for (var i = 0; i < shaped.results.length; i++) {
            if (shaped.results[i].question) {
              for(var j = 0; j < shaped.results[i].question.length; j ++) {
                for (var x = 0; x < picResults.length; x ++) {
                  if (picResults[x].length > 0) {
                    for (var f = 0; f < picResults[x].length; f ++) {
                      if (picResults[x][f].answer_id === shaped.results[i].question[j].id) {
                        if (shaped.results[i].question[j].photos === undefined) {
                          shaped.results[i].question[j].photos = [];
                        }
                        shaped.results[i].question[j].photos.push(picResults[x][f]);

                      }
                    }

                  }

                }
              }
            }
          }
          return shaped;
        }).then((shaped) => {
          // console.log('final', shaped.results[0].question[0].);
          res.status(200).json(shaped)
        })
      });
    })
  // })




      // qyrs.db.many(`select * from answers where question_id = $1`, [results.id]).then((ansResults) => {
      //   shaped.results.answers = {};
      //   console.log('getting back this: ', ansResults);
      //   for (var i = 0; i < ansResults.length; i++) {
      //     shaped.results.answers[ansResults[i].id] = ansResults[i];
      //     // console.log(ansResults[i].id)
      //   }
      // }).then(() => {
      //   var eachAnswer = shaped.results.answers;
      //   // console.log('each answer', eachAnswer);
      //   // for ( var i = 0; i < shaped.)
      //   var allIds = Object.keys(eachAnswer);
      //   console.log(allIds)
      //   var counter = 0;
      //   allIds.forEach((id, i) => {
      //     shaped.results.answers[allIds[i]].pictures = []
      //     qyrs.db.any(`select * from pictures where answer_id = $1`, [allIds[i]]).then((results)=> {
      //       counter++;
      //       console.log('pictures', results)
      //       console.log('currentID', i)
      //       shaped.results.answers[allIds[i]].pictures.push = 'yolo';
      //     })
      //   })

      // })

    .catch((err) => {
      throw err;
    });
}

const ansData = (req, res, id) => {
  var page = req.query.page;
  var count = req.query.count;
  // console.log('page: ', page, 'count: ', count);
  var shaped = {};
  if (!page) {
    shaped.page = 1
  } else {
    shaped.page = page;
  }
  if (!count) {
    shaped.count = 5;
  } else {
    shaped.count = count;
  }
  qyrs.db.any(`select * from answers where question_id = $1 order by id`, [id]).then((results) => {
    // console.log(results);
    shaped.results = results;
    var promises = [];
    var checked = []
    for (var i = 0; i < shaped.results.length; i++) {
      if (!checked.includes(shaped.results[i].id));
        promises.push(qyrs.db.any(`select * from pictures where answer_id = $1 order by id`, [shaped.results[i].id]));
    }

    Promise.all(promises).then((results) => {
      for (var i = 0; i < shaped.results.length; i++) {
        if (!Array.isArray(shaped.results.photos)) {
          shaped.results[i].photos = [];
        }
        for (var j = 0; j < results.length; j++) {
          for (var x = 0; x < results[j].length; x++) {
            console.log('trying results =', results[j][x], ' ', 'with = ', shaped.results[i].id);
            if (results[j][x].answer_id === shaped.results[i].id) {
              shaped.results[i].photos = results[j]
            }
          }

        }
      }
      // console.log('here cookie', shaped.res);
      res.status(200).json(shaped);
    })
  })

}

const picData = (req, res) => {
  qyrs.db.query('select * from pictures_data', (error, results) => {
    if (error) {
      throw error
    }
    res.status(200).json(results.rows)
  })
}

const addQ = (req,res) => {
  var body = req.body.body;
  var name = req.body.name;
  var email = req.body.email;
  var product_id = req.body.product_id;


  qyrs.db.any(`Select MAX(id) from data`).then((num) => {
    console.log(num[0].max);
    qyrs.db.any(`INSERT INTO data (id, product_id, body, date_written, asker_name, asker_email, reported, helpful) values ($1,$2,$3,$4, $5, $6, $7, $8)`,  [parseInt(num[0].max) + 1, parseInt(product_id), body, Date.now(), name, email, 0, 0]).then((resp) => {
      // console.log('Response', resp);
      return resp;
    }).then((resp) => {
      res.status(200).json('Successfully Created');
    }).catch((err) => {
      console.log(err);
    })
  })

}

const addA = (req, res) => {

}

module.exports = {questData, ansData, picData, addQ, addA};
