// const rxjs = require('rxjs');
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

const handleFile = function (file) {
    // console.log(file);
    let reader = new FileReader();
    //let str = '';
    reader.readAsText(file);
    reader.onload = function (e) {
        loadFile(e.target.result);
    };
    reader.onerror = function (e) {
        alert('Something Wrong: ' + e);
    };
};

const createAndDownloadFile = function (fileName, content) {
    let aTag = document.createElement('a');
    let blob = new Blob([`\ufeff${content}`], {type: 'text/plain;charset=utf-8'});
    // let blob = new Blob([content]);
    aTag.download = fileName;
    aTag.href = URL.createObjectURL(blob);
    aTag.click();
    URL.revokeObjectURL(blob);
};

const csv2array = function (data) {
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
    while (matches = csvPattern.exec(data)) {

        // get the delimiter found
        let matchedDelimiter = matches[1];

        // Check to see if the given delimiter has a length (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know that this delimiter is a row delimiter.
        if (matchedDelimiter.length && (matchedDelimiter !== delimiter)) {
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
    return (arrData);
};

class RefNode {
    // x: row num(>=1)
    // y: col repeat(1+, 'A-Z')
    constructor(x, y) {

    }
}

class ReferenceTree {
    constructor() {

    }
}

class SheetCell {
    constructor(str) {
        this.cell = null; // store the cell that represents it on the sheet table
        this.formula = null; // stores formula
        this.val = str; //stores value
    }

    getValue() {
        return this.val;
    }

    setValue(val) {
        this.val = val;
    }

    refreshFormula() {

    }
}

class Sheet { // spreadsheet data structure
    constructor(rows, cols) { // create sheet
        this.board = [];
        // row col
        this.rowNum = rows;
        this.colNum = cols;
        for (let i = 0; i < rows; i++) {
            let temp = [];
            for (let j = 0; j < cols; j++) {
                temp.push(new SheetCell(""));
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
            temp.push(new SheetCell(""));
        }
        this.board.insert(at, temp);
        this.rowNum++;
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
        this.board.forEach(function (row) {
            row.insert(at, new SheetCell(""));
        });
        this.colNum++;
    }

    delRow(at) {
        this.board.remove(at);
        this.rowNum--;
    }

    delColumn(at) {
        at = this.letter2index(at);
        this.delColumnWithNum(at);
    }

    delColumnWithNum(at) {
        this.board.forEach(function (row) {
            row.remove(at);
        });
        this.colNum--;
    }

    getCell(row, col) { // get cell with spreadsheet index such as 'A1'
        let x = row - 1; //start from 1
        let y = this.letter2index(col);

        return this.board[x][y];
    }

    // get(row, col) {
    //     return this.getCell(row, col).str;
    // }

    getStrBoard() {
        let res = [];
        this.board.forEach(function (row) {
            let temp = [];
            row.forEach(function (cell) {
                let str = cell.getValue();
                str = str.replace(/"/g, '""');
                if (str.includes('"') || str.includes(',') || str.includes('\n')) {
                    temp.push('"' + str + '"');
                } else {
                    temp.push(str);
                }
            });
            res.push(temp);
        });
        return res;
    }

    updateCell(x, y, val, formula) { // update cell's content
        let cell = this.getCell(x, y);
        cell.formula = formula;
        cell.setValue(val);
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
        this.flags = [false, false];
        // row selected, column selected

        // constant elements
        this.checkBtn = document.getElementById('check-btn');
        this.crossBtn = document.getElementById('cross-btn');
        this.fxBtn = document.getElementById('fx-btn');
        this.locator = document.getElementById('locator');
        this.textedit = document.getElementById('text-edit');

        this.sheet = new Sheet(row, col);

        this.rowBar = document.getElementById('left-row-bar');
        this.colBar = document.getElementById('sticky-col-bar');
        this.table = document.getElementById('sheet-table');
        // console.log(document.getElementById('left-row-bar'));
        // console.log(this.table);

        this.rowBtns = null;
        this.colBtns = null;
        this.tableCells = null;

        this.writeTable();
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


    addListeners() { // add listeners to input & button elements
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
        });

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

    // selectNext() {
    //     let x = this.x < this.sheet.rowNum ? this.x + 1 : this.x;
    //     if (x === this.x) {
    //         this.select(x, this.y);
    //         this.textedit.focus();
    //     }
    // }

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
            if (value.charAt(0) === '=') {
                this.updateCell(value, '?');
            } else {
                this.updateCell(null, value);
            }
        } else {
            this.updateCell(null, "");
        }
    }

    locate() { // when input a new cell label & try to locate
        const regEx = /^[A-Z]+[1-9][0-9]*$/;
        let label = this.locator.value;
        if (!regEx.test(label)) {
            alert('Wrong Pattern!');
            this.setLocator();
        } else {
            let start = 0;
            while (!(label.charCodeAt(start) <= '9'.charCodeAt(0)
                && label.charCodeAt(start) >= '0'.charCodeAt(0))
            && start < label.length) {
                start++;
            }

            let x = label.substring(start);
            let y = label.substring(0, start);
            let yCode = this.sheet.letter2index(y);
            if (x > 0 && x <= this.sheet.rowNum && yCode >= 0 && yCode < this.sheet.colNum) {
                this.select(x, y);
            } else {
                alert('Out of Bound!');
                this.setLocator();
            }
        }

    }

    addRow() {// add row before/at
        this.sheet.addRow(this.x - 1);
        this.writeTable();
    }

    addRowAfter() {// add row after
        this.sheet.addRow(this.x);
        this.writeTable();
    }

    addColumn() {// add column left/at
        this.sheet.addColumn(this.y);
        this.writeTable();
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
        let sheetTable = this;
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

        //console.log(innerStr);
        this.table.innerHTML = innerStr;
        this.flushButtons();
        this.setLocator();
    }

    flushButtons() { // get all required buttons/cells
        this.rowBtns = this.getRowButtons();
        this.colBtns = this.getColButtons();
        this.tableCells = this.getTableCells();

        this.select(this.x, this.y);
    }

    updateCell(formula, val) { // update cell's content
        this.sheet.updateCell(this.x, this.y, val, formula);
        let cell = this.sheet.getCell(this.x, this.y).cell;
        cell.innerHTML = val;
        cell.setAttribute('title', val);
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
function showMenu(elementId) {
    let elements = ["file2-menu", "edit-menu", "help-menu"];
    elements.remove(elements.indexOf(elementId));
    document.getElementById(elementId).classList.toggle("show");
    elements.forEach(function (ele) {
        let dd = document.getElementById(ele);
        if (dd.classList.contains('show')) {
            dd.classList.remove('show');
        }
    })
}

// hide when click other places
window.onclick = function (e) {
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

const syncScroll = function () { // sync the horizontal scroll between pinned column bar && table
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

const newSpreadsheet = function (firstTime = false, row = 64, col = 27) {
    document.sheetTable = new SheetTable(row, col);
    if (firstTime) {
        document.sheetTable.addListeners();
    }
};

const newFile = function () { // start a new spreadsheet
    //hideMenu();
    if (confirm("Are you sure to create a new file? This operation would clear all the contents you have changed. ")) {
        newSpreadsheet();
    }
};

const openFile = function () {
    if (confirm("Are you sure to import? This operation would clear all the contents. ")) {
        let fileBtn = document.getElementById('file-btn');
        fileBtn.click();
    }
};

const loadFile = function (str) {
    if (str.length < 1) {
        alert('Something Wrong Happened~');
        return;
    }
    let array = csv2array(str);
    //console.log(array);
    let shape = getArrayShape(array);
    if (shape[0] < 1 || shape[1] < 1) {
        return;
    }
    newSpreadsheet(false, shape[0], shape[1]);
    let tbl = document.sheetTable;
    for (let i = 1; i <= shape[0]; i++) {
        let arr = array[i - 1];
        for (let j = 0; j < arr.length; j++) {
            const letter = tbl.sheet.index2letter(j);
            tbl.importCell(i, letter, arr[j]);
            //console.log('Processing ' + letter + i);
        }
    }
    //tbl.addListeners();
    //tbl.select(1, 'A');
};

const getArrayShape = function (array) {
    let row = array.length;
    let col = -1;
    array.forEach(function (subArray) {
        col = Math.max(subArray.length, col);
    });
    return [row, col];
};

newSpreadsheet(true);
syncScroll();





