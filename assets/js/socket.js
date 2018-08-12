import "phoenix_html"
import textFit from "textfit"
import {Socket} from "phoenix"

export var App = {
  main: function() {
    //EASY
    //TODO implement checkAll - use fxn checkALl - DONE
    //TODO implement seekNextWord/seekPrevWord button - DONE
    //TODO make black squares unclickable - DONE
    //TODO fix screen sizing - DONE
    //TODO add backspace and rebus keys - DONE
    //TODO support backspace - DONE

    //LESS EASY
    //TODO implement revealAll
    //TODO support sunday sized boards
    //TODO implement zoom only for board - DONE
    //TODO implement rebus
    //TODO keep room open for some minutes - use Channel.terminate callback

    //TODO keyboard further down, keys bigger

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
        checkAll();
      }
      else if (key === "Rebus") {
        alert("rebus not yet supported");
      }
      else if (key === "RevealAll") {
        alert("reveal not yet supported");
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
      let contents = document.getElementById("contents" + window.pointer)
                             .textContent;

      if (contents === " "){
        seekPrev();
        changeText(window.pointer, " ");
      } else {
        changeText(window.pointer, " ");
      }
    }

    function checkAll() { //FIXME only checks one users letter!
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
      window.down_clues = new Map(both[1]);

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

    function fillBoard() {
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
      let row = Math.floor(window.pointer / window.board_width);
      let col = window.pointer % window.board_width;
      let current = parseInt(window.states[from][window.direction+"_num"]);
      let next;

      while (true) {
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
            current = 0;
          }
        }

        next = window.states[row*window.board_width + col];
        if (next.ans != "." && (parseInt(next[window.direction+"_num"]) > current)){
          return row*window.board_width + col;
        }
      }
    }

    function getPrevWordStart(from) { //FIXME FIX THIS SHIT ITS BROKEN ON DOWNS
      let row = Math.floor(window.pointer / window.board_width);
      let col = window.pointer % window.board_width;
      let current = parseInt(window.states[from][window.direction+"_num"]);
      let next;
      let label;

      while (true) {
        if (col-1 >= 0){
          col -= 1;
        } else {
          if (row-1 >= 0){
            row -= 1;
            col = window.board_width-1;
          } else {
            row = window.board_height-1;
            col = window.board_width-1;
            toggleDirection();
            current = window.board_width*window.board_height+1;
          }
        }

        next = window.states[row*window.board_width + col];
        if (next.ans != "." && (parseInt(next[window.direction+"_num"]) < current)){
          label = parseInt(next[window.direction+"_num"]);
          break;
        }
      }

     let i=0;
     for (let x of window.states){
       if (x[window.direction+"_num"] === label){
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
