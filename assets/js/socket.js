import "phoenix_html"
import textFit from "textfit"
import {Socket} from "phoenix"

export var App = {
  main: function() {
    //TODO implement checkAll button
    //TODO implement seekNextWord/seekPrevWord button

    //TODO implement rebus

    function needsKeyboard() {
      var check = false;
      (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
      return check;
    }

    function forwardKeyPress(key) {
      let e = new Event("keydown");
      e.key = key;
      e.keyCode = e.key.charCodeAt(0);
      e.which = e.keyCode;
      e.code = "Key" + key;
      console.log(key, e.keyCode);
      document.dispatchEvent(e);
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

      if (window.pointer != num){
        movePointer(num);
      } else {
        toggleDirection();
        colorSelected();
      }
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
      window.states[square].current = newText;
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

      if (needsKeyboard()){
      //if (true) {
        let oskar = require("oskar");

        let keyMap = {
          0: [
              ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
              ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
              ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
              [' ']
             ]
        }
        let kb = oskar({"keys": keyMap, "onkeypress": forwardKeyPress});
        kb.appendTo(document.getElementById("keyboard"));
      }
    }

    main();
  }
}
