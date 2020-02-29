const log = (data) => {
    console.log(data)
};
const convert = (label) => 10;

const testFunction = (n) => {
    const regEx = /(^|\+|-|\*|\/)(SUM\(([A-Z]+[1-9][0-9]*)\))/gi;
    let str = 'A1+SUM(B2)+5+7';
    let matches = [];
    let matchRes = null;
    while ((matchRes = regEx.exec(str)) != null) {
        log(matchRes);
        matches.push(matchRes[2]);
    }
    log(matches);
    for (let i = 0; i < matches.length; i++) {
        let substr = matches[i];
        str = str.replace(substr, ('convert("' + substr + '")'));
    }

    log(str);
};

testFunction(2);

