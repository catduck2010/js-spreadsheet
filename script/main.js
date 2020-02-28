// const rxjs = require('rxjs');
let listenersAdded = false;
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
//const oval = new Function('formula', 'return ' + formula.substring(1) + ';');

const sum = function (str) {
    let res = str.split(',');
    for (let i = 0; i < res.length; i++) {
        res[i] = res[i].trim().toUpperCase();
    }
    doSum(res);
};

const doSum = function (arr) {

};

const handleFile = (file) => {
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function (e) {
        loadFile(e.target.result);
    };
    reader.onerror = function (e) {
        alert('Something Wrong: ' + e);
    };
};

const createAndDownloadFile = (fileName, content) => {
    let aTag = document.createElement('a');
    let blob = new Blob([`\ufeff${content}`], {type: 'text/plain;charset=utf-8'});
    // let blob = new Blob([content]);
    aTag.download = fileName;
    aTag.href = URL.createObjectURL(blob);
    aTag.click();
    URL.revokeObjectURL(blob);
};

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

class ReferenceTree {
    constructor() {
        this.graph = new Map();
    }

    addReference(node, ref) {

    }

}

class SheetCell {
    constructor() {
        this.uuid = Math.uuid();
        this.label = '';
        this.isNum = false;
        this.val = ''; //stores value
        this.references = [];
        this.cell = null; // store the cell that represents it on the sheet table
        this.formula = null; // stores formula
        this.formulaR = null;
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

    setLabel(x, y) {
        this.label = y + x;
    }

    getValue() {
        return this.val;
    }

    setValue(val) {
        if (val === '' || val.length === 0 || isNaN(val)) {
            this.isNum = false;
            this.val = val;
        } else {
            this.isNum = true;
            this.val = Number(val);
        }
    }

    refreshFormula(map) {
        if (this.formula !== null) {
            let res = this.formulaR;
            let flag = false;
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
        }
    }

    parseFormula(formula) {

    }


}

class Sheet { // spreadsheet data structure
    constructor(rows, cols) { // create sheet
        this.board = [];
        // row col
        this.rowNum = rows;
        this.colNum = cols;
        this.cellMap = new Map();
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

    updateLabel(startRow = 0, startCol = 0) {
        for (let i = startRow; i < this.rowNum; i++) {
            for (let j = startCol; j < this.colNum; j++) {
                this.board[i][j].setLabel(i + 1, this.index2letter(j));
            }
        }
    }

    getCellByID(id) {
        return this.cellMap.get(id);
    }

    getCellByLabel(label) {
        const fx = this.board[0][0].convertLabel;
        const res = fx(label);
        return this.getCell(res[0], res[1]);
    }

    getCellReference(cell, formula) {
        let str = formula.substring(1);
        const regEx = /(^|\+|-|\*|\/|\()([A-Z]+[1-9][0-9]*)/gi;
        let matches = [];
        let matchRes = null;
        while ((matchRes = regEx.exec(str)) != null) {
            matches.push(matchRes[2]);
        }
        let cells = [];
        let modified = str.substring(0);
        matches.forEach((label) => {
            cells.push(this.getCellByLabel(label));
            modified = modified.replace(label, '{-R-}');
        });
        return [cells, modified];
    }

    getCell(row, col) { // get cell with spreadsheet index such as 'A1'
        let x = row - 1; // start from 1
        let y = this.letter2index(col);

        return this.board[x][y];
    }

    getStrBoard() {
        let res = [];
        this.board.forEach(function (row) {
            let temp = [];
            row.forEach(function (cell) {
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
        if (formula != null) {
            let res = this.getCellReference(thisCell, formula);
            const refs = res[0];
            let modifiedFormula = res[1];
            refs.forEach((cell) => {
                if (cell.label === thisCell.label) {
                    throw 'There is one or more circular reference.';
                }
                modifiedFormula = modifiedFormula.replace('{-R-}',
                    cell.getValue());
            });
            let nval = null;
            try {
                const cval = new Function('return ' + modifiedFormula + ';');
                nval = cval();
                if (nval != null) {
                    thisCell.setValue(nval);
                    thisCell.formula = formula;
                    thisCell.formulaR = '=' + res[1];
                    thisCell.references = refs;
                }
            } catch (e) {
                alert('Invalid formula: ' + e);
            }
        } else {
            thisCell.setValue(val);
            thisCell.formula = null;
            thisCell.formulaR = null;
            thisCell.references = [];
        }
    }

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
}

class SheetTable { // data structure to present spreadsheet
    constructor(row, col) {
        //x,y,flag indicates current selection
        this.x = 1;
        this.y = 'A';
        this.sheet = new Sheet(row, col);
        this.flags = [false, false];
        this.listenersAdded = false;
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

    clickCross(button) {
        this.setLocator();
        button.blur();
        this.disableButtons();
    }

    clickCheck(button) {
        this.editCell();
        button.blur();
        this.disableButtons();
    }

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

    syncTextEdit() {
        let divCell = this.sheet.getCell(this.x, this.y).cell;
        divCell.innerText = this.textedit.value;
    }

    getTableCells() { // make indexes of all cells
        let buttons = [];
        let sheetTable = this;
        for (let i = 1; i <= this.sheet.rowNum; i++) {
            let row = [];
            for (let j = 0; j < this.sheet.colNum; j++) {
                let letter = this.sheet.index2letter(j);
                let cell = document.getElementById(letter + '-cell-' + i);
                cell.parentElement.addEventListener("click", function () {
                    sheetTable.select(i, letter);
                });
                cell.parentElement.addEventListener("dblclick", function () {
                    sheetTable.select(i, letter);
                    sheetTable.textedit.focus();
                });
                cell.setAttribute('title', sheetTable.sheet.getCell(i, letter).getValue());
                this.sheet.getCell(i, letter).cell = cell;
                row.push(cell);
            }
            buttons.push(row);
        }
        return buttons;
    }

    getRowButtons() { // make row buttons able to select a row
        let res = [];
        let sheetTable = this;
        for (let i = 1; i <= this.sheet.rowNum; i++) {
            let btn = document.getElementById('row-btn-' + i);

            btn.addEventListener("click", function () {
                sheetTable.selectRow(i);
            });
            res.push(btn);
        }
        return res;
    }

    getColButtons() { // make column buttons able to select a column
        let res = [];
        let sheetTable = this;
        for (let i = 0; i < this.sheet.colNum; i++) {
            let letter = this.sheet.index2letter(i);
            let btn = document.getElementById('col-btn-' + letter);
            btn.addEventListener("click", function () {
                sheetTable.selectCol(letter);
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
        this.colBtns.forEach(function (btn) {
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
        this.rowBtns.forEach(function (btn) {
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
        this.rowBtns.forEach(function (btn) {
            btn.classList.add('selected-row-col');
        });
        this.colBtns.forEach(function (btn) {
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
                this.rowBtns.forEach(function (btn) {
                    btn.classList.remove('selected-row-col');
                });
                this.colBtns.forEach(function (btn) {
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
                this.colBtns.forEach(function (btn) {
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
                this.rowBtns.forEach(function (btn) {
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
        cell.innerHTML = value;
        cell.setAttribute('title', value);
        this.setLocator();
    }

    importCell(x, y, val) {
        this.sheet.updateCell(x, y, val, null);
        let cell = this.sheet.getCell(x, y).cell;
        cell.innerText = val;
        cell.setAttribute('title', val);
    }

    downloadCSV() {
        let csv = this.sheet.toCSV();
        createAndDownloadFile('export.csv', csv);
    }
}

// test only
// let testFunction = function () {
//     let sheet = new Sheet(5, 5,);
//     for (let i = 0; i < 5; i++) {
//         for (let j = 0; j < 5; j++) {
//             sheet.board[i][j].getValue() = 'H';
//         }
//     }
//     sheet.addColumn('F');
//
//     console.log(sheet.getStrBoard());
// };


// click to switch between showing and hiding
let showMenu = (elementId) => {
    let elements = ["file2-menu", "edit-menu", "help-menu"];
    elements.remove(elements.indexOf(elementId));
    document.getElementById(elementId).classList.toggle("show");
    elements.forEach(function (ele) {
        let dd = document.getElementById(ele);
        if (dd.classList.contains('show')) {
            dd.classList.remove('show');
        }
    })
};

// hide when click other places
window.onclick = (e) => {
    const el = e.target;
    if (!el.matches('.drop-btn')) {
        let elements = ["file2-menu", "edit-menu", "help-menu"];
        elements.forEach(function (ele) {
            let dd = document.getElementById(ele);
            if (dd.classList.contains('show')) {
                dd.classList.remove('show');
            }
        })
    }
};

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

const syncScroll = () => { // sync the horizontal scroll between pinned column bar && table
    let down = document.querySelector('#sheet-div');
    let up = document.querySelector('#new-col-bar');
    const syncUp = function () {
        down.scrollLeft = up.scrollLeft;
    };
    const syncDown = function () {
        up.scrollLeft = down.scrollLeft;
    };
    //
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

const newSpreadsheet = function (row = 64, col = 27) {
    document.sheetTable = new SheetTable(row, col);
};

const newFile = () => { // start a new spreadsheet
    //hideMenu();
    if (confirm("Are you sure to create a new file? This operation would clear all the contents you have changed. ")) {
        newSpreadsheet();
    }
};

const openFile = () => {
    if (confirm("Are you sure to import? This operation would clear all the contents. ")) {
        let fileBtn = document.getElementById('file-btn');
        fileBtn.click();
    }
};

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

const getArrayShape = (array) => {
    let row = array.length;
    let col = -1;
    array.forEach(function (subArray) {
        col = Math.max(subArray.length, col);
    });
    return [row, col];
};

newSpreadsheet();
syncScroll();




