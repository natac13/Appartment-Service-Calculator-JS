/**

  TODO:
  - Could look into lodash to flatten the array instead of this method.
  - Got all the units now.
  - add button to add another unit type.
  - finsih the rest lol

 */





Array.prototype.concatAll = function () {
    var results = [];
    this.forEach((inner_array) => {
        results.push.apply(results, inner_array);
    });
    return results;
};

$(document).ready(() => {
  let TOTAL = (() => {
    let entries = {},
      demands = {},
      answer;

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
    function getUnits() {
      let tmp = [],
        $x = $('#total-form');
      $x.find('.unit-info').each(function() {
        tmp.push([parseInt($(this).find("input[name='demand']").val(), 10),
          parseInt($(this).find("input[name='count']").val(), 10)]);
      });

      console.log(tmp.sort((a, b) => {
              if (a[0] === b[0]) { return 0; }
              return b[0] - a[0];
            }).map((unitArray) => {
        let ans = [];
        for(let i = 0; i < unitArray[1]; i++) {
          ans.push(unitArray[0]);
        }
        return ans;
      }).concatAll().reduce((final, dem, index) => {
        if(index === 0) { return final + dem; }
        if(index === 1 || index === 2) { return final + dem * 0.65; }
        if(index === 3 || index === 4) { return final + dem * 0.40; }
        if(index > 4 && index <= 19) { return final + dem * 0.25; }
        return final + dem * 0.10;
      }, 0));


      return tmp.sort((a, b) => {
              if (a[0] === b[0]) { return 0; }
              return b[0] - a[0];
            }).map((unitArray) => {
        let ans = [];
        for(let i = 0; i < unitArray[1]; i++) {
          ans.push(unitArray[0]);
        }
        return ans;
      }).concatAll().reduce((final, dem, index) => {
        if(index === 0) { return final + dem; }
        if(index === 1 || index === 2) { return final + dem * 0.65; }
        if(index === 3 || index === 4) { return final + dem * 0.40; }
        if(index > 4 && index <= 19) { return final + dem * 0.25; }
        return final + dem * 0.10;
      }, 0);

    }


    function calculator() {
      entries.units = getUnits();
    }



    $('#total-check').click(getUnits)


  }());
});