import "phoenix_html";
import textFit from "textfit";
import {Socket} from "phoenix";
import "confetti-js";

export var App = {
  main: function() {
    //Necessary before 0.1.1 - inform users of finished board

    //EASY

    //LESS EASY
    //TODO implement rebus
    //TODO delete all stored boards periodically

    //HARD
    //TODO keep room open for some minutes - use Channel.terminate callback?
    //TODO support non-square sizes
    //TODO show clues on side for non-mobile

    //LONG TERM
    //TODO implement users, user check to access board
    //TODO support electron / react native?

    function boardFinishedCorrectly() {
      for (let state of states) {
        if (state['ans'] != state.current) {return false;}
      }
      return true;
    }

    function endGame() {
      let settings = {"target":"confetti","max":"500","size":"1","animate":true,"props":["circle","square","triangle","line"],"colors":[[165,104,246],[230,61,135],[0,199,228],[253,214,126]],"clock":"25","width":window.width,"height":window.height};
      let confetti = new ConfettiGenerator(settings);
      confetti.render();

      let dpi = window.devicePixelRatio;
      let canvas = document.getElementById('done');
      let context = canvas.getContext('2d');
      let style_height = +getComputedStyle(canvas).getPropertyValue("height").slice(0, -2);
      let style_width = +getComputedStyle(canvas).getPropertyValue("width").slice(0, -2);
      canvas.setAttribute('height', style_height * dpi);
      canvas.setAttribute('width', style_width * dpi);
      context.font = "60vmin Open Sans";
      context.fillStyle = "blue";
      context.textAlign = "center";
      context.fillText("DONE!", canvas.width/2, canvas.height/2);

      changeTextVis = null;
      changeText = null;
    }

    function revealAll() {
      let i = 0;
      for (let state of states){
        changeText(i, state['ans']);
        i++;
      }
    }

    function forwardKeyPress(key) {
      let e = new Event("keydown");
      if (key === "Backspace"){
        e.key = key;
        e.keyCode = 8;
        e.which = e.keyCode;
        e.code = key;
        console.log(key, e.keyCode);
        document.dispatchEvent(e);
      }
      else if (key === "CheckAll"){
        if (confirm("Check All?")){
          checkAll();
        }
      }
      else if (key === "Rebus") {
        alert("rebus not yet supported");
      }
      else if (key === "RevealAll") {
        if (confirm("Reveal All?")) {
          revealAll();
        }
      }
      else {
        e.key = key;
        e.keyCode = e.key.charCodeAt(0);
        e.which = e.keyCode;
        e.code = "Key" + key;
        console.log(key, e.keyCode);
        document.dispatchEvent(e);
      }
    }

    function handleBackspace() {
      if (window.states[window.pointer].current === " "){
        seekPrev();
        changeText(window.pointer, " ");
      } else {
        changeText(window.pointer, " ");
      }
    }

    function checkAll() {
      let i = -1;
      for (let square of window.states){
        i++;

        if (square.ans === ".") {continue;}

        let ref = document.getElementById("cell"+i);
        let checked = ref.className.split(" ");
        checked[1] = square.current === square.ans ? "correct" : "incorrect";
        ref.className = checked.join(" ");
      }
    }

    function toggleDirection() {
      if (window.direction === "down") {window.direction = "across"}
      else {window.direction = "down"}
    }

    function colorSelected() {
      let num = window.states[window.pointer][window.direction+"_num"];

      let i = 0;
      for (let square of window.states){
        if (square[window.direction+"_num"] === num) {
          let ref = document.getElementById("cell"+i);
          ref.className = ref.className.split(" ").slice(0,2).join(" ") + " selected-clue";
        } else {
          let ref = document.getElementById("cell"+i);
          ref.className = ref.className.split(" ").slice(0,2).join(" ");
        }
        i++;
      }

      document.getElementById("cell"+window.pointer).className =
          document.getElementById("cell"+window.pointer).className.split(" ").slice(0,2).join(" ")
          + " selected";
    }

    function handleClick(e) {
      let square = e.target;
      let num = parseInt(square.id.replace("contents", ""));

      if (window.states[num].ans == ".") {return;}

      if (window.pointer != num){
        movePointer(num);
      } else {
        toggleDirection();
        colorSelected();
      }
      updateClue();
    }

    function addSquare(type, number, label_num) {
      let source = document.getElementById('board');

      let square = document.createElement('div');
      square.className = type +" unchecked";
      square.setAttribute("id", "cell" + number.toString())

      if (label_num != -1) {
        let label = document.createElement('div');
        label.className = "label";
        label.setAttribute("id", "label" + label_num);

        let textNode = document.createTextNode(label_num.toString());
        label.appendChild(textNode);

        square.insertAdjacentElement("beforeend", label);
      }

      source.insertAdjacentElement("beforeend", square);
    }

    function takeStates(states) {
      if (!window.board_set) {
        window.states = JSON.parse(states.contents.join(":"));
        fillBoard();
        window.pointer = toggleSquare(getNext(-1, 1));
        window.direction = "across";
        window.board_set = true;
      }
    }

    function takeClues(clues) {
      let both = JSON.parse(clues.contents);
      window.across_clues = new Map(both[0]);
      window.across_nums = Array.from(window.across_clues.keys());
      window.down_clues = new Map(both[1]);
      window.down_nums = Array.from(window.down_clues.keys());

      updateClue();
      colorSelected();
    }

    function takeDims(dims) {
      let both = JSON.parse(dims.contents);
      window.board_width = both[0];
      window.board_height = both[1];
    }

    function takeUpdate(update) {
      let diff = JSON.parse(update.contents);
      changeTextVis(...diff);
    }

    function setSquareSizes() {
       let filled = `.filled {
        position: relative;
        width: calc(((100%+${2 * window.board_width}px) / ${window.board_width}) - 2px);
        height: calc(((100%+${2 * window.board_height}px) / ${window.board_height}}) - 2px);
        background: black;
        border: 1px solid black;
        padding: 0;
        margin: 0;
        float: left;
      }`;

      let empty = `.empty {
        position: relative;
        width: calc(((100%+${2 * window.board_width}px) / ${window.board_width}) - 2px);
        height: calc(((100%+${2 * window.board_height}px) / ${window.board_height}}) - 2px);
        border: 1px solid black;
        float: left;
      }`;


      let contents = `.contents {
        float: left;
        width: 100%;
        height: 100%;
        text-align: center;
        line-height: ${120 / Math.max(window.board_width, window.board_height)}vmin;
        font-size: ${67.5 / Math.max(window.board_width, window.board_height)}vmin;
        font-weight: 300;
      }`

      let label = `.label {
        position: absolute;
        top: 0px;
        left: 0px;
        width: 0px;
        height: 0px;
        border: 0px solid black;
        padding: 0;
        margin: 0;
        font-size: ${27 / Math.max(window.board_width, window.board_height)}vmin;
        color: black;
      }`

      let sizeControl = document.createElement("style");
      sizeControl.innerText = filled + "\n" + empty + "\n" + contents + "\n" + label;
      document.body.appendChild(sizeControl);

    }

    function fillBoard() {
      setSquareSizes();

      let i = 0;
      for (let square of window.states) {
        let fill = square.ans!="." ? "empty" : "filled";
        let label = square.label;

        addSquare(fill, i, label);
        changeTextVis(i, square.current);
        i++;
      }
    }

    function toggleSquare(number) {
      let square = document.getElementById("cell" + number);
      if (square.className.includes(" selected")) {
        square.className = square.className.split(" ").slice(0,2).join(" ");
      } else {
        square.className += " selected";
      }
      return number;
    }

    function movePointer(to) {
      toggleSquare(window.pointer);
      window.pointer = toggleSquare(to);
      updateClue();
      colorSelected();
    }

    function getNext(from) {
      let row = Math.floor(window.pointer / window.board_width);
      let col = window.pointer % window.board_width;
      let next;

      while (true) {
        if (window.direction === "across") {
          if (col+1 < window.board_width){
            col += 1;
          } else {
            if (row+1 < window.board_height){
              row += 1;
              col = 0;
            } else {
              row = 0;
              col = 0;
              toggleDirection();
            }
          }
        } else {
          if (row+1 < window.board_height){
            row += 1;
          } else {
            if (col+1 < window.board_width){
              col += 1;
              row = 0;
            } else {
              col = 0;
              row = 0;
              toggleDirection();
            }
          }
        }

        next = window.states[row*window.board_width + col];
        if (next.ans != "."){
          return row*window.board_width + col;
        }
      }
    }

    function getPrev(from) {
      let row = Math.floor(window.pointer / window.board_width);
      let col = window.pointer % window.board_width;
      let next;

      while (true) {
        if (window.direction === "across") {
          if (col-1 >= 0){
            col -= 1;
          } else {
            if (row-1 >= 0){
              row -= 1;
              col = window.board_width-1;
            } else {
              row = window.board_width-1;
              col = window.board_height-1;
            }
          }
        } else {
          if (row-1 >= 0){
            row -= 1;
          } else {
            if (col-1 >= 0){
              col -= 1;
              row = window.board_height-1;
            } else {
              row = window.board_width-1;
              col = window.board_height-1;
              toggleDirection();
            }
          }
        }

        next = window.states[row*window.board_width + col];
        if (next.ans != "."){
          return row*window.board_width + col;
        }
      }
    }

    function getNextWordStart(from) {
      let currentClue = parseInt(window.states[from][window.direction+"_num"]);
      let nextClue;

      if (window.direction === "across"){
        let currentIndex = window.across_nums.indexOf(currentClue);
        if (currentIndex+1 < window.across_nums.length) {
          nextClue = window.across_nums[currentIndex+1];
        } else {
          toggleDirection();
          nextClue = window.down_nums[0];
        }
      } else {
        let currentIndex = window.down_nums.indexOf(currentClue);
        if (currentIndex+1 < window.down_nums.length) {
          nextClue = window.down_nums[currentIndex+1];
        } else {
          toggleDirection();
          nextClue = window.across_nums[0];
        }
      }

      let i = 0;
      for (let n of window.states){
        if (n[window.direction + "_num"] === nextClue){
          return i;
        }
        i++;
      }
    }

   function getPrevWordStart(from) {
     let currentClue = parseInt(window.states[from][window.direction+"_num"]);
     let prevClue;

     if (window.direction === "across"){
       let currentIndex = window.across_nums.indexOf(currentClue);
       if (currentIndex > 0) {
         prevClue = window.across_nums[currentIndex-1];
       } else {
         toggleDirection();
         prevClue = window.down_nums.slice(-1)[0];
       }
     } else {
       let currentIndex = window.down_nums.indexOf(currentClue);
       if (currentIndex > 0) {
         prevClue = window.down_nums[currentIndex-1];
       } else {
         toggleDirection();
         prevClue = window.across_nums.slice(-1)[0];
       }
     }

     let i = 0;
     for (let n of window.states){
       if (n[window.direction + "_num"] === prevClue){
         return i;
       }
       i++;
     }
   }

    function handlePress(e) {
      //Space
      if (e.which === 32) {
        e.preventDefault();
        changeText(window.pointer, " ")
        seekNext();
      }
      //Enter
      else if (e.which == 13) {
        checkAll();
      }
      //Left Arrow
      else if (e.which == 37){
        e.preventDefault();
        if (window.direction === "across") {seekPrev()}
        else {
          toggleDirection();
          colorSelected();
        }
      }
      //Right Arrow
      else if (e.which == 39){
        e.preventDefault();
        if (window.direction === "across") {seekNext()}
        else {
          toggleDirection();
          colorSelected();
        }
      }
      //Up Arrow
      else if (e.which == 38){
        e.preventDefault();
        if (window.direction === "down") {seekPrev()}
        else {
          toggleDirection();
          colorSelected();
        }
      }
      //Down Arrow
      else if (e.which == 40){
        e.preventDefault();
        if (window.direction === "down") {seekNext()}
        else {
          toggleDirection();
          colorSelected();
        }
      }
      //Letters
      else if (65 <= e.which && e.which <= 90) {
        changeText(window.pointer, e.code.slice(-1))
        seekNext();
      }
      //Backspace
      else if (e.which === 8) {
        handleBackspace();
      } else if (e.which === 9) {
        e.preventDefault();
        //Tab
        if (!e.shiftKey) {
          seekNextWord();
        }
        //Shift-Tab
        else {
          seekPrevWord();
        }
      }

     updateClue();
    }

    function removeTextVis(number) {
      let square = document.getElementById("cell" + number);

      for (let node of square.childNodes) {
        if (node.className === "contents") {
          square.removeChild(node);
        }
      }
    }

    function changeTextVis(number, newText) {
      removeTextVis(number);

      window.states[number].current = newText;

      let contents = document.createElement('div');
      contents.className = "contents";
      contents.setAttribute("id", "contents" + number);

      let textNode = document.createTextNode(newText);
      contents.appendChild(textNode);

      let square = document.getElementById("cell" + number);
      let checked = square.className.split(" ");
      checked[1] = "unchecked";
      square.className = checked.join(" ");
    	square.insertAdjacentElement("beforeend", contents);

      if (boardFinishedCorrectly()) {
        endGame();
      }

    }

    function seekNext() {
      movePointer(getNext(window.pointer));
    }

    function seekPrev() {
      movePointer(getPrev(window.pointer));
      colorSelected();
    }

    function seekNextWord() {
      movePointer(getNextWordStart(window.pointer));
      colorSelected();
    }

    function seekPrevWord() {
      movePointer(getPrevWordStart(window.pointer));
      colorSelected();
    }

    function changeText(square, newText){
      let update = "set_letter|" + square + "|" + newText;
      window.channel.push("call_in", {call: update});
    }

    function updateClue(){
      let clue = document.getElementById("clue");
      let num = window.states[window.pointer][window.direction + "_num"];
      let map = (window.direction === "across") ? window.across_clues : window.down_clues;

      clue.innerText = num.toString() + ". " + map.get(num);
      textFit(clue, {alignHoriz: true, alignVert: true, maxFontSize: 25, minFontSize: 6});
    }

    function main() {
      window.board_set = false;

      let socket = new Socket("/socket", {params: {token: window.userToken}})
      socket.connect()
      var url = window.location.href.split("/");
      window.channel = socket.channel("board:" + url[url.length - 1],
                                  {name: "Bob"})

      window.channel.join()
        .receive("ok", resp => { console.log("Joined successfully", resp) })
        .receive("error", resp => { console.log("Unable to join", resp) })

      window.channel.on("states", takeStates);
      window.channel.on("clues", takeClues);
      window.channel.on("dims", takeDims);
      window.channel.on("update", takeUpdate);
      document.addEventListener('keydown', handlePress);

      window.channel.push("call_in", {call: "get_dims"});
      window.channel.push("call_in", {call: "get_states"});
      window.channel.push("call_in", {call: "get_clues"});

      document.getElementById("board").onclick = handleClick;

      //if (needsKeyboard()){
      if (true) {
        let oskar = require("oskar");

        let keyMap = {
          0: [
              ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
              [{cap: '?', value: 'CheckAll'},
                'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
              [ {cap: 'See', value: 'RevealAll'},
                {cap: '...', value: 'Rebus'}, 'Z', 'X', 'C', 'V', 'B',
                'N', 'M', {cap: 'Del', value: 'Backspace'}],
              [' ']
             ]
        }
        let kb = oskar({"keys": keyMap, "onkeypress": forwardKeyPress});
        kb.appendTo(document.getElementById("keyboard"));
      }

      document.getElementById("next").onclick = seekNextWord;
      document.getElementById("prev").onclick = seekPrevWord;
      document.getElementById("clue").onclick = () => {
        toggleDirection();
        colorSelected();
        updateClue();
      }
    }

    main();
  }
}
