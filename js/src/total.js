
Array.prototype.concatAll = function () {
    var results = [];
    this.forEach((innerArray) => {
      results.push.apply(results, innerArray);
    });
    return results;
  };

$(document).ready(() => {
  let TOTAL = (() => {
    let entries = {},
      demands = {},
      wrongAnswers = new Set(),
      answer,
      $congrats = $('#congrats3');




    function addNewUnit () {
      let ex = 3;
      return function () {
        ex++;
        $('#total-form').find('.unit-info').last().closest('.row')
          .after(`<div class="row"><div class="form-group unit-info"><label ` +
          `for="unit-demand-${ex}" class="col-sm-12 col-md-2">` +
          `Unit ${ex} Subtotal Demand</label>` +
          `<div class="col-sm-12 col-md-2"><input type="text" ` +
          `class="form-control" ` +
          `id="unit-demand-${ex}" placeholder="10000" name="demand"></div>` +
          `<label for="unit-count-${ex}" class="col-sm-12 col-md-2">` +
          `Unit ${ex} Count</label>` +
          `<div class="col-sm-12 col-md-2"><input type="text" ` +
          `class="form-control" ` +
          `id="unit-count-${ex}" placeholder="2" name="count"></div>` +
          `<label for="unit-heat-${ex}" class="col-sm-12 col-md-2">` +
          `Unit ${ex} Heat Demand (W)` +
          `</label><div class="col-sm-12 col-md-2"><input type="text" ` +
          `class="form-control" id="unit-heat-${ex}" placeholder="8000" ` +
          `name="heat"></div></div></div>`);
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
    function calUnitDemands () {
      let tmp = [],
        $x = $('#total-form');
      $x.find('.unit-info').each(function () {
        tmp.push([parseInt($(this).find('input[name="demand"]').val(), 10),
          parseInt($(this).find('input[name="count"]').val(), 10)]);
      });
      // Main return
      return tmp.sort((a, b) => {
        if (a[0] === b[0]) { return 0; }
        return b[0] - a[0];
      }).map((unitArray) => {
        let ans = [];
        for (let i = 0; i < unitArray[1]; i++) {
          ans.push(unitArray[0]);
        }
        return ans;
      }).concatAll().reduce((final, dem, index) => {
        if (index === 0) { return final + dem; }
        if (index === 1 || index === 2) { return final + dem * 0.65; }
        if (index === 3 || index === 4) { return final + dem * 0.40; }
        if (index > 4 && index <= 19) { return final + dem * 0.25; }
        return final + dem * 0.10;
      }, 0);
    }

    function calUnitHeat () {
      let tmp = [],
        totalDemand,
        $x = $('#total-form');
      $x.find('.unit-info').each(function () {
        tmp.push([parseInt($(this).find('input[name="heat"]').val(), 10),
          parseInt($(this).find('input[name="count"]').val(), 10)]);
      });
      totalDemand = tmp.map((unitArray) => {
        let ans = [];
        for (let i = 0; i < unitArray[1]; i++) {
          ans.push(unitArray[0]);
        }
        return ans;
      }).concatAll().reduce((ans, curr) => {
        return ans + curr;
      }, 0);

      return totalDemand !== 0 ? ((totalDemand - 10000) * 0.75) + 10000 : 0;
    }


    function calculator () {
      demands.units = calUnitDemands();
      demands.heat = calUnitHeat();
      entries.userAnswer = $('#total-form').find('#total-user-answer').val();
      console.log('demands.units ' + demands.units);
      console.log('demands.heat ' + demands.heat);

      return demands.heat + demands.units;
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
      console.log('answer ' + answer);
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


    function giveAnswer() {
      // display answer
      let $displayNode = $('#total-form').find('#display-total-answer');
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


    $('#total-check').click(checkAnswer);
    $('#total-answer-btn').click(giveAnswer);
    let addUnit = addNewUnit();
    $('#add-unit').click(addUnit);
  }());
});