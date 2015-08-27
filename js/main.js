$(document).ready(function () {

/**
 * returns a list of all the values from the extra loads
 * @return {list}
 */
  function getExtraLoads() {
    var temArr = [];
    $('.extra-load').each(function () {
      temArr.push($(this).val());
    });
    console.log(temArr);
    return temArr;
  }

  function addExtraLoad() {
    $('.extra-loads-wrapper').append('<div class="form-group"><label ' +
      'for="extra-load" class="col-sm-2">Extra Load W</label><div ' +
      'class="col-sm-10"><input type="text" class="form-control extra-load" ' +
      'placeholder="1800"></div></div>');
  }

/**
 * Object to hold the values. The prototype will have all the functions for
 * calculating the Unit demand
 * @type {Object}
 */
  var unitCalculator = {};
  unitCalculator.prototype = {
    calArea: function () {
      if (this.area <= 45) {
        return 3500;
      }
      if (this.area > 45 && this.area <= 90) {
        return 5000;
      }
      var multiplier = Math.ceil((this.area - 90) / 90);
      return multiplier > 1 ? 5000 + (1000 * multiplier) : 6000;
    },
    calRange: function () {
      if (this.range <= 12000) {
        return 6000;
      }
      return 6000 + ((this.range - 12000) * 0.4);
    },
    checkAnswer: function () {
      this.area = $('#area').val();
      this.range = $('#range').val();
      this.heat = $('#heat').val();
      this.extras = getExtraLoads();
      this.ac = $('#a-c').val();
      this.suite_voltage = $('#suite-voltage').val();
      this.suite_phase = $('suite-phase').val();
      // start getting calculations
      this.demands.area = this.calArea();
      this.demands.range = this.calRange();


    },
    giveAnswer: function () {
      // display answer
      if (this.area === undefined) {  // will be undefined if checkAnswer not run
        alert("You need to try an answer first!");
      }
    },
    calculateSubTotal: function () {

    }
  };


  // get buttons
  var $check = $('#check'),
    $answer = $('#answer'),
    $add_load = $('#add-load');
  // on clicks
  $check.click(unitCalculator.checkAnswer);
  $answer.click(unitCalculator.giveAnswer);
  $add_load.click(addExtraLoad);



  // get input from the DOM elements

  // do calculations
  // check answer
  // show answer
});