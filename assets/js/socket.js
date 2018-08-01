import "phoenix_html"
import textFit from "textfit"
import {Socket} from "phoenix"

export var App = {
  run: function() {
    function addSquare(type, number, label_num) {
      let source = document.getElementById('board');

      let square = document.createElement('div');
      square.className = type;
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
      window.states = JSON.parse(states.contents.join(":"));
      if (!window.board_set) {
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
        square.className = square.className.split(" ")[0];
      } else {
        square.className += " selected";
      }
      return number;
    }

    function movePointer(from, to) {
      toggleSquare(from);
      return toggleSquare(to);
    }

    function getNext(from, step) {
      let i = step;
      let square = document.getElementById("cell" + ((from + i) % (window.board_width * window.board_height)).toString());
      while (square.className.includes("filled")) {
        i += step;
        square = document.getElementById("cell" + ((from + i) % (window.board_width * window.board_height)).toString());
      }

      return ((from + i) % (window.board_width * window.board_height));
    }

    function handlePress(e) {
      //Space
      if (e.which === 32) {
        changeText(window.pointer, " ")
        seekNext();
      }
      //Enter
      else if (e.which == 13) {

      }
      //Letters
      else if (65 <= e.which && e.which <= 90) {
        changeText(window.pointer, e.code.slice(-1))
        seekNext();
      }
      //Backspace
      else if (e.which === 8) {
      	seekPrev();
        changeText(window.pointer, " ")
      } else if (e.which === 9) {
        //Tab
        if (!e.shiftKey) {
          alert("tab");
        }
        //Shift-Tab
        else {
          alert("shift tab")
        }
      }
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

      let contents = document.createElement('div');
      contents.className = "contents";
      contents.setAttribute("id", "contents" + number);

      let textNode = document.createTextNode(newText);
      contents.appendChild(textNode);

      let square = document.getElementById("cell" + number);
    	square.insertAdjacentElement("beforeend", contents);

    }
    function seekNext() {
      if (window.pointer ==  window.board_width*window.board_height - 1){
        window.pointer = movePointer(window.pointer, 0)
      } else {
        window.pointer = movePointer(window.pointer, getNext(window.pointer, 1));
      }
      updateClue();
    }

    function seekPrev() {
      if (window.pointer ==  0){
        window.pointer = movePointer(window.pointer, window.board_width*window.board_height - 1)
      } else {
        window.pointer = movePointer(window.pointer, getNext(window.pointer, -1));
      }
      updateClue();
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
      textFit(clue, {alignHoriz: true, alignVert: true, maxFontSize: 25});
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

    }

    main();
  }
}
