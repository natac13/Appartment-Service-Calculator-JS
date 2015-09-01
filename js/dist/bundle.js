'use strict';

$(document).ready(function () {
  var CONTINUOUS = (function () {
    var entries = {},
        demands = {},
        wrongAnswers = new Set(),
        $contForm = $('.continuous'),
        answer = undefined,
        $congrats = $('#congrats4');

    function calculator() {
      entries.other = parseInt($contForm.find('#owner-sec-other-loads').val(), 10);
      entries.heat = parseInt($contForm.find('#owner-sec-heating').val(), 10);
      entries.parking = parseInt($contForm.find('#owner-sec-parking').val(), 10);
      entries.userAnswer = parseInt($('#continuous-answer').find('#continuous-user-answer').val(), 10);
      return (entries.other + entries.heat + entries.parking) * 0.75;
    }

    function displaySuccess(success, fail, again, gaveup) {
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

    function checkAnswer() {
      answer = calculator();
      console.log(answer);
      var attempt = parseInt(entries.userAnswer, 10);
      console.log('entries.userAnswer ' + entries.userAnswer);
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

    function giveAnswer() {
      // display answer
      var $displayNode = $('#continuous-answer').find('#display-continuous-answer');
      if (wrongAnswers.size < 3) {
        // tried at least 3 different times
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
  })();
});
/**

  TODO:
  - Make button shake like electrical current
  - do something better than an alert for right answer.
  - put message about gas range vs electric range and not to worry

 */

'use strict';

$(document).ready(function () {
  var SUITE = (function () {
    /**
     * initialize main variables
     * demands is an object to store the values after running through the CEC Rules
     * entries is an object to store the input value from the user
     * answer is well the answer!!
     */
    var demands = {},
        entries = {},
        $unitForm = $('#unit_demands'),
        wrongAnswers = new Set(),
        answer = undefined,

    // get buttons
    $check = $('#check'),
        $answer = $('#answer'),
        $addLoad = $('#add-load'),
        $congrats = $('#congrats1');

    /**
     * Finds all the extra-load classes from the DOM including newly created ones.
     * @return {list} Extra load values.
     */
    function getExtraLoads() {
      var temArr = [];
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
      var ex = 2;
      return function () {
        ex++;
        $('.extra-loads-wrapper').append('<div class="form-group"><label ' + ('for="extra' + ex + '" class="col-sm-12 col-md-2">') + 'Extra Load W</label><div ' + 'class="col-sm-12 col-md-10"><input type="text" class="form-control' + (' extra-load" id="extra' + ex + '" placeholder="1800"></div></div>'));
      };
    }

    /**
     * Given an area will calculate rule 8-202(1)(a)(i)(ii)(iii)
     * @param  {string} area From the input field #area
     * @return {number}      demand based off the area.
     */
    function calArea(area) {
      area = parseInt(area, 10);
      if (area <= 45) {
        return 3500;
      }
      if (area > 45 && area <= 90) {
        return 5000;
      }
      var multiplier = Math.ceil((area - 90) / 90);
      return multiplier > 1 ? 5000 + 1000 * multiplier : 6000;
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
      return range <= 12000 ? 6000 : 6000 + (range - 12000) * 0.4;
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
      return extras.map(function (extra) {
        extra = parseInt(extra, 10);
        return extra > 1500 ? extra * 0.25 : 0;
      }).reduce(function (prev, curr) {
        return prev + curr;
      });
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
      if (ac > heat) {
        return ac;
      }
      if (heat <= 10000) {
        return heat;
      }
      return parseInt((heat - 10000) * 0.75 + 10000, 10);
    }

    function calMinWireAmpacity(wattage, voltage, phase) {
      wattage = parseInt(wattage, 10);
      voltage = parseInt(voltage, 10);
      phase = parseInt(phase, 10);
      return phase === 1 ? (wattage / voltage).toFixed(2) : (wattage / (Math.sqrt(3) * voltage)).toFixed(2);
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
        userAmswer: $('#suite_answer').find('#user-answer').val()
      };

      // add each total to the demands array
      demands.area = calArea(entries.area);
      demands.range = calRange(entries.range);
      demands.extras = calExtras(entries.extras);
      demands.subTotal = demands.area + demands.range + demands.extras;
      demands.heatAC = calHeatAC(entries.heat, entries.ac);
      demands.suiteTotal = parseInt(demands.heatAC, 10) + parseInt(demands.subTotal, 10);
      //console.log("total wattage  " + demands.suiteTotal);
      //console.log("area: " + demands.area);
      //console.log("range " + demands.range);
      //console.log("extra " + demands.extras);
      //console.log("sub " + demands.subTotal);
      //console.log(demands.suiteTotal);
      //console.log("heatAC " + demands.heatAC);
      // find answer!!
      return calMinWireAmpacity(demands.suiteTotal, entries.suiteVoltage, entries.suitePhase);
    }

    function displaySuccess(success, fail, again, gaveup) {
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
      var attempt = parseInt(entries.userAmswer, 10);
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
      var $displayNode = $('#suite_answer').find('#display-suite-answer');
      if (wrongAnswers.size < 3) {
        // tried at least 3 different times
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
    var i = addExtraLoad();
    $addLoad.click(i);
  })(); // end of SUITE namespace.
});
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
        $ownerForm = $('#owner-form'),
        wrongAnswers = new Set(),
        answer = undefined,

    // get buttons
    $check = $('#owner-check'),
        $answer = $('#owner-answer'),
        $congrats = $('#congrats2');

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
      return install === 'freeair' ? +(tmp / 0.7).toFixed(2) : +(tmp / 0.8).toFixed(2);
    }

    function calculator() {
      var total = 0;
      entries.misc = $ownerForm.find('#mis-loads').val();
      entries.parking = $ownerForm.find('#parking-demand').val();
      // will be restricted or unrestricted
      entries.parkingType = $ownerForm.find('#parking-wrapper').find('input[name=parking]:checked').val();
      entries.heat = $ownerForm.find('#owner-heat').val();
      entries.other = $ownerForm.find('#other-loads').val();
      entries.voltage = $ownerForm.find('#owner-voltage').val();
      entries.phase = $ownerForm.find('#owner-phase').val();
      entries.install = $('#install-wrapper').find('input[name=install]:checked').val();
      entries.userAnswer = $('#owner-user-answer').val();
      console.log(entries);

      demands.misc = calMisc(entries.misc);
      demands.parking = calParking(entries.parking, entries.parkingType);
      demands.heat = calHeat(entries.heat);
      demands.other = calMisc(entries.other);
      total = sumDemands(demands);
      console.log('total ' + calMinWireAmpacity(total, entries.voltage, entries.phase, entries.install));
      return calMinWireAmpacity(total, entries.voltage, entries.phase, entries.install);
    }

    function displaySuccess(success, fail, again, gaveup) {
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

    function checkAnswer() {
      answer = calculator();
      var attempt = parseInt(entries.userAnswer, 10);
      if (parseInt(answer, 10) === attempt) {
        displaySuccess(true, false, false);
        wrongAnswers = new Set();
        return true;
      }
      displaySuccess(false, true, false);
      wrongAnswers.add(attempt);
      console.log(wrongAnswers);
      console.log(wrongAnswers.size);

      console.log('Test');
    }

    function giveAnswer() {
      // display answer
      var $displayNode = $('#owner-button-form').find('#display-owner-answer');
      if (wrongAnswers.size < 3) {
        // tried at least 3 different times
        $displayNode.val('You need to try a few answers first!');
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
  })();
});
'use strict';

Array.prototype.concatAll = function () {
  var results = [];
  this.forEach(function (innerArray) {
    results.push.apply(results, innerArray);
  });
  return results;
};

$(document).ready(function () {
  var TOTAL = (function () {
    var entries = {},
        demands = {},
        wrongAnswers = new Set(),
        answer = undefined,
        $congrats = $('#congrats3');

    function addNewUnit() {
      var ex = 3;
      return function () {
        ex++;
        $('#total-form').find('.unit-info').last().closest('.row').after('<div class="row"><div class="form-group unit-info"><label ' + ('for="unit-demand-' + ex + '" class="col-sm-12 col-md-2">') + ('Unit ' + ex + ' Subtotal Demand</label>') + '<div class="col-sm-12 col-md-2"><input type="text" ' + 'class="form-control" ' + ('id="unit-demand-' + ex + '" placeholder="10000" name="demand"></div>') + ('<label for="unit-count-' + ex + '" class="col-sm-12 col-md-2">') + ('Unit ' + ex + ' Count</label>') + '<div class="col-sm-12 col-md-2"><input type="text" ' + 'class="form-control" ' + ('id="unit-count-' + ex + '" placeholder="2" name="count"></div>') + ('<label for="unit-heat-' + ex + '" class="col-sm-12 col-md-2">') + ('Unit ' + ex + ' Heat Demand (W)') + '</label><div class="col-sm-12 col-md-2"><input type="text" ' + ('class="form-control" id="unit-heat-' + ex + '" placeholder="8000" ') + 'name="heat"></div></div></div>');
      };
    }

    /**
     * tmp is an array of array that looks like [[12000,3],[15000,2],[10000,1]]
     * first value is the demand of the unit and the second is how many
     * will sort base off the first value then map to produce an array of just
     * demands in order for how many of each on.
     * map over the array of arrays to make array of arrays this time each inner
     * array has an element of the demand for how many unit there were(second value)
     * afterward use concatAll() to flatten the array.
     * highest demand first!!!
     * reduce to sum the values based off the CEC Rule 8-202(3)(a)
     * first unit 100%, 2 & 3 at 65%, 4 & 5 at 40%, 6 - 20 at 25%, rest at 10%
     * @return {array} demands for all the units in order.
     */
    function calUnitDemands() {
      var tmp = [],
          $x = $('#total-form');
      $x.find('.unit-info').each(function () {
        tmp.push([parseInt($(this).find('input[name="demand"]').val(), 10), parseInt($(this).find('input[name="count"]').val(), 10)]);
      });
      // Main return
      return tmp.sort(function (a, b) {
        if (a[0] === b[0]) {
          return 0;
        }
        return b[0] - a[0];
      }).map(function (unitArray) {
        var ans = [];
        for (var i = 0; i < unitArray[1]; i++) {
          ans.push(unitArray[0]);
        }
        return ans;
      }).concatAll().reduce(function (final, dem, index) {
        if (index === 0) {
          return final + dem;
        }
        if (index === 1 || index === 2) {
          return final + dem * 0.65;
        }
        if (index === 3 || index === 4) {
          return final + dem * 0.40;
        }
        if (index > 4 && index <= 19) {
          return final + dem * 0.25;
        }
        return final + dem * 0.10;
      }, 0);
    }

    function calUnitHeat() {
      var tmp = [],
          totalDemand = undefined,
          $x = $('#total-form');
      $x.find('.unit-info').each(function () {
        tmp.push([parseInt($(this).find('input[name="heat"]').val(), 10), parseInt($(this).find('input[name="count"]').val(), 10)]);
      });
      totalDemand = tmp.map(function (unitArray) {
        var ans = [];
        for (var i = 0; i < unitArray[1]; i++) {
          ans.push(unitArray[0]);
        }
        return ans;
      }).concatAll().reduce(function (ans, curr) {
        return ans + curr;
      }, 0);

      return totalDemand !== 0 ? (totalDemand - 10000) * 0.75 + 10000 : 0;
    }

    function calculator() {
      demands.units = calUnitDemands();
      demands.heat = calUnitHeat();
      entries.userAnswer = $('#total-form').find('#total-user-answer').val();
      console.log('demands.units ' + demands.units);
      console.log('demands.heat ' + demands.heat);

      return demands.heat + demands.units;
    }

    function displaySuccess(success, fail, again, gaveup) {
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

    function checkAnswer() {
      answer = calculator();
      console.log('answer ' + answer);
      var attempt = parseInt(entries.userAnswer, 10);
      console.log('entries.userAnswer ' + entries.userAnswer);
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

    function giveAnswer() {
      // display answer
      var $displayNode = $('#total-form').find('#display-total-answer');
      if (wrongAnswers.size < 3) {
        // tried at least 3 different times
        $displayNode.val('You need to try an answer first!');
        displaySuccess(false, false, true);
        return false;
      }
      displaySuccess(false, true, false);
      $displayNode.val(answer);
      wrongAnswers = new Set();
      // add css class to the element to show a failure
    }

    $('#total-check').click(checkAnswer);
    $('#total-answer-btn').click(giveAnswer);
    var addUnit = addNewUnit();
    $('#add-unit').click(addUnit);
  })();
});

//# sourceMappingURL=bundle.js.map