/**

  TODO:
  - Could look into lodash to flatten the array instead of this method.
  - Got all the units now.
  - add button to add another unit type.
  - finsih the rest lol

 */

'use strict';

Array.prototype.concatAll = function () {
  var results = [];
  this.forEach(function (inner_array) {
    results.push.apply(results, inner_array);
  });
  return results;
};

$(document).ready(function () {

  var TOTAL = (function () {
    var entries = {},
        demands = {},
        answer = undefined;

    /**
     * tmp is an array of array that looks like [[12000,3],[15000,2],[10000,1]]
     * first value is the demand of the unit and the second is how many
     * will sort base off the first value then map to produce an array of just
     * demands in order for how many of each on. normal sort since map will build
     * in the reverse direction....
     * map over the array of arrays to make array of arrays this time each inner
     * array has an element of the demand for how many unit there were(second value)
     * afterward use concatAll() to flatten the array.
     * highest demand first!!!
     * @return {array} demands for all the units in order.
     */
    function getUnits() {
      var tmp = [],
          $x = $('#total-form');
      $x.find('.unit-info').each(function () {
        tmp.push([parseInt($(this).find("input[name='demand']").val(), 10), parseInt($(this).find("input[name='count']").val(), 10)]);
      });

      // console.log(tmp.sort((a, b) => {
      //         if (a[0] === b[0]) { return 0; }
      //         return b[0] - a[0];
      //       }).map((unitArray) => {
      //   let ans = [];
      //   for(let i = 0; i < unitArray[1]; i++) {
      //     ans.push(unitArray[0]);
      //   }
      //   return ans;
      // }).concatAll());
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
      }).concatAll();
    }

    function calculator() {
      entries.units = []; // built by function lol
    }

    $('#total-check').click(getUnits);
  })();
});
