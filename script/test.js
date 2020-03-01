const log = (data) => {
    console.log(data)
};
const convert = (label) => 10;

const testFunction = () => {
    const regEx0 = /(^|\+|-|\*|\/|\()([A-Z]+[1-9][0-9]*)/gi;
    const regEx = /(^|\+|-|\*|\/)(SUM\(([A-Z0-9,:]*)\))/gi;
    const regEx2 = /(,)*([A-Z]+[1-9][0-9]*)(^|:([A-Z]+[1-9][0-9]*))*/gi;
    let str = 'A1+SUM(B2:B3,B9)+5+7';
    let matches = [];
    let matchRes = null;
    while ((matchRes = regEx.exec(str)) != null) {
        //log(matchRes);
        matches.push([matchRes[2], matchRes[3]]);
    }

    while((matchRes=regEx2.exec(str))!=null){
        log(matchRes);
    }
    //log(matches);
    for (let i = 0; i < matches.length; i++) {
        let substr = matches[i];
        str = str.replace(substr[0], ('convert(' + substr[1] + ')'));
    }

    log(str);
};

testFunction();

