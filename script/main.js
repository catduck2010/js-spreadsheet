// const rxjs = require('rxjs');
const from = rxjs.from;
let listenersAdded = false;
// add insert & remove method to arrays
Array.prototype.insert = function (index, item) {
    if (index > -1 && index <= this.length) {
        this.splice(index, 0, item);
    }
};

Array.prototype.remove = function (index) {
    if (index > -1 && index < this.length) {
        this.splice(index, 1);
    }
};

// generate a pseudo-GUID/UUID by concatenating random hexadecimal
Math.uuid = function () {
    // generate four random hex digits
    const S4 = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};

// data structure for checking circular references
// and determine the order of updating cells
class RefTree {
    constructor(map) {
        // key node: val [ref1,...,refN]
        // key --> val a link for key refs to val
        this.graph = new Map();
        this.cellMap = map;
    }

    // set references
    setReferences(node, refs) {
        this.graph.set(node, refs);
        let cells = this.graph.get(node);
        if (cells === undefined || cells === null || cells.length === 0) {
            this.graph.delete(node);
        }
    }

    // try if the new references have circular references
    tryReference(node, newRefs) {
        let old = this.graph.get(node);
        // if has loop, return false
        this.setReferences(node, newRefs);
        let res = !this.hasLoop();
        this.setReferences(node, old);
        return res;
    }

    hasLoop() {
        // try to find out if there is
        // a loop in a DAG (Directed Acyclic Graph)
        let visited = new Map();
        // key: node, val: visiting(1)/visited(-1)
        let flag = false;
        let arrows = [];
        const dfs = (node) => {
            if (!flag && visited.has(node) && visited.get(node) === 1) {// pointing to a visiting node
                flag = true;// a loop
            } else if (!flag && !visited.has(node)) {//not visited
                visited.set(node, 1);// visiting
                let cells = this.graph.get(node);
                if (cells !== undefined && cells != null && cells.length > 0) {
                    cells.forEach((cell) => {
                        // for testing
                        arrows.push(node.label + " --> " + cell.label);
                        dfs(cell);
                    });
                }
                visited.set(node, -1);// visited
            }
        };
        for (let node of this.graph.keys()) {
            dfs(node);
        }
        console.log(arrows);
        return flag;
    }

    // update function from the most bottom to up (DFS)
    updateValFormulas() {
        // dfs, update from the bottom
        this._rxjsUpdateValFormulas();
        // let arrows = [];
        // let visited = new Map();
        // const dfs = (node) => {
        //     if (!visited.has(node)) { // not visited
        //         visited.set(node, 1); // visiting
        //         let cells = this.graph.get(node);
        //         if (cells !== undefined && cells != null && cells.length > 0) {
        //             cells.forEach((cell) => {
        //                 // for testing
        //                 arrows.push(node.label + " --> " + cell.label);
        //                 dfs(cell);
        //             });
        //         }
        //         node.refreshFormula(this.cellMap);
        //         console.log('Refreshed ' + node.label);
        //         visited.set(node, -1);// visited
        //     }
        // };
        // for (let node of this.graph.keys()) {
        //     dfs(node);
        // }
        // console.log(arrows);
    }

    _rxjsUpdateValFormulas() {
        // refactored version
        let arrows = [];
        let values = [];
        let visited = new Map();
        const dfs = (node) => {
            if (!visited.has(node)) { // not visited
                visited.set(node, 1); // visiting
                let cells = this.graph.get(node);
                if (cells !== undefined && cells != null && cells.length > 0) {
                    cells.forEach((cell) => {
                        // for testing
                        arrows.push(node.label + " --> " + cell.label);
                        dfs(cell);
                    });
                }
                values.push(node);
                //node.refreshFormula(this.cellMap);
                //console.log('Refreshed ' + node.label);
                visited.set(node, -1);// visited
            }
        };
        for (let node of this.graph.keys()) {
            dfs(node);
        }

        // const cellIterator = rxjs.Observable.create(function (observer) {
        //     values.forEach((cell) => {
        //         observer.next(cell);
        //     });
        // });

        const cellIterator = from(values);

        cellIterator.subscribe(cell => {
            cell.refreshFormula(this.cellMap);
        });
        //console.log('Refresh Order: ' + values);
        console.log(arrows);
    }

}

// data structure for a cell in Class Sheet
class SheetCell {
    constructor() {
        this.uuid = Math.uuid();
        this.label = '';
        this.isNum = false;
        this.val = ''; //stores value
        this.references = [];
        this.sumReferences = [];
        // =SUM(A1:A2)+SUM(B1:B5)
        // [[A1,A2],[B1,B5]] (cells)
        this.cell = null; // store the cell(-div) that represents it on the sheet table
        this.formula = null; // stores text formula
        this.formulaR = null; // stores ACTUAL formula
    }

    convertLabel(label) { // convert 'A1' to [1,'A']
        const regEx = /^[A-Z]+[1-9][0-9]*$/;
        let res = [];
        if (regEx.test(label)) {
            let start = 0;
            while (!(label.charCodeAt(start) <= '9'.charCodeAt(0)
                && label.charCodeAt(start) >= '0'.charCodeAt(0))
            && start < label.length) {
                start++;
            }

            let x = label.substring(start);
            let y = label.substring(0, start);
            res = [x, y];
        }
        return res;
    }

    // set cell's label
    setLabel(x, y) {
        this.label = y + x;
    }

    // get cell's value
    getValue() {
        return this.val;
    }

    // set cell's value
    setValue(val) {
        if (val === '' || val.length === 0 || isNaN(val)) { // string
            this.isNum = false;
            this.val = val;
        } else { // number
            this.isNum = true;
            this.val = Number(val);
        }
        this.cell.innerText = this.val + '';
        this.cell.setAttribute('title', this.val);
    }

    // input [cell1, cell2]
    // do sum of cell1:cell2
    calcSumPair(pair) {
        const sheet = document.sheetTable.sheet;
        return sheet.calcSum(sheet.expandSumReference(
            pair[0].label,
            pair[1].label
        ));
    }

    refreshFormula(map) { // AUTOMATICALLY refresh formula
        if (this.formula !== null) {
            let res = this.formulaR;
            let flag = false; // if the cell is deleted
            // refresh sum reference
            if (this.sumReferences.length > 0) {
                this.sumReferences.forEach((pair) => {
                    if (map.has(pair[0].uuid)
                        && map.has(pair[1].uuid)) {
                        res = res.replace(
                            '({-S-})',
                            'SUM(' + pair[0].label + ':' + pair[1].label + ')');
                    } else {
                        flag = true;
                        res = res.replace('({-S-})', 'SUM(#REF!:#REF!)');
                    }
                });
            }
            // refresh general reference
            this.references.forEach((cell) => {
                if (map.has(cell.uuid)) {
                    res = res.replace('{-R-}', cell.label);
                } else {
                    flag = true;
                    res = res.replace('{-R-}', '#REF!');
                }
            });
            if (flag) {
                this.setValue('#REF!');
            }
            this.formula = res;
            this.refreshValue();
        }
    }

    refreshValue() { // AUTOMATICALLY refresh value
        try {
            let modifiedFormula = this.formulaR.substring(1);
            if (this.sumReferences.length > 0) { // refresh sum
                this.sumReferences.forEach((pair) => {
                    modifiedFormula = modifiedFormula.replace('{-S-}',
                        '' + this.calcSumPair(pair));
                });
            }
            this.references.forEach((cell) => { // refresh general
                modifiedFormula = modifiedFormula.replace('{-R-}',
                    cell.getValue());
            });
            //console.log('=' + modifiedFormula);
            const calcVal = new Function('return ' + modifiedFormula + ';');
            this.setValue(calcVal());
        } catch (e) {
            this.setValue('#REF!');
        }
    }


}

class Sheet { // spreadsheet data structure
    constructor(rows, cols) { // create sheet
        this.board = [];
        // row col
        this.rowNum = rows;
        this.colNum = cols;
        this.cellMap = new Map();
        // cellMap is used for constructing reference tree && check if a cell is deleted
        this.refTree = new RefTree(this.cellMap);
        for (let i = 0; i < rows; i++) {
            let temp = [];
            for (let j = 0; j < cols; j++) {
                let cell = new SheetCell();
                cell.setLabel(i + 1, this.index2letter(j));
                temp.push(cell);
                this.cellMap.set(cell.uuid, cell);
            }
            this.board.push(temp);
        }
    }

    // convert 'A' to 0, ..., 'AA' to 26, etc.
    letter2index(letter) {
        let str = letter.toUpperCase();
        let num = 0, increase = 0;
        for (let i = str.length - 1; i >= 0; i--) {
            num += increase + str.charCodeAt(i) - 'A'.charCodeAt(0);
            increase += 26;
        }
        //console.log(num);
        return num;
    }

    // convert 0 to 'A', ..., 26 to 'AA', etc.
    index2letter(n) {
        const ordA = 'A'.charCodeAt(0);
        const ordZ = 'Z'.charCodeAt(0);
        const len = ordZ - ordA + 1;
        let s = "";
        while (n >= 0) {
            s = String.fromCharCode(n % len + ordA) + s;
            n = Math.floor(n / len) - 1;
        }
        return s;
    }

    // convert sheet data to string (for export)
    toCSV() {
        let rows = this.getStrBoard();
        return rows.map(e => e.join(",")).join("\n");
    }

    addRow(at) {
        let temp = [];
        for (let i = 0; i < this.colNum; i++) {
            let cell = new SheetCell();
            cell.setLabel(at + 1, this.index2letter(i));
            temp.push(cell);
            this.cellMap.set(cell.uuid, cell);
        }
        this.board.insert(at, temp);
        this.rowNum++;
        this.updateLabel(at + 1);
    }

    addColumn(at) {//at as before, at+1 as after
        at = this.letter2index(at);
        this.addColumnWithNum(at);
    }

    addColumnAfter(at) {
        at = this.letter2index(at);
        this.addColumnWithNum(at + 1);
    }

    addColumnWithNum(at) {
        for (let i = 0; i < this.rowNum; i++) {
            let row = this.board[i];
            let cell = new SheetCell();
            cell.setLabel(i + 1, this.index2letter(at));
            row.insert(at, cell);
            this.cellMap.set(cell.uuid, cell);
        }
        this.colNum++;
        this.updateLabel(0, at + 1);
    }

    delRow(at) {
        this.board[at].forEach((cell) => {
            this.cellMap.delete(cell.uuid)
        });
        this.board.remove(at);
        this.rowNum--;
        this.updateLabel(at);
    }

    delColumn(at) {
        at = this.letter2index(at);
        this.delColumnWithNum(at);
    }

    delColumnWithNum(at) {
        this.board.forEach((row) => {
            this.cellMap.delete(row[at].uuid);
            row.remove(at);
        });
        this.colNum--;
        this.updateLabel(0, at);
    }

    getCellByID(id) {
        return this.cellMap.get(id);
    }

    getCellByLabel(label) {
        const fx = this.board[0][0].convertLabel;
        const res = fx(label);
        return this.getCell(res[0], res[1]);
    }

    updateLabel(startRow = 0, startCol = 0) {
        for (let i = startRow; i < this.rowNum; i++) {
            for (let j = startCol; j < this.colNum; j++) {
                this.board[i][j].setLabel(i + 1, this.index2letter(j));
            }
        }
        this.refTree.updateValFormulas();
    }

    getCellReference(cell, formula) {
        let str = formula.substring(1);
        let modified = str.substring(0);
        // then regular cell references
        const regEx = /(^|\+|-|\*|\/|\()([A-Z]+[1-9][0-9]*)/gi;
        let cells = [];
        let matchRes = null;
        while ((matchRes = regEx.exec(str)) != null) {
            let label = matchRes[2];
            modified = modified.replace(label, '{-R-}');
            cells.push(this.getCellByLabel(label));
        }
        return [cells, modified];
    }

    // get SUM part of formula and return
    // parsed formula and references
    parseSumFunction(thisCell, formula) {
        let str = formula.substring(0);
        let sumRefs = [];
        const sumEx = /(^|\+|-|\*|\/|\(|=)(SUM\(([A-Z0-9,:]*)\))/gi;
        let matchRes = null;
        while ((matchRes = sumEx.exec(str)) != null) { // Found SUM(...)
            str = str.replace(matchRes[2], '({-S-})');
            let args = this.processSumArg(matchRes[3]);
            if (args === null || args === undefined || args.length !== 2) {
                throw new Error('Syntax Error on function SUM!');
            }
            sumRefs.push(args);
        }
        return [sumRefs, str];
    }

    // process string 'A1:A2' and return [cell1, cell2]
    processSumArg(arg) {
        let sumRef = [];
        const labelEx = /^[A-Z]+[1-9][0-9]*$/;

        if (arg.indexOf(':') !== -1) { // when there is a colon
            let as = arg.split(':');
            if (as.length !== 2 || !labelEx.test(as[0]) || !labelEx.test(as[1])) {
                throw new Error('Wrong Reference!');
            }
            sumRef = [this.getCellByLabel(as[0]), this.getCellByLabel(as[1])];
        }
        return sumRef;
    }

    getCell(row, col) { // get cell with spreadsheet index such as 'A1'
        let x = row - 1; // start from 1
        let y = this.letter2index(col);

        return this.board[x][y];
    }

    getStrBoard() {
        let res = [];
        this.board.forEach((row) => {
            let temp = [];
            row.forEach((cell) => {
                let val = cell.getValue();
                if (!cell.isNum) {
                    let str = val;
                    str = str.replace(/"/g, '""');
                    if (str.includes('"') || str.includes(',') || str.includes('\n')) {
                        temp.push('"' + str + '"');
                    } else {
                        temp.push(str);
                    }
                } else {
                    temp.push(val);
                }
            });
            res.push(temp);
        });
        return res;
    }

    updateCell(x, y, val, formula = null) { // update cell's content
        let thisCell = this.getCell(x, y);
        if (formula != null) { // the cell has formula
            try {
                let modifiedFormula = formula.substring(0);
                let sumRefs = [];
                if (formula.indexOf('SUM') !== -1) { // the cell has sum function
                    let result = this.parseSumFunction(thisCell, modifiedFormula);
                    sumRefs = result[0];
                    modifiedFormula = result[1];
                }
                console.log(modifiedFormula);
                let expRefs = this.expandAllColonReference(sumRefs);
                let res = this.getCellReference(thisCell, modifiedFormula);// = removed
                const refs = res[0];
                modifiedFormula = res[1];
                let newVal = null;

                refs.concat(expRefs).forEach(cell => { // simply check references & values
                    if (cell.label === thisCell.label) {
                        throw new Error('There is one or more circular reference.');
                    } else if (cell.getValue().length < 1 || !cell.isNum) {
                        throw new Error('Invalid number value at ' + cell.label);
                    }
                });
                // replace modified strings to values
                sumRefs.forEach(pair => {
                    modifiedFormula = modifiedFormula.replace("{-S-}",
                        '' + this.calcSum(this.expandSumReference(
                        pair[0].label,
                        pair[1].label
                        )));
                });

                refs.forEach(cell => {
                    modifiedFormula = modifiedFormula.replace('{-R-}',
                        cell.getValue());
                });
                // check circular reference
                if (!this.refTree.tryReference(thisCell,
                    refs.concat(expRefs))) {
                    throw new Error('There is one or more circular reference.');
                }
                console.log(modifiedFormula);
                // calculate
                const calcVal = new Function('return ' + modifiedFormula + ';');
                newVal = calcVal();
                if (newVal != null) {
                    thisCell.setValue(newVal);
                    thisCell.formula = formula;
                    thisCell.formulaR = '=' + res[1];
                    thisCell.references = refs;
                    thisCell.sumReferences = sumRefs;
                    this.refTree.setReferences(thisCell,
                        thisCell.references.concat(expRefs));
                }
            } catch (e) {
                alert(e);
            }
        } else { // the cell has no formula
            thisCell.setValue(val);
            thisCell.formula = null;
            thisCell.formulaR = null;
            thisCell.sumReferences = [];
            thisCell.references = [];
            this.refTree.setReferences(thisCell, []);
        }
        this.refTree.updateValFormulas();
    }

    // input [[cellA1, cellA8], ..., [cellB1, cellB8]] and
    // return [ cellA1, cellA2, ..., cellB7, cellB8 ]
    expandAllColonReference(sumRefs) {
        let cells = [];
        sumRefs.forEach((pair) => {
            let refs = this.expandSumReference(pair[0].label, pair[1].label);
            refs.forEach((cell) => {
                cells.push(cell);
            });
        });
        return cells;
    }

    // directly calculate all cells' sum in an array
    calcSum(cells) {
        let sum = 0;
        cells.forEach(cell => {
            if (cell.isNum) {
                sum += cell.getValue();
            } else {
                throw new Error('An invalid number at ' + cell.label + '!');
            }
        });
        return sum;
    }

    // input label1 & label2 and return all cells that bound in the 2 labels
    expandSumReference(label1, label2) {
        let labels = [];
        const convert = this.board[0][0].convertLabel;
        let index1 = convert(label1);
        let index2 = convert(label2);
        for (let i = 0; i < 2; i++) { // index1 < index2
            if (index1[i] > index2[i]) {
                const temp = index1[i];
                index1[i] = index2[i];
                index2[i] = temp;
            }
        }
        for (let i = index1[0]; i <= index2[0]; i++) {
            for (let j = this.letter2index(index1[1]);
                 j <= this.letter2index(index2[1]);
                 j++) {
                labels.push(this.index2letter(j) + i);
            }
        }
        return this.convertSumReference(labels);
    }

    // return cells queried by an array of labels
    convertSumReference(labels) {
        let cells = [];
        labels.forEach((lbl) => {
            cells.push(this.getCellByLabel(lbl));
        });
        return cells;
    }
}

class SheetTable { // data structure to present spreadsheet
    constructor(row, col) {
        //x,y,flag indicates current selection
        this.x = 1;
        this.y = 'A';
        this.sheet = new Sheet(row, col);
        this.flags = [false, false];
        // row selected, column selected

        // constant elements
        this.checkBtn = document.getElementById('check-btn');
        this.crossBtn = document.getElementById('cross-btn');
        this.fxBtn = document.getElementById('fx-btn');
        this.locator = document.getElementById('locator');
        this.textedit = document.getElementById('text-edit');
        // elements created by code
        this.rowBar = document.getElementById('left-row-bar');
        this.colBar = document.getElementById('sticky-col-bar');
        this.table = document.getElementById('sheet-table');
        this.rowBtns = null;
        this.colBtns = null;
        this.tableCells = null;

        this.writeTable();
        this.addListeners();
    }

    addListeners() { // add listeners to input & button elements
        if (!listenersAdded) { // ensure to be used ONLY ONCE
            // locator's listener
            this.locator.addEventListener("keyup", function (event) {
                if (event.key === "Enter") { // press Enter or return
                    //console.log('Pressed');
                    document.sheetTable.locate();
                    this.blur();
                } else if (event.key === "Escape") {
                    document.sheetTable.setLocator();
                    this.blur();
                }
            });
            // textedit's listener
            this.textedit.addEventListener("keyup", function (event) {
                if (event.key === "Enter") {
                    document.sheetTable.editCell();
                    this.blur();
                    //sheetTable.selectNext();
                } else if (event.key === "Escape") {
                    document.sheetTable.setLocator();
                    this.blur();
                    document.sheetTable.disableButtons();
                }
            });
            this.textedit.addEventListener("input", function () {
                document.sheetTable.syncTextEdit();
            });
            this.textedit.addEventListener("focusin", function () {
                document.sheetTable.enableButton(document.sheetTable.checkBtn);
                document.sheetTable.enableButton(document.sheetTable.crossBtn);
                document.sheetTable.enableButton(document.sheetTable.fxBtn);
                document.sheetTable.syncTextEdit();
            });
            listenersAdded = true;
        }
    }

    // when click cancel button
    clickCross(button) {
        this.setLocator();
        button.blur();
        this.disableButtons();
    }

    // click enter button
    clickCheck(button) {
        this.editCell();
        button.blur();
        this.disableButtons();
    }

    // click the '=' button
    clickFx(button) {
        let val = this.textedit.value;
        if (val.length === 0 || (val.length > 0 && val.charAt(0) !== '=')) {
            this.textedit.value = "=" + val;
        }
        button.blur();
        this.textedit.focus();
    }

    enableButton(button) { // enable button
        //button.setAttribute('disabled', false);
        button.classList.remove('disabled-button');
    }

    disableButton(button) { // disable button
        //button.setAttribute('disabled', true);
        button.classList.add('disabled-button');
    }

    disableButtons() { // disable 3 buttons that controls the editing of a cell
        let sheetTable = this;
        sheetTable.disableButton(sheetTable.checkBtn);
        sheetTable.disableButton(sheetTable.crossBtn);
        sheetTable.disableButton(sheetTable.fxBtn);
    }

    setLocator() { // to make cell editable
        this.locator.value = this.y + this.x;
        let cell = this.sheet.getCell(this.x, this.y);
        if (cell.formula !== null) {
            cell.refreshFormula(this.sheet.cellMap);
            this.textedit.value = cell.formula;
        } else {
            this.textedit.value = cell.getValue();
        }
        cell.cell.innerText = cell.getValue();
        this.disableButtons();
    }

    // make contents in the cell the same as text in function bar
    syncTextEdit() {
        let divCell = this.sheet.getCell(this.x, this.y).cell;
        divCell.innerText = this.textedit.value;
    }

    getTableCells() { // make indexes of all cells
        let buttons = [];
        for (let i = 1; i <= this.sheet.rowNum; i++) {
            let row = [];
            for (let j = 0; j < this.sheet.colNum; j++) {
                let letter = this.sheet.index2letter(j);
                let cell = document.getElementById(letter + '-cell-' + i);
                cell.parentElement.addEventListener("click", () => {
                    this.select(i, letter);
                });
                cell.parentElement.addEventListener("dblclick", () => {
                    this.select(i, letter);
                    this.textedit.focus();
                });
                cell.setAttribute('title', this.sheet.getCell(i, letter).getValue());
                this.sheet.getCell(i, letter).cell = cell;
                row.push(cell);
            }
            buttons.push(row);
        }
        return buttons;
    }

    getRowButtons() { // make row buttons able to select a row
        let res = [];
        for (let i = 1; i <= this.sheet.rowNum; i++) {
            let btn = document.getElementById('row-btn-' + i);

            btn.addEventListener("click", () => {
                this.selectRow(i);
            });
            res.push(btn);
        }
        return res;
    }

    getColButtons() { // make column buttons able to select a column
        let res = [];
        for (let i = 0; i < this.sheet.colNum; i++) {
            let letter = this.sheet.index2letter(i);
            let btn = document.getElementById('col-btn-' + letter);
            btn.addEventListener("click", () => {
                this.selectCol(letter);
            });
            res.push(btn);
        }
        return res;
    }

    toggleSelect(x, y) { // switch & visualize selection of a cell
        let cell = document.getElementById(y + '-cell-' + x).parentElement;
        let col = document.getElementById('col-btn-' + y).parentElement;
        let row = document.getElementById('row-btn-' + x);
        col.classList.toggle('selected-row-col');
        row.classList.toggle('selected-row-col');
        cell.classList.toggle('selected-cell');
    }

    select(x, y) { // select
        this.unselect();
        this.x = x;
        this.y = y;
        this.toggleSelect(x, y);
        this.flags = [false, false];
        this.setLocator();
    }

    selectRow(x) {
        this.unselect();
        this.colBtns.forEach((btn) => {
            btn.parentElement.classList.add('selected-row-col');
        });
        let row = document.getElementById('row-btn-' + x);
        row.classList.add('selected-row-col');
        for (let j = 0; j < this.sheet.colNum; j++) {
            let cell = document.getElementById(
                this.sheet.index2letter(j) + '-cell-' + x)
                .parentElement;
            cell.classList.add('selected-cell');
        }
        this.x = x;
        this.y = 'A';
        this.flags = [true, false];
        this.setLocator();
    }

    selectCol(y) {
        this.unselect();
        this.rowBtns.forEach((btn) => {
            btn.classList.add('selected-row-col');
        });
        let col = document.getElementById('col-btn-' + y).parentElement;
        col.classList.add('selected-row-col');
        for (let i = 1; i <= this.sheet.rowNum; i++) {
            let cell = document.getElementById(
                y + '-cell-' + i)
                .parentElement;
            cell.classList.add('selected-cell');
        }
        this.x = 1;
        this.y = y;
        this.flags = [false, true];
        this.setLocator();
    }

    selectAll() { // select & visualize all cells/row/column buttons
        this.unselect();
        this.rowBtns.forEach((btn) => {
            btn.classList.add('selected-row-col');
        });
        this.colBtns.forEach((btn) => {
            btn.parentElement.classList.add('selected-row-col');
        });
        for (let i = 1; i <= this.sheet.rowNum; i++) {
            for (let j = 0; j < this.sheet.colNum; j++) {
                let cell = document.getElementById(
                    this.sheet.index2letter(j) + '-cell-' + i)
                    .parentElement;
                cell.classList.add('selected-cell');
            }
        }
        this.x = 1;
        this.y = 'A';
        this.flags = [true, true];
        this.setLocator();
    }

    unselect() { // un-visualize a selection to visualize a new selection
        this.setLocator();
        if (this.flags[0] === true) {
            if (this.flags[1] === true) {
                // all selected
                this.rowBtns.forEach((btn) => {
                    btn.classList.remove('selected-row-col');
                });
                this.colBtns.forEach((btn) => {
                    btn.parentElement.classList.remove('selected-row-col');
                });
                for (let i = 1; i <= this.sheet.rowNum; i++) {
                    for (let j = 0; j < this.sheet.colNum; j++) {
                        let cell = document.getElementById(
                            this.sheet.index2letter(j) + '-cell-' + i)
                            .parentElement;
                        cell.classList.remove('selected-cell');
                    }
                }
            } else {
                // a row is selected
                this.colBtns.forEach((btn) => {
                    btn.parentElement.classList.remove('selected-row-col');
                });
                let row = document.getElementById('row-btn-' + this.x);
                row.classList.remove('selected-row-col');
                for (let j = 0; j < this.sheet.colNum; j++) {
                    let cell = document.getElementById(
                        this.sheet.index2letter(j) + '-cell-' + this.x)
                        .parentElement;
                    cell.classList.remove('selected-cell');
                }
            }

        } else {
            if (this.flags[1] === true) {
                // a column is selected
                this.rowBtns.forEach((btn) => {
                    btn.classList.remove('selected-row-col');
                });
                let col = document.getElementById('col-btn-' + this.y).parentElement;
                col.classList.remove('selected-row-col');
                for (let i = 1; i <= this.sheet.rowNum; i++) {
                    let cell = document.getElementById(
                        this.y + '-cell-' + i)
                        .parentElement;
                    cell.classList.remove('selected-cell');
                }

            } else {
                // a cell is selected

                let cell = document.getElementById(this.y + '-cell-' + this.x).parentElement;
                let col = document.getElementById('col-btn-' + this.y).parentElement;
                let row = document.getElementById('row-btn-' + this.x);
                col.classList.remove('selected-row-col');
                row.classList.remove('selected-row-col');
                cell.classList.remove('selected-cell');
            }
        }
    }

    editCell() { //auto set content in the cell
        let value = this.textedit.value;
        if (value.length > 0) {
            if (value.charAt(0) === '=' && value.length > 1) {
                // replace all spaces and convert to uppercase
                let formula = value.replace(/\s+/g, '').toUpperCase();
                this.updateCell(formula, '?');
            } else {
                this.updateCell(null, value);
            }
        } else {
            this.updateCell(null, "");
        }
    }

    locate() { // when input a new cell label & try to locate
        let cell = this.sheet.getCell(1, 'A');
        let label = cell.convertLabel(this.locator.value);

        if (label.length === 0) {
            alert('Wrong Pattern!');
            this.setLocator();
        } else {
            let x = label[0], y = label[1];
            let yCode = this.sheet.letter2index(y);
            if (x > 0 && x <= this.sheet.rowNum && yCode >= 0 && yCode < this.sheet.colNum) {
                this.select(x, y);
            } else {
                alert('Out of Bound!');
                this.setLocator();
            }
        }
    }

    queryCell(id) {
        return this.sheet.getCellByID(id);
    }

    addRow() {// add row before/at
        this.sheet.addRow(this.x - 1);
        this.writeTable();
        this.select(this.x + 1, this.y);
    }

    addRowAfter() {// add row after
        this.sheet.addRow(this.x);
        this.writeTable();
    }

    addColumn() {// add column left/at
        let f = this.sheet.index2letter;
        let g = this.sheet.letter2index;
        this.sheet.addColumn(this.y);
        this.writeTable();
        this.select(this.x, f(1 + g(this.y)));
    }

    addColumnAfter() {//add column right
        this.sheet.addColumnAfter(this.y);
        this.writeTable();
    }

    deleteRow() {//delete selected row
        if (this.sheet.rowNum <= 1) {
            alert('You cannot delete the only row!'); //you cannot delete the only cell
        } else if (confirm("Are you sure to delete Row " + this.x + " ?")) {
            this.sheet.delRow(this.x - 1);
            this.x = this.x > 1 ? this.x - 1 : this.x;
            this.writeTable();
        }
    }

    deleteColumn() {//delete selected column
        if (this.sheet.colNum <= 1) {
            alert('You cannot delete the only column!');//you cannot delete the only cell
        } else if (confirm("Are you sure to delete Row " + this.y + " ?")) {
            this.sheet.delColumn(this.y);
            this.y = this.sheet.letter2index(this.y) > 0 ?
                this.sheet.index2letter(this.sheet.letter2index(this.y) - 1) : this.y;
            this.writeTable();
        }
    }

    writeRowBar() { // write buttons at the most left
        let str = "";
        for (let i = -1; i < this.sheet.rowNum; i++) {
            str += '<button class="button sheet-button row-button" id="row-btn-' + (i + 1) + '">' + (i + 1) + '</button>';
        }
        this.rowBar.innerHTML = str;
        //console.log(str);
    }

    writeColBar() { // write buttons at the most top & fake 1st row (hidden)
        let str = '<tr class="bg-lightgray">';
        let str2 = '<tr class="bg-lightgray">';
        for (let i = 0; i < this.sheet.colNum; i++) {
            let temp = '<td><button class="button sheet-button column-button" id="col-btn-'
                + this.sheet.index2letter(i) + '">'
                + this.sheet.index2letter(i) + '</button></td>';
            let temp2 = '<td><button class="button sheet-button column-button" id="fake-col-btn-'
                + this.sheet.index2letter(i) + '">'
                + this.sheet.index2letter(i) + '</button></td>';
            str += temp;
            str2 += temp2;
        }
        str += '</tr>';
        str2 += '</tr>';
        this.colBar.innerHTML = str;
        return str2;
    }

    writeTable() { // write the whole table
        this.writeRowBar();
        let innerStr = this.writeColBar();
        let sheet = this.sheet;
        let board = sheet.board;
        for (let i = 0; i < sheet.rowNum; i++) {
            let temp = '<tr>';
            for (let j = 0; j < sheet.colNum; j++) {
                let cell = board[i][j];
                temp += '<td class="cell-td"><div class="cell-div" ' +
                    'id="' + sheet.index2letter(j) + '-cell-' + (i + 1) + '">' + cell.getValue() + '</div></td>';
            }
            temp += '</tr>';
            innerStr += temp;
        }

        this.table.innerHTML = innerStr;
        this.flushButtons();
        this.setLocator();
    }

    flushButtons() { // rewrite buttons/cells generated by code
        this.rowBtns = this.getRowButtons();
        this.colBtns = this.getColButtons();
        this.tableCells = this.getTableCells();
        this.select(this.x, this.y);
    }

    updateCell(formula, val) { // update cell's content
        this.sheet.updateCell(this.x, this.y, val, formula);
        let sheetCell = this.sheet.getCell(this.x, this.y);
        let cell = sheetCell.cell;
        const value = sheetCell.getValue();
        cell.innerText = value;
        cell.setAttribute('title', value);
        this.setLocator();
    }

    // when importing values from csv file
    importCell(x, y, val) {
        this.sheet.updateCell(x, y, val, null);
        let cell = this.sheet.getCell(x, y).cell;
        cell.innerText = val;
        cell.setAttribute('title', val);
    }

    // the actual function that make exports
    downloadCSV() {
        let csv = this.sheet.toCSV();
        createAndDownloadFile('export.csv', csv);
    }
}

// when a file is selected, read contents to string and process it
const handleFile = (file) => {
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (e) => {
        loadFile(e.target.result);
    };
    reader.onerror = (e) => {
        alert('Something Wrong: ' + e);
    };
};

// create file and download
const createAndDownloadFile = (fileName, content) => {
    let aTag = document.createElement('a');
    let blob = new Blob([`\ufeff${content}`], {type: 'text/plain;charset=utf-8'});
    // let blob = new Blob([content]);
    aTag.download = fileName;
    aTag.href = URL.createObjectURL(blob);
    aTag.click();
    URL.revokeObjectURL(blob);
};

// convert csv content string to an array
const csv2array = (data) => {
    let matchedVal, delimiter = ',';
    // regular expression to parse the CSV data
    const csvPattern = /(,|\r?\n|\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^",\r\n]*))/gi;

    //console.log(csvPattern);
    // parsed data with default empty first row.
    let arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    let matches = null;

    // Keep looping over the regular expression matches until we can no longer find a match.
    while ((matches = csvPattern.exec(data)) != null) {
        // get the delimiter found
        let matchedDelimiter = matches[1];

        // Check to see if the given delimiter has a length (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know that this delimiter is a row delimiter.
        if (matchedDelimiter.length && (matchedDelimiter !== delimiter)) { // when delimiter === ''
            // new row
            arrData.push([]);
        }
        // check quoted or unquoted content
        if (matches[2]) { // quoted
            matchedVal = matches[2].replace(/""/g, '"');
        } else { // unquoted
            matchedVal = matches[3];
        }
        // push to last row
        arrData[arrData.length - 1].push(matchedVal);
    }

    // return the parsed data.
    return arrData;
};


// click to switch between showing and hiding
let showMenu = (elementId) => {
    let elements = ["file2-menu", "edit-menu", "help-menu"];
    elements.remove(elements.indexOf(elementId));
    document.getElementById(elementId).classList.toggle("show");
    elements.forEach((ele) => {
        let dd = document.getElementById(ele);
        if (dd.classList.contains('show')) {
            dd.classList.remove('show');
        }
    })
};

// hide menu when click other places
window.onclick = (e) => {
    const el = e.target;
    if (!el.matches('.drop-btn')) {
        let elements = ["file2-menu", "edit-menu", "help-menu"];
        elements.forEach((ele) => {
            let dd = document.getElementById(ele);
            if (dd.classList.contains('show')) {
                dd.classList.remove('show');
            }
        })
    }
};

// greetings
const ORA = (num = 24) => {
    const ora =
        '╭━━━┳━━━┳━━━╮╭╮\n' +
        '┃╭━╮┃╭━╮┃╭━╮┃┃┃\n' +
        '┃┃╱┃┃╰━╯┃┃╱┃┃┃┃\n' +
        '┃┃╱┃┃╭╮╭┫╰━╯┃╰╯\n' +
        '┃╰━╯┃┃┃╰┫╭━╮┃╭╮\n' +
        '╰━━━┻╯╰━┻╯╱╰╯╰╯';
    let o = '';
    for (let i = 0; i < 14 * num; i++) {
        o += 'ORA ';
    }
    o += '\n' + ora;
    return o;
};

// sync the horizontal scroll between pinned column bar && table
const syncScroll = () => {
    let down = document.querySelector('#sheet-div');
    let up = document.querySelector('#new-col-bar');
    const syncUp = function () {
        down.scrollLeft = up.scrollLeft;
    };
    const syncDown = function () {
        up.scrollLeft = down.scrollLeft;
    };
    // only preserve one listener to improve scrolling performance
    up.addEventListener('mouseover', function () {
        down.removeEventListener('scroll', syncDown);
        up.addEventListener('scroll', syncUp);
    });
    down.addEventListener('mouseover', function () {
        up.removeEventListener('scroll', syncUp);
        down.addEventListener('scroll', syncDown);
    });
    up.addEventListener('scroll', syncUp);
    down.addEventListener('scroll', syncDown);
};

// new spreadsheet
const newSpreadsheet = function (row = 64, col = 27) {
    document.sheetTable = new SheetTable(row, col);
};

// start a new spreadsheet
const newFile = () => {
    //hideMenu();
    if (confirm("Are you sure to create a new file? This operation would clear all the contents you have changed. ")) {
        newSpreadsheet();
    }
};

// open a file from csv
const openFile = () => {
    if (confirm("Are you sure to import? This operation would clear all the contents. ")) {
        let fileBtn = document.getElementById('file-btn');
        fileBtn.click();
    }
};

// load csv content string to an array
const loadFile = (str) => {
    if (str.length < 1) {
        alert('Something Wrong Happened~');
        return;
    }
    let array = csv2array(str);
    //console.log(array);
    let shape = getArrayShape(array);
    if (shape[0] < 1 || shape[1] < 1) {
        alert('Invalid File!');
        return;
    }
    newSpreadsheet(shape[0], shape[1]);
    let tbl = document.sheetTable;
    for (let i = 1; i <= shape[0]; i++) {
        let arr = array[i - 1];
        for (let j = 0; j < arr.length; j++) {
            const letter = tbl.sheet.index2letter(j);
            tbl.importCell(i, letter, arr[j].replace(/\r?\n|\r/g, ', '));
            // avoid new line
            //console.log('Processing ' + letter + i);
        }
    }
    //tbl.addListeners();
    tbl.select(1, 'A');
};

// get shape of array
const getArrayShape = (array) => {
    let row = array.length;
    let col = -1;
    array.forEach((subArray) => {
        col = Math.max(subArray.length, col);
    });
    return [row, col];
};

newSpreadsheet();
syncScroll();

// const testFunction2 = () => {
//     class TestCell {
//         constructor(label) {
//             this.label = label;
//         }
//     }
//
//     let cells = [];
//     for (let i = 1; i <= 10; i++) {
//         cells.push(new TestCell('A' + i));
//     }
//
//     const ob = rxjs.Observable.create(function (observer) {
//         cells.forEach((cell) => {
//             observer.next(cell)
//         });
//     });
//
//     ob.subscribe(cell => console.log(cell.label));
// };




