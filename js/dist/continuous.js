'use strict';

$(document).ready(function () {
  var TOTAL = (function () {
    var entries = {},
        demands = {},
        wrongAnswers = new Set(),
        $contForm = $('.continuous'),
        answer = undefined;

    function calculator() {
      entries.other = parseInt($contForm.find('#owner-sec-other-loads').val(), 10);
      entries.heat = parseInt($contForm.find('#owner-sec-heating').val(), 10);
      entries.parking = parseInt($contForm.find('#owner-sec-parking').val(), 10);
      entries.userAnswer = parseInt($('#continuous-answer').find('#continuous-user-answer').val(), 10);
      return (entries.other + entries.heat + entries.parking) * 0.75;
    }

    function checkAnswer() {
      answer = calculator();
      console.log(answer);
      var attempt = parseInt(entries.userAnswer, 10);
      console.log('entries.userAnswer ' + entries.userAnswer);
      // check for right answer then do css magic!!
      if (parseInt(answer, 10) === attempt) {
        alert('YEAH BUDDY!! YOU GOT IT!');
        // add css class to style as well
        wrongAnswers = new Set();
        return true;
      }
      console.log(attempt);
      wrongAnswers.add(attempt);
      console.log(wrongAnswers);
    }

    function giveAnswer() {
      // display answer
      var $displayNode = $('#continuous-answer').find('#display-continuous-answer');
      if (wrongAnswers.size < 3) {
        // tried at least 3 different times
        $displayNode.val('You need to try an answer first!');
        return false;
      }
      console.log(answer);
      $displayNode.val(answer);
      wrongAnswers = new Set();
      // add css class to the element to show a failure
    }

    $('#continuous-check').click(checkAnswer);
    $('#con-answer').click(giveAnswer);
  })();
});
//# sourceMappingURL=continuous.js.map