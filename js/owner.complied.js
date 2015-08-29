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

    /**
     * CEC Rule 8-202(4)
     * Can also be use to calculate the other load demands since they are taken at
     * 100%
     * @param  {string} demand amount for miscellaneous loads
     * @return {number}        total demand
     */
    function calMisc(demand) {
      return parseInt(demand, 10);
    }

    /**
     * Will determine the load demand for the parking stalls base off CEC Rule
     * 8-400(3)(4) When restricted is selected then follow (4), unrestricted uses
     * rule (3)
     * @param  {string} amount how many parking stalls there are
     * @param  {string} the kind of parking stalls either restricted or unrestricted
     * @return {number} demand for the parking stalls in Watts
     */
    function calParking(amount, type) {
      var total = 0,
          x = undefined;
      amount = parseInt(amount, 10);
      if (type === 'unrestricted') {
        if (amount > 60) {
          // get amount over 60
          x = amount - 60;
          // find demand for stalls overs 60
          total += x * 800;
          // update amount
          amount -= x;
        }
        if (amount > 30) {
          x = amount - 30;
          total += x * 1000;
          amount -= x;
        }
        total += amount * 1200;
        return total;
      }
      if (type === 'restricted') {
        if (amount > 60) {
          x = amount - 60;
          total += x * 450;
          amount -= x;
        }
        if (amount > 30) {
          x = amount - 30;
          total += x * 550;
          amount -= x;
        }
        total += amount * 650;
        return total;
      }
      console.log('Something wrong with the parking calculation');
    }

    /**
     * CEC Rule 62-116(4)(b) say any other heating shall be taken at 75%
     * @param  {string} demand the demand from the user in watts
     * @return {number}        total demand for heating
     */
    function calHeat(demand) {
      return parseInt(demand, 10) * 0.75;
    }

    /**
     * takes in an object and will sum the values of the keys in that object.
     * Object.keys return an array then I reduce that array by adding the values to
     * an initial 0 value passed into reduce.
     * @param  {object} object the object which all the values will be summed
     * @return {number}        the total demands from the object
     */
    function sumDemands(object) {
      return Object.keys(object).reduce(function (total, key) {
        return total + parseFloat(object[key]);
      }, 0);
    }

    function calMinWireAmpacity(wattage, voltage, phase, install) {
      wattage = parseInt(wattage, 10);
      voltage = parseInt(voltage, 10);
      phase = parseInt(phase, 10);
      var tmp = phase === 1 ? (wattage / voltage).toFixed(2) : (wattage / (Math.sqrt(3) * voltage)).toFixed(2);
      console.log("tmp " + tmp);
      return install === 'freeair' ? +(tmp / 0.7).toFixed(2) : +(tmp / 0.8).toFixed(2);
    }

    function calculator() {
      var total = 0;
      entries.misc = $('#mis-loads').val();
      entries.parking = $('#parking-demand').val();
      // will be restricted or unrestricted
      entries.parking_type = $('#parking-wrapper').find('input[name=parking]:checked').val();
      entries.heat = $('#owner-heat').val();
      entries.other = $('#other-loads').val();
      entries.voltage = $('#owner-voltage').val();
      entries.phase = $('#owner-phase').val();
      entries.install = $('#install-wrapper').find('input[name=install]:checked').val();
      entries.user_answer = $('#owner-user-answer').val();
      console.log(entries);

      demands.misc = calMisc(entries.misc);
      demands.parking = calParking(entries.parking, entries.parking_type);
      demands.heat = calHeat(entries.heat);
      demands.other = calMisc(entries.other);
      total = sumDemands(demands);
      console.log("total " + calMinWireAmpacity(total, entries.voltage, entries.phase, entries.install));
      return calMinWireAmpacity(total, entries.voltage, entries.phase, entries.install);
    }

    function checkAnswer() {
      answer = calculator();
      var user_attempt = parseInt(entries.user_answer, 10);
      if (parseInt(answer, 10) === user_attempt) {
        alert("YEAH BUDDY!! YOU GOT IT!");
        // add css class to style as well
        return true;
      }

      wrong_answers.add(user_attempt);
      console.log(wrong_answers);
      console.log(wrong_answers.size);

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
