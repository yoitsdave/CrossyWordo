export var App = {
  run: function() {
    var old_submit = document.getElementById('old-submit');
    var new_submit = document.getElementById('new-submit');
    var old_name = document.getElementById('old-name');
    var new_name = document.getElementById('new-name');

    old_name.oninput = function() { old_submit.action = "room/" + old_name.value };
    new_name.oninput = function() { new_submit.action = "room/" + new_name.value };

    old_name.addEventListener("keyup", function(event) {
      event.preventDefault();
      if (event.keyCode === 13) {
        document.getElementById("old-submit-btn").click();
      }
    });

    new_name.addEventListener("keyup", function(event) {
      event.preventDefault();
      if (event.keyCode === 13) {
        document.getElementById("new-submit-btn").click();
      }
    });

  }
}
