// let func = function (n) {
//     const ordA = 'A'.charCodeAt(0);1,,,,,,,,,,,,,,,,,,,,,,,,,,
//     const ordZ = 'Z'.charCodeAt(0);
//     const len = ordZ - ordA + 1;
//     let s = "";
//     while (n >= 0) {
//         s = String.fromCharCode(n % len + ordA) + s;
//         n = Math.floor(n / len) - 1;
//     }
//     return s;
// }
// for (let i = 25; i < 30; i++) {
//     console.log(func(i));
// }

// const re = /(?<![,])[,][,]*/;
// let str=',,,,,,,,,,,,,,,,,,,,,,,,,,';
// str=str.replace(re,'');
// console.log(str);

// new Promise((resolve, reject) => {
//     setTimeout(() => {
//         resolve({test: 1})
//         resolve({test: 2})
//         reject({test: 2})
//     }, 1000)
// }).then((data) => {
//     console.log('result1', data)
// }, (data1) => {
//     console.log('result2', data1)
// }).then((data) => {
//     console.log('result3', data)
// });

const csvPattern = new RegExp(
    // [delimiter][quoted[unquoted]]([delimiter])
    (
        // Delimiters(,|\r\n|\n)
        "(\\" + ',' + "|\\r?\\n|\\r|^)" +
        // Quoted fields.
        "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
        // Standard fields.
        "([^\"\\" + ',' + "\\r\\n]*))"
    ), "gi"
);

const pattern = /(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^",\r\n]*))/gi;
let str = '56,65,70,80,90,100';
for(let i=0;i<8;i++)
    console.log(pattern.exec(str));