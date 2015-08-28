$(document).ready(() => {

  let OWNERS = (() => {
  /**
* initialize main variables
* demands is an object to store the values after running through the CEC Rules
* entries is an object to store the input value from the user
* wrong_anwers is an Set, when size equal 3 then the user can get the answer
* answer is well the answer!!
*/
    let demands = {},
      entries = {},
      $owner_form = $('#owner-form'),
      wrong_answers = new Set(),
      answer,
      // get buttons
      $check = $('#owner-check'),
      $answer = $('#owner-answer');


    function checkAnswer() {
      console.log("Test");
    }

    function giveAnswer() {
      // display answer
        let $dis_node = $owner_form.find('#display-owner-answer');
        if (wrong_answers.size < 3) {  // tried at least 3 different times
          $dis_node.val("You need to try a few answers first!");
          return false;
        }
        $dis_node.val(answer);
        // add css class to the element to show a failure
    }

    // on clicks
    $check.click(checkAnswer);
    $answer.click(giveAnswer);

  }());
});