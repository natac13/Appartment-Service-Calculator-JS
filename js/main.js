$(document).ready(function () {

/**
 * Finds all the extra-load classes from the DOM including newly created ones.
 * @return {list} Extra load values.
 */
  function getExtraLoads() {
    var temArr = [];
    $('.extra-load').each(function () {
      temArr.push($(this).val());
    });
    return temArr;
  }

/**
 * Will insert a new Extra Load input field to the bottom of the others.
 */
  function addExtraLoad() {
    $('.extra-loads-wrapper').append('<div class="form-group"><label ' +
      'for="extra-load" class="col-sm-2">Extra Load W</label><div ' +
      'class="col-sm-10"><input type="text" class="form-control extra-load" ' +
      'placeholder="1800"></div></div>');
  }

/**
 * Given an area will calculate rule 8-202(1)(a)(i)(ii)(iii)
 * @param  {number} area From the input field #area
 * @return {number}      demand based off the area.
 */
  function calArea(area) {
    if (area <= 45) {
      return 3500;
    }
    if (area > 45 && area <= 90) {
      return 5000;
    }
    var multiplier = Math.ceil((area - 90) / 90);
    return multiplier > 1 ? 5000 + (1000 * multiplier) : 6000;
  }

/**
 * Given a range in watts will calculate rule 8-202(1)(v)
 * @param  {number} range From the input field #range
 * @return {number}       demand based off the range.
 */
  function calRange(range) {
    if (range <= 12000) {
      return 6000;
    }
    return 6000 + ((range - 12000) * 0.4);
  }

  function checkAnswer() {
    var area = $('#area').val(),
      range = $('#range').val(),
      heat = $('#heat').val(),
      extras = getExtraLoads(),
      ac = $('#ac').val(),
      suite_voltage = $('#volts').val(),
      suite_phase = $('#phase').val()
      demands = [];
    console.log(calArea(area));
    // add each total to the demands array
    demands.push(calArea(area))

  }

  function giveAnswer() {
    // display answer
    if (this.area === undefined) {  // will be undefined if checkAnswer not run
      alert("You need to try an answer first!");
    }
  };

  function calculateSubTotal() {

  }


  // get buttons
  var $check = $('#check'),
    $answer = $('#answer'),
    $add_load = $('#add-load');
  // on clicks
  $check.click(checkAnswer);
  $answer.click(giveAnswer);
  $add_load.click(addExtraLoad);



  // get input from the DOM elements

  // do calculations
  // check answer
  // show answer
});