/**

  TODO:
  - Make button shake like electrical current
  - do something better than an alert for right answer.
  - put message about gas range vs electric range and not to worry

 */

$(document).ready(() => {
  let SUITE = (() => {
/**
 * initialize main variables
 * demands is an object to store the values after running through the CEC Rules
 * entries is an object to store the input value from the user
 * answer is well the answer!!
 */
    let demands = {},
      entries = {},
      $unitForm = $('#unit_demands'),
      wrongAnswers = new Set(),
      answer,
    // get buttons
      $check = $('#check'),
      $answer = $('#answer'),
      $addLoad = $('#add-load'),
      $congrats = $('#congrats1'),
      now = new Date();

// set year for copyright

    $('footer').find('.year').text(now.getFullYear());




/**
 * Finds all the extra-load classes from the DOM including newly created ones.
 * @return {list} Extra load values.
 */
    function getExtraLoads() {
      let temArr = [];
      // if the function below is written in arrow form then this get complied as
      // it belonged to the getExtraLoads function instead.
      $('.extra-loads-wrapper .extra-load').each(function () {
        temArr.push($(this).val());
      });
      return temArr;
    }


/**
 * Will insert a new Extra Load input field to the bottom of the others.
 * Returns a function so that I can store the extra load number for the label
 * and id matching!!
 */
    function addExtraLoad() {
      let ex = 2;
      return function () {
        ex++;
        $('.extra-loads-wrapper').append('<div class="form-group"><label ' +
        `for="extra${ex}" class="col-sm-12 col-md-2">` +
        `Extra Load W</label><div ` +
        `class="col-sm-12 col-md-10"><input type="text" class="form-control` +
        ` extra-load" id="extra${ex}" placeholder="1800"></div></div>`);
      };
    }

/**
 * Given an area will calculate rule 8-202(1)(a)(i)(ii)(iii)
 * @param  {string} area From the input field #area
 * @return {number}      demand based off the area.
 */
    function calArea(area) {
      area = parseInt(area, 10);
      if (area <= 45) { return 3500; }
      if (area > 45 && area <= 90) { return 5000; }
      let multiplier = Math.ceil((area - 90) / 90);
      return multiplier > 1 ? 5000 + (1000 * multiplier) : 6000;
    }

/**
 * Given a range in watts will calculate rule 8-202(1)(v)
 * Because this will always return 6000 W even if the demand is 0 which is the
 * case for a gas range. Due to 8-202(1)(a)(vi)(B) in the event of a gas range
 * there is still a need to add 6000 W for future use!
 * @param  {string} range From the input field #range
 * @return {number}       demand based off the range.
 */
    function calRange(range) {
      range = parseInt(range, 10);
      return range <= 12000 ? 6000 : 6000 + ((range - 12000) * 0.4);
    }

/**
 * Takes in an array of extras, will map over that to produce an array of only
 * the "greater than 1500" demands multiplied by 25% and then added together
 * with reduce
 * CEC Rule 8-202(1)(a)(vi)
 * @param  {array} extras only really care about demands above 1500W
 * @return {number}        total demand from the extra loads
 */
    function calExtras(extras) {
      return extras.map((extra) => {
        extra = parseInt(extra, 10);
        return extra > 1500 ? extra * 0.25 : 0;
      }).reduce((prev, curr) => prev + curr);
    }

/**
 * Given the heat and A/C demands will determine which to choose based off of
 * CEC Rule 8-202(1)(a)(iv)
 * @param  {string} heat the demands of the heat
 * @param  {string} ac   the demand of the a/c
 * @return {number}      total demand
 */
    function calHeatAC(heat, ac) {
      heat = parseInt(heat, 10);
      ac = parseInt(ac, 10);
      if (ac > heat) { return ac; }
      if (heat <= 10000) { return heat; }
      return parseInt(((heat - 10000) * 0.75) + 10000, 10);
    }

    function calMinWireAmpacity(wattage, voltage, phase) {
      wattage = parseInt(wattage, 10);
      voltage = parseInt(voltage, 10);
      phase = parseInt(phase, 10);
      return phase === 1 ? (wattage / voltage).toFixed(2) : (wattage /
          (Math.sqrt(3) * voltage)).toFixed(2);
    }

/**
* Finds all the demand values from the DOM elements and assigns to an entries
* object. Fill the demands object with the calculated values using functions
* that represent the CEC Rules
* @return {number} the ampacity to 2 decimal places.
*/
    function calculator() {
      // all values are string from text fields
      entries = {
        area: $unitForm.find('#area').val(),
        range: $unitForm.find('#range').val(),
        heat: $unitForm.find('#heat').val(),
        extras: getExtraLoads(),
        ac: $unitForm.find('#a-c').val(),
        suiteVoltage: $unitForm.find('#suite-voltage').val(),
        suitePhase: $unitForm.find('#suite-phase').val(),
        userAmswer: $('#suite_answer').find('#user-answer').val(),
      };

      // add each total to the demands array
      demands.area = calArea(entries.area);
      demands.range = calRange(entries.range);
      demands.extras = calExtras(entries.extras);
      demands.subTotal = demands.area + demands.range + demands.extras;
      demands.heatAC = calHeatAC(entries.heat, entries.ac);
      demands.suiteTotal = parseInt(demands.heatAC, 10) +
        parseInt(demands.subTotal, 10);
      //console.log("total wattage  " + demands.suiteTotal);
      //console.log("area: " + demands.area);
      //console.log("range " + demands.range);
      //console.log("extra " + demands.extras);
      //console.log("sub " + demands.subTotal);
      //console.log(demands.suiteTotal);
      //console.log("heatAC " + demands.heatAC);
      // find answer!!
      return calMinWireAmpacity(demands.suiteTotal, entries.suiteVoltage,
        entries.suitePhase);
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
/**
* Will call the calculator() function which makes the entries object and fills
* the demands object with the calculated demands
* @return {null}
*/
    function checkAnswer() {
      answer = calculator();
      let attempt = parseInt(entries.userAmswer, 10);
      console.log(answer);
      // check for right answer then do css magic!!
      if (parseInt(answer, 10) === attempt) {
        // add css class to style as well
        displaySuccess(true, false, false);
        wrongAnswers = new Set();
        return true;
      }
      displaySuccess(false, true, false);
      wrongAnswers.add(attempt);
      console.log(wrongAnswers);
      console.log(wrongAnswers.size);
    }

    function giveAnswer() {
      // display answer
      let $displayNode = $('#suite_answer').find('#display-suite-answer');
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



    // on clicks
    $check.click(checkAnswer);
    $answer.click(giveAnswer);
    let i = addExtraLoad();
    $addLoad.click(i);
  }()); // end of SUITE namespace.
});