$(document).ready(function () {


  var calculator = {};
  calculator.prototype = {

    calArea: function () {
      if (this.area <= 45) {
        return 3500;
      } else if (this.area > 45 && this.area <= 90) {
        return 5000;
      } else {
        var multiplier = Math.ceil((this.area - 90) / 90);
        return multiplier > 1 ? 5000 + (1000 * multiplier) : 6000;
      }
    },

    calculateSubTotal: function () {

    }
  };

/**
 * returns a list of all the values from the extra loads
 * @return {list}
 */
  function getExtraLoads() {
    var temArr = [];
    $('.extra-load').each(function() {
      temArr.push($(this).val())
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

  // get buttons
  var $check = $('#check'),
    $answer = $('#answer'),
    $add_load = $('#add-load');
  // on clicks
  $check.click(getExtraLoads);
  $answer.click(answer);
  $add_load.click(addExtraLoad);



  // get input from the DOM elements
  var area = $('#area').text(),
    range = $('#range').text(),
    heat = $('#heat').text();
  // do calculations
  // check answer
  // show answer
});