export var App = {
  run: function() {
    var new_submit = document.getElementById('new-submit');
    var old_submit = document.getElementById('old-submit');
    var new_name = document.getElementById('new-name');
    var old_name = document.getElementById('old-name');

    new_name.oninput = function() { new_submit.action = "room/" + new_name.value };
    old_name.oninput = function() { old_submit.action = "room/" + old_name.value };
  }
}
