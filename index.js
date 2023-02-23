const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const rt = require('./routes.js')
const port = 3000

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

app.get('/qa/questions', (req, res) => {
  var paramID = (req.query.id);
  var page = (req.query.page);
  var count = (req.query.count);
  // if (page)

  // console.log(page);
  // console.log(paramID);
  rt.questData(req,res, paramID);
});

// app.get('/qa/questions/:id/:page/:count', (req, res) => {
//   var paramID = parseInt(req.params.id.slice(4));
//   var page = parseInt(req.params.page.slice(4));
//   var count = parseInt(req.params.count.slice(4));

//   console.log(page);
//   console.log(paramID);
//   db.questData(req,res, paramID);
// });
app.get('/qa/questions/:question_id/answers', (req, res) => {
  var question_id = req.params.question_id;
  var parsedQID = question_id.slice(13)
  rt.ansData(req, res, parsedQID)
  // res.send(parsedQID);
  // res.status(200);
} )

app.post('/qa/questions', (req, res) => {
  rt.addQ(req,res);
})

app.post('/qa/questions/:question_id/answers', (req, res) => {
  console.log('question Id', req.params.question_id);
  console.log('body', req.body.body);
  console.log('name', req.body.name);
  console.log('email', req.body.email);
  console.log('photos', req.body.photos);
})

app.get('/loaderio-30bbce4fa45e750cdf73c8f38b24af50.txt', (req, res)=> {
  res.sendFile('./loaderio-30bbce4fa45e750cdf73c8f38b24af50.txt')
})

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
})