var express = require('express')
var unirest = require('unirest')
var app = express()
require('dotenv').config()


var games = {}

var Game = function(word, id){
  this._id = id
  this.solution = word
  this.current = new Array(word.length)
  this.wrongs = []
  this.life = 10
  this.correct = 0
  this.result = ""
}

Game.prototype.checkGuess = function(letter){
  if(this.wrong.indexOf(letter)){
    this.result = "You have already guessed this letter."
    return this
  }
  if(this.solution.indexOf(letter) === -1){
    this.wrong.push(letter)
    this.life--
    if(this.life === 0){
      this.result = "Game Over!"
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
  unirest.get("https://wordsapiv1.p.mashape.com/words?frequencymin=8&random=true")
  .header("X-Mashape-Key", process.env.WORDS_API)
  .header("Accept", "application/json")
  .end(function (result) {
    console.log(result.status, result.headers, result.body);
    var id = Date.now()
    games[id] = new Game(result.body.word, id)
    var clientGame = makeClientGameObj(games[id])
    res.status(200).send(clientGame)
  });
})

app.put('/guess', function(req, res) {
  console.log("/guess req.body", req.body)
  if(!req.body.letter) return res.status(404).send("A letter is required to be sent.")
  if(!req.body._id) return res.status(404).send("A game id is required to be sent.")
  game[req.body._id].checkGuess(req.body.letter)
  var clientGame = makeClientGameObj(game[req.body._id])
  res.status(200).send(clientGame)
})

app.put('/restart', function(req, res) {
  console.log("/restart req.body", req.body)
  if(!req.body._id) return res.status(404).send("A game id is required to be sent.")
  delete game[req.body._id]
  unirest.get("https://wordsapiv1.p.mashape.com/words?frequencymin=8&random=true")
  .header("X-Mashape-Key", process.env.WORDS_API)
  .header("Accept", "application/json")
  .end(function (result) {
    console.log(result.status, result.headers, result.body);
    var id = Date.now()
    games[id] = new Game(result.body.word, id)
    var clientGame = makeClientGameObj(games[id])
    res.status(200).send(clientGame)
  });
})

app.listen(8000, function () {
  console.log('WordGameApi listening on port 8000!')
})
