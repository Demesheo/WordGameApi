var express = require('express')
var unirest = require('unirest')
var app = express()
require('dotenv').config()


var games = {}

var Game = function(word, id){
  this._id = id
  this.solution = word
  this.result = new Array(word.length)
  this.wrongs = []
  this.life = 10
  this.correct = word.length
}

Game.prototype.checkGuess = function(letter){
  if(this.wrong.indexOf(letter)){
    return "You have already guessed this letter."
  }
  if(this.solution.indexOf(letter) === -1){
    this.wrong.push(letter)
    this.life--
    if(this.life === 0){
      return "Game Over!"
    }
    return "Wrong! This letter is not in the word."
  }
  for(var i = 0; i < this.solution.length; i++){
    if(this.solution[i] === letter){
      this.result[i] = letter
      this.correct++
    }
  }
  if(this.correct === this.solution.length){
    return "You Win!"
  }
  return "Good Guess!"
}

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/newgame', function(req, res) {
  unirest.get("https://wordsapiv1.p.mashape.com/words?frequencymin=8&random=true")
  .header("X-Mashape-Key", process.env.WORDS_API)
  .header("Accept", "application/json")
  .end(function (result) {
    console.log(result.status, result.headers, result.body);
    var id = Date.now()
    var newGame = new Game(result.body.word, id)
    games[id] = newGame
    var gameResult = Object.assign({}, newGame, { solution: undefined, checkGuess: undefined })
    res.send(gameResult)
  });
})


// guess, put request
  // takes a letter game id, checks if challengeWord contains it
  // returns json with updated string currentResult if a correct guess
  // if incorrect guess and guessesLeft > 0, decrements guessesLeft returns 204 status code
  // if guessesLeft = 0, returns 401 status code, which ends the game


// restart, put request
  // takes a game id
  // deletes the game from games
  // creates a new game
  // returns new game json


app.listen(8000, function () {
  console.log('WordGameApi listening on port 8000!')
})
