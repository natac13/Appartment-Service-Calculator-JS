'use strict';

$(document).ready(function () {

  var OWNERS = (function () {
    /**
    * initialize main variables
    * demands is an object to store the values after running through the CEC Rules
    * entries is an object to store the input value from the user
    * wrong_anwers is an Set, when size equal 3 then the user can get the answer
    * answer is well the answer!!
    */
    var demands = {},
        entries = {},
        $owner_form = $('#owner-button-form'),
        wrong_answers = new Set(),
        answer = undefined,

    // get buttons
    $check = $('#owner-check'),
        $answer = $('#owner-answer');

    function calculator() {
      entries.misc = $('#mis-loads').val();
      entries.parking = $('#parking-demand').val();
      // will be restricted or unrestricted
      entries.res_unres = $('#parking-wrapper').find('input[name=parking]:checked').val();
      entries.heat = $('#owner-heat').val();
      entries.other = $('#other-loads').val();
      console.log(entries);
    }

    function checkAnswer() {
      calculator();

      console.log("Test");
    }

    function giveAnswer() {
      // display answer
      var $dis_node = $owner_form.find('#display-owner-answer');
      if (wrong_answers.size < 3) {
        // tried at least 3 different times
        $dis_node.val("You need to try a few answers first!");
        return false;
      }
      $dis_node.val(answer);
      // add css class to the element to show a failure
    }

    // on clicks
    $check.click(checkAnswer);
    $answer.click(giveAnswer);
  })();
});
