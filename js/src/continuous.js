$(document).ready(() => {
  let CONTINUOUS = (() => {
    let entries = {},
      demands = {},
      wrongAnswers = new Set(),
      $contForm = $('.continuous'),
      answer,
      $congrats = $('#congrats4');


    function calculator () {
      entries.other = parseInt($contForm.find('#owner-sec-other-loads')
        .val(), 10);
      entries.heat = parseInt($contForm.find('#owner-sec-heating').val(), 10);
      entries.parking = parseInt($contForm.find('#owner-sec-parking').
        val(), 10);
      entries.userAnswer = parseInt($('#continuous-answer')
              .find('#continuous-user-answer').val(), 10);
      return (entries.other + entries.heat + entries.parking) * 0.75;
    }

    function displaySuccess (success, fail, again, gaveup) {
      if (success) {
        $congrats.removeClass('alert-danger');
        $congrats.removeClass('alert-info');
        $congrats.addClass('alert alert-success');
        $congrats.html('<strong>Success</strong>');
      }
      if (fail) {
        $congrats.removeClass('alert-success');
        $congrats.removeClass('alert-info');
        $congrats.addClass('alert alert-danger');
        $congrats.html('<strong>Better luck next time!</strong>');
      }
      if (again) {
        $congrats.removeClass('alert-success');
        $congrats.removeClass('alert-danger');
        $congrats.addClass('alert alert-info');
        $congrats.html('<strong>Just keep trying!</strong>');
      }
    }

    function checkAnswer () {
      answer = calculator();
      console.log(answer);
      let attempt = parseInt(entries.userAnswer, 10);
      console.log('entries.userAnswer '+entries.userAnswer);
      // check for right answer then do css magic!!
      if (parseInt(answer, 10) === attempt) {
        displaySuccess(true, false, false);
        wrongAnswers = new Set();
        return true;
      }
      displaySuccess(false, true, false);
      console.log(attempt);
      wrongAnswers.add(attempt);
      console.log(wrongAnswers);
    }

    function giveAnswer () {
      // display answer
      let $displayNode = $('#continuous-answer')
        .find('#display-continuous-answer');
      if (wrongAnswers.size < 3) {  // tried at least 3 different times
        $displayNode.val('You need to try an answer first!');
        displaySuccess(false, false, true);
        return false;
      }
      displaySuccess(false, true, false);
      $displayNode.val(answer);
      wrongAnswers = new Set();
      // add css class to the element to show a failure
    }

    $('#continuous-check').click(checkAnswer);
    $('#con-answer').click(giveAnswer);
  }());
});