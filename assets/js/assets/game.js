// Copyright (c) 2022 Steven Ge. All rights reserved.
// Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

// Initialize variables
var result_items = {}
var current_item = ""
var index = 0
var score = 0
var started = false
var timer = "";
var items = [];
var mins = 0;
var seconds = 0;
var gameFontSize = 1

// Reset game
var resetGameVariables = function() {
    result_items = {}
    current_item = ""
    index = 0
    score = 0
    started = false
}

// Initialize game
var initGame = function(title) {
    // Initialize game variables
    resetGameVariables()

    // Set game title add timer elements and obtain timer values
    container.innerHTML = "<p style='text-align:center; font-size:2em'><b>" + title + "</b></p>" + gameSettingsElements()

    // Fetch deck items
    items = data[title]["items"].slice();

    // Keyboard actions
    document.addEventListener('keydown', keyActions);
}

// Go back to main menu
var closeGame = function() {
    resetGameVariables()
    mainMenu()
}

// Construct timer elements with memory
var gameSettingsElements = function() {
    // Use given timer if applicable
    if(timer != "") {
        minsSeconds = timer.split(':')
        mins = minsSeconds[0]
        seconds = minsSeconds[1]
    } else {
        mins = 5
        seconds = 0
    }

    var result = '<p style="text-align:center; font-size:1em"><b>timer</b></p> \
        <form id="timeInput" style="text-align:center; font-size:1em"> \
        <input style="width:20%; display:inline" class="form-control" id="minutesInput" type="number" value="' + mins + '"> Minutes \
        <input style="width:20%; display:inline" class="form-control" id="secondsInput" type="number" value="' + seconds + '"> Seconds \
      </form></br> \
        <p style="text-align:center; font-size:1em"><b>Font size</b></p> \
      <form id="timeInput" style="text-align:center; font-size:1em"> \
        <input style="width:20%; display:inline" class="form-control" id="fontSizeInput" type="number" value="' + gameFontSize + '"> em\
      </form></br> \
      <div> \
        <button id="start-button" onclick="start()" type="button" class="btn btn-sm btn-outline-secondary" style="height:100%; width:100%; font-size:1em"><b>Start</br>(spacebar)</b></button> \
      </div>'

    return result
}

// Define beyboard actions
var keyActions = function(e) {
    if(started) {
        if (e.keyCode == 65){
            nextWord("correct")
        } else if (e.keyCode == 76) {
        nextWord("wrong")
        }
    }
    else  {
    if (e.keyCode == 32) {
        start()
    }
    }
};

// Shuffle deck
var shuffle = function (array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

// Game state change functions
var start = function() {

    // Get the set game values
    mins = document.getElementById("minutesInput").value;
    seconds = document.getElementById("secondsInput").value;
    timer = mins + ":" + seconds
    gameFontSize = document.getElementById("fontSizeInput").value;

    // Shuffle deck
    items = shuffle(items)

    // Set game state to started and construct buttons for the game mechanics
    started = true

    container.innerHTML = ""

    current_item = items.pop()
    container.innerHTML += '<center> \
                                <div id="timer"> \
                                <span id="mins" style="font-weight: bold;">:</span> \
                                <span id="seconds" style="font-weight: bold;"></span>  \
                                </div> \
                            </center>'
    container.innerHTML += "<div style='height:100%; width:100%; font-size:" + gameFontSize + "em;text-align: center;' id='item'><b>" + current_item + "</b></div>"
    container.innerHTML += "<button class='btn btn-sm btn-outline-secondary' onclick='nextWord(" + '"correct"' + ")' style='position:absolute; left:0; top:0; height:100%; width:10%; font-size:1em' id='correct'><b>correct</br>(key: a)</b></button>"
    container.innerHTML += "<button class='btn btn-sm btn-outline-secondary' onclick='nextWord(" + '"wrong"' + ")' style='position:absolute; right:0; top:0; height:100%; width:10%; font-size:1em' id='wrong'><b>skip</br>(key: l)</b></button>"
    container.innerHTML += "<button class='btn btn-sm btn-outline-secondary' onclick='quit()' style='position:absolute; text-align:center; left:45%; bottom:0; height:10%; width:10%; font-size:1em'><b>quit</b></button>"

    // Start sound
    playSound(startAudio)

    // Start timer
    startTimer()
}

// Continue to next word
var nextWord = function(res) {
    // Play sound and add score accordingly
    if(res == "correct") {
        playSound(correctAudio)
        score++
    } else {
        playSound(wrongAudio)
    }
    result_items[index] =  [current_item, res]

    if(items.length == 0) {
        end()
        return
    }

    index += 1;
    current_item = items.pop()
    document.getElementById("item").innerHTML = "<b>" + current_item + "</b>";
}

// End the game
var end = function() {
    var container = document.getElementById("container");
    container.innerHTML = "<p style='font-size:2em; text-align:center; width:100%; font-weight: bold'>Score: " + score + "</p>"
    container.innerHTML += "<button onclick='initGame(" + '"' + title + '"' + ")' style='font-size:1em; text-align:center;' class='btn btn-sm btn-outline-secondary'>Restart</button>"
    container.innerHTML += "<ul class='list-group' id='result'></ul>"
    var res = document.getElementById("result");
    for(let i = 0; i <= index; i++) {
        if(result_items[i][1] == "correct") {
            res.innerHTML += '<li class="list-group-item list-group-item-success">' + result_items[i][0] +'</li>'
        } else if(result_items[i][1] == "wrong") {
            res.innerHTML += '<li class="list-group-item list-group-item-danger">' + result_items[i][0] +'</li>'
        }
    }
    started = false
}

// Game ends before all word have been used
var quit = function() {
    result_items[index] =  [current_item, "wrong"]
    end()
}

// Start timer
async function startTimer(){
  timex = setTimeout(function(){
      seconds--;
    if(seconds < 0){
        seconds = 59;
        mins --;
        if(mins < 0) {
            // Ran out of time
            playSound(outOfTimeAudio)
            quit()
        }
    }

    if(mins<10){
        document.getElementById("mins").innerHTML = '0'+mins+':'
    } else {
        document.getElementById("mins").innerHTML = mins+':'
    }
    if(seconds <10) {
        document.getElementById("seconds").innerHTML = '0'+seconds
    } else {
        document.getElementById("seconds").innerHTML = seconds
      }


      startTimer();
  },1000);
}
