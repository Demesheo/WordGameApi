var express = require('express')
var unirest = require('unirest')
var app = express()
require('dotenv').config()


app.get('/', function (req, res) {
  res.send('Hello World!')
})

// new game, get request
  // starts new game by getting a random word which will be challengeWord
  // returns json with string of zeros with the same length which is currentResult
app.get('/newgame', function(req, res) {
  unirest.get("https://wordsapiv1.p.mashape.com/words?random=true&partofspeech=noun&letterpattern=^[A-z]+$")
  .header("X-Mashape-Key", process.env.WORDS_API)
  .header("Accept", "application/json")
  .end(function (result) {
    console.log(result.status, result.headers, result.body);
    res.send(result.body.word)
  });
})


// guess, post request
  // takes a letter and checks if challengeWord contains it
  // returns json with updated string currentResult if a correct guess
  // if incorrect guess and guessesLeft > 0, decrements guessesLeft returns 204 status code
  // if guessesLeft = 0, returns 401 status code, which ends the game


app.listen(8000, function () {
  console.log('WordGameApi listening on port 8000!')
})
