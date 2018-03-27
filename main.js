var express = require('express')
var unirest = require('unirest')
var app = express()
require('dotenv').config()
app.set('port', process.env.PORT || 8081)
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Methods', 'POST, PUT, GET, OPTIONS')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

var games = {}

var Game = function(word, id){
  this._id = id
  this.solution = word.toUpperCase()
  this.current = new Array(word.length)
  this.wrongs = []
  this.correct = 0
  this.result = "Guess a letter."
}

Game.prototype.checkGuess = function(letter){
  if(this.wrongs.indexOf(letter) > -1 || this.current.indexOf(letter) > -1){
    this.result = "You have already guessed this letter."
    return this
  }
  if(this.solution.indexOf(letter) === -1){
    this.wrongs.push(letter)
    if(this.wrongs.length === 6){
      this.result = "You lose! The word was " + this.solution + "."
      return this
    }
    this.result = "Wrong! This letter is not in the word."
    return this
  }
  for(var i = 0; i < this.solution.length; i++){
    if(this.solution[i] === letter){
      this.current[i] = letter
      this.correct++
    }
  }
  if(this.correct === this.solution.length){
    this.result = "You Win!"
    return this
  }
  this.result = "Good Guess!"
  return this
}

var makeClientGameObj = function(g){
  return Object.assign({}, g, { solution: undefined, checkGuess: undefined })
}

app.get('/', function (req, res) {
  res.status(200).send('Hello World!')
})

app.get('/newgame', function(req, res) {
  unirest.get("https://wordsapiv1.p.mashape.com/words?frequencyMin=6.23&frequencyMax=8.02&random=true&letterPattern=^((?! ).)*$")
  .header("X-Mashape-Key", process.env.WORDS_API)
  .header("Accept", "application/json")
  .end(function (result) {
    console.log(result.status, result.headers, result.body);
    var id = Date.now()
    games[id] = new Game(result.body.word, id)
    var clientGame = makeClientGameObj(games[id])
    res.status(200).json(clientGame)
  });
})

app.put('/guess', function(req, res) {
  console.log("/guess req.body", req.body)
  if(!req.body.letter) return res.status(404).json({error: "A letter is required to be sent."})
  if(!req.body._id) return res.status(404).json({error:"A game id is required to be sent."})
  games[req.body._id].checkGuess(req.body.letter)
  var clientGame = makeClientGameObj(games[req.body._id])
  res.status(200).json(clientGame)
})

app.put('/restart', function(req, res) {
  console.log("/restart req.body", req.body)
  if(!req.body._id) return res.status(404).json({error:"A games id is required to be sent."})
  delete games[req.body._id]
  unirest.get("https://wordsapiv1.p.mashape.com/words?frequencyMin=6.23&frequencyMax=8.02&random=true")
  .header("X-Mashape-Key", process.env.WORDS_API)
  .header("Accept", "application/json")
  .end(function (result) {
    console.log(result.status, result.headers, result.body);
    var id = Date.now()
    games[id] = new Game(result.body.word, id)
    var clientGame = makeClientGameObj(games[id])
    res.status(200).json(clientGame)
  });
})

app.listen(app.get("port"), function () {
  console.log('WordGameApi running')
})
