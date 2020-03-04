//import {Observable} from "rxjs";

const log = (data) => {
    console.log(data)
};
const convert = (label) => 10;

const sumBlock = (str) => {
    let bounds = str.split(':');
    if (bounds.length > 2) {

    } else if (bounds.length === 1) {
        let bound = bounds[0];


    } else {
        let up = bounds[0], down = bounds[1];


    }
};

const testFunction = () => {
    const regEx0 = /(^|\+|-|\*|\/|\()([A-Z]+[1-9][0-9]*)/gi;
    const sumEx = /(^|\+|-|\*|\/)(SUM\(([A-Z0-9,:]*)\))/gi;
    const regEx = /(^|\+|-|\*|\/|\(|:|,)(SUM\(|[A-Z]+[1-9][0-9]*)/gi;
    const regEx2 = /(,)*([A-Z]+[1-9][0-9]*)(^|:([A-Z]+[1-9][0-9]*))*/gi;
    let str = 'A1+SUM(B2:B3,B9)+5+7';
    let matches = [];
    let matchRes = null;
    while ((matchRes = regEx.exec(str)) != null) {
        log(matchRes);
        //matches.push([matchRes[2], matchRes[3]]);
    }
    // log(matches);
    //
    // while ((matchRes = regEx2.exec(str)) != null) {
    //     log(matchRes);
    // }
    // //log(matches);
    // for (let i = 0; i < matches.length; i++) {
    //     let substr = matches[i];
    //     str = str.replace(substr[0], ('convert(' + substr[1] + ')'));
    // }
    //
    // log(str);
};

// class TestCell {
//     constructor(label) {
//         this.label = label;
//     }
// }
//
// let cells = [];
// for (let i = 1; i <= 10; i++) {
//     cells.push(new TestCell('A' + i));
// }
//
// const ob = Observable.of(cells);
//
// ob.subscribe(cell => console.log(cell.label));

//testFunction();

