/**

  TODO:
  - Make button shake like electrical current
  - disable check and answer buttons if o value put it the user-answer field
  - do something better than an alert for right answer.
  - maybe have to check 3 times before get answer. with addition of not being
  able to input same answer... do this with logging each answer in an array, or
  object might be better to use a for in loop.
  - finish owner panel input and finial calculation

 */


$(document).ready(function () {

  var demands = {},
    entries = {},
    answer;
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
    area = parseInt(area, 10);
    if (area <= 45) { return 3500; }
    if (area > 45 && area <= 90) { return 5000; }
    var multiplier = Math.ceil((area - 90) / 90);
    return multiplier > 1 ? 5000 + (1000 * multiplier) : 6000;
  }

/**
 * Given a range in watts will calculate rule 8-202(1)(v)
 * @param  {number} range From the input field #range
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
 * @param  {array} extras only really care about demands above 1500W
 * @return {number}        total demand from the extra loads
 */
  function calExtras(extras) {
    return extras.map(function (extra) {
      return extra > 1500 ? extra * 0.25 : 0;
    }).reduce(function (prev, curr) {
      return prev + curr;
    });
  }

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
        (Math.sqrt(3) * voltage)).toFixed(2)
  }

  function checkAnswer() {
    entries = {
      area: $('#area').val(),
      range: $('#range').val(),
      heat: $('#heat').val(),
      extras: getExtraLoads(),
      ac: $('#a-c').val(),
      suite_voltage: $('#suite-voltage').val(),
      suite_phase: $('#suite-phase').val(),
      user_answer: $('#user-answer').val(),
    };

    // add each total to the demands array
    demands.area = calArea(entries.area);
    console.log("area: " + demands.area);
    demands.range = calRange(entries.range);
    console.log("range " + demands.range);
    demands.extras = calExtras(entries.extras);
    console.log("extra " + demands.extras);
    demands.subTotal = demands.area + demands.range + demands.extras;
    console.log("sub " + demands.subTotal);
    demands.heat_ac = calHeatAC(entries.heat, entries.ac);
    console.log("heat_ac " + demands.heat_ac);
    demands.suiteTotal = parseInt(demands.heat_ac, 10) +
      parseInt(demands.subTotal, 10);
      console.log("total wattage  " + demands.suiteTotal);
    // find answer!!
    answer = calMinWireAmpacity(demands.suiteTotal, entries.suite_voltage,
      entries.suite_phase);

    console.log(demands.suiteTotal);
    console.log(answer);

    // check for right answer then do css magic!!
    if( parseInt(answer, 10) === parseInt(entries.user_answer, 10)) {
      alert("YEah buddy!");
    }
  }

  function giveAnswer() {
    // display answer
    if (area === undefined) {  // will be undefined if checkAnswer not run
      alert("You need to try an answer first!");
    }
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