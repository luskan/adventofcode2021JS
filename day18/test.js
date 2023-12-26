var solution = require('./solution');
const assert = require("assert");
const common = require('../common');const test_data_1 = `
[[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]
[[[5,[2,8]],4],[5,[[9,9],0]]]
[6,[[[6,2],[5,6]],[[7,6],[4,7]]]]
[[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]
[[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]
[[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]
[[[[5,4],[7,7]],8],[[8,3],8]]
[[9,3],[[9,9],[6,[4,9]]]]
[[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]
[[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]
`

function runTest() {
    console.log("Run test 18");

    testNumberTree(solution.loadData('data.txt'))

    // part1
    let res
    res = solution.calculateMagnitudeOfFinalSum(solution.parseData(test_data_1))
    assert(res === 4140)

    // part2
    res = solution.calculateHighestMagnitudeTwoNumbersSum(solution.parseData(test_data_1))
    assert(res === 3993)
}

//
//

function testNumberTreeSplit() {
    let test_arr = [
        ["[10,1]", "[[5,5],1]"],
        ["[11,1]", "[[5,6],1]"],
        ["[12,1]", "[[6,6],1]"],
    ]

    test_arr.forEach(([before_split, correct_after_split], index) => {
        let t1 = new solution.NumberTree()
        t1.parseFromNumberString(before_split)
        t1.tryReduceBySplit()
        let afterSplit = t1.convertToNumberString()
        if (afterSplit !== correct_after_split) {
            console.log(`split reduce test failed: ${index}: ${before_split}, was ${afterSplit} expected ${correct_after_split}`)
            assert(false)
        }
    })
}

function testNumberTreeExplode() {
    let test_arr = [
        ["[[[[4,0],[5,4]],[[7,7],[6,0]]],[[[6,6],[5,6]],[[0,6],[6,[7,[7,7]]]]]]", "[[[[4,0],[5,4]],[[7,7],[6,0]]],[[[6,6],[5,6]],[[0,6],[6,[14,0]]]]]"],
        ["[[[[[9,8],1],2],3],4]", "[[[[0,9],2],3],4]"],
        ["[7,[6,[5,[4,[3,2]]]]]", "[7,[6,[5,[7,0]]]]"],
        ["[[6,[5,[4,[3,2]]]],1]", "[[6,[5,[7,0]]],3]"],
        ["[[3,[2,[1,[7,3]]]],[6,[5,[4,[3,2]]]]]", "[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]"],
        ["[[3,[2,[8,0]]],[9,[5,[4,[3,2]]]]]", "[[3,[2,[8,0]]],[9,[5,[7,0]]]]"]
    ]

    test_arr.forEach(([before_explode, correct_after_explode], index) => {
        let t1 = new solution.NumberTree()
        t1.parseFromNumberString(before_explode)
        t1.tryReduceByExplode()
        let afterExplode = t1.convertToNumberString()
        if (afterExplode !== correct_after_explode) {
            console.log(`explode reduce test failed: ${index}: ${before_explode}, was ${afterExplode} expected ${correct_after_explode}`)
            assert(false)
        }
    })
}

function testNumberTreeMagnitude() {
    let test_arr = [
        ["[9,1]", 29],
        ["[[9,1],[1,9]]", 129],
        ["[[1,2],[[3,4],5]]", 143],
        ["[[[[0,7],4],[[7,8],[6,0]]],[8,1]]", 1384],
        ["[[[[1,1],[2,2]],[3,3]],[4,4]]", 445],
        ["[[[[3,0],[5,3]],[4,4]],[5,5]]", 791],
        ["[[[[5,0],[7,4]],[5,5]],[6,6]]", 1137],
        ["[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]", 3488]
    ]

    test_arr.forEach(([num1, test_mag], index) => {
        let t1 = new solution.NumberTree()
        t1.parseFromNumberString(num1)
        let t1_mag = t1.magnitude()
        if (t1_mag !== test_mag) {
            console.log(`magnitude test failed: ${index}: ${num1}, was ${t1_mag} expected ${test_mag}`)
            assert(false)
        }
    })
}

function testNumberTreeParsing(data) {
    let test_arr = [
        "[1,2]",
        "[[1,2],3]",
        "[9,[8,7]]",
        "[[1,9],[8,5]]",
        "[[[[1,2],[3,4]],[[5,6],[7,8]]],9]",
        "[[[9,[3,8]],[[0,9],6]],[[[3,7],[4,9]],3]]",
        "[[[[1,3],[5,3]],[[1,3],[8,7]]],[[[4,9],[6,9]],[[8,2],[7,3]]]]",
        "[[1,2],[[3,4],5]]",
        "[[[[0,7],4],[[7,8],[6,0]]],[8,1]]",
        "[[[[1,1],[2,2]],[3,3]],[4,4]]",
        "[[[[3,0],[5,3]],[4,4]],[5,5]]",
        "[[[[5,0],[7,4]],[5,5]],[6,6]]",
        "[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]",
        "[[[0,[5,8]],[[1,7],[9,6]]],[[4,[1,2]],[[1,4],2]]]",
        "[[[5,[2,8]],4],[5,[[9,9],0]]]",
        "[6,[[[6,2],[5,6]],[[7,6],[4,7]]]]",
        "[[[6,[0,7]],[0,9]],[4,[9,[9,0]]]]",
        "[[[7,[6,4]],[3,[1,3]]],[[[5,5],1],9]]",
        "[[6,[[7,3],[3,2]]],[[[3,8],[5,7]],4]]",
        "[[[[5,4],[7,7]],8],[[8,3],8]]",
        "[[9,3],[[9,9],[6,[4,9]]]]",
        "[[2,[[7,7],7]],[[5,8],[[9,3],[0,2]]]]",
        "[[[[5,2],5],[8,[3,7]]],[[5,[7,5]],[4,4]]]"
    ]

    test_arr = test_arr.concat(data)
    test_arr.forEach((num1, index) => {
        let t1 = new solution.NumberTree()
        t1.parseFromNumberString(num1)
        let t1_v = t1.convertToNumberString()
        if (num1 !== t1_v) {
            console.log(`parsing test failed: ${index}: expected: ${num1}, got: ${t1_v}`)
            assert(false)
        }
        //else {
        //    console.log(`OK: ${index}: ${num1}`)
        //}
    })
}

function testNumberTreeSum() {

    let t1 = "[[[[4,3],4],4],[7,[[8,4],9]]]"
    let t2 = "[1,1]"
    let tn12 = new solution.NumberTree()
    tn12.sumOfTwoNumbers(t1, t2)
    let tn12res = tn12.convertToNumberString()
    assert(tn12res === "[[[[0,7],4],[[7,8],[6,0]]],[8,1]]")

    //
    let test_arr1 = [
        "[1,1]",
        "[2,2]",
        "[3,3]",
        "[4,4]"
    ]
    let final_sum1 = solution.calculateSumOfNumbers(test_arr1)
    assert(final_sum1 === "[[[[1,1],[2,2]],[3,3]],[4,4]]")

    //
    let test_arr2 = [
        "[1,1]",
        "[2,2]",
        "[3,3]",
        "[4,4]",
        "[5,5]"
    ]
    let final_sum2 = solution.calculateSumOfNumbers(test_arr2)
    assert(final_sum2 === "[[[[3,0],[5,3]],[4,4]],[5,5]]")

    //
    let test_arr3 = [
        "[1,1]",
        "[2,2]",
        "[3,3]",
        "[4,4]",
        "[5,5]",
        "[6,6]"
    ]
    let final_sum3 = solution.calculateSumOfNumbers(test_arr3)
    assert(final_sum3 === "[[[[5,0],[7,4]],[5,5]],[6,6]]")

    //
    let test_arr =
        ["[[[0,[4,5]],[0,0]],[[[4,5],[2,6]],[9,5]]]",
            "[7,[[[3,7],[4,3]],[[6,3],[8,8]]]]",
            "[[2,[[0,8],[3,4]]],[[[6,7],1],[7,[1,6]]]]",
            "[[[[2,4],7],[6,[0,5]]],[[[6,8],[2,8]],[[2,1],[4,5]]]]",
            "[7,[5,[[3,8],[1,4]]]]",
            "[[2,[2,2]],[8,[8,1]]]",
            "[2,9]",
            "[1,[[[9,3],9],[[9,0],[0,7]]]]",
            "[[[5,[7,4]],7],1]",
            "[[[[4,2],2],6],[8,7]]"]

    let tn = new solution.NumberTree()
    tn.sumOfTwoNumbers(test_arr[0], test_arr[1])
    tn.reduce()
    let sum = tn.convertToNumberString()
    assert(sum === "[[[[4,0],[5,4]],[[7,7],[6,0]]],[[8,[7,7]],[[7,9],[5,0]]]]")

    let final_sum = solution.calculateSumOfNumbers(test_arr)
    assert(final_sum === "[[[[8,7],[7,7]],[[8,6],[7,7]]],[[[0,7],[6,6]],[8,7]]]")
}

function testNumberTree(data) {
    testNumberTreeParsing(data)
    testNumberTreeMagnitude()
    testNumberTreeExplode()
    testNumberTreeSplit()
    testNumberTreeSum()
}

module.exports = { runTest };