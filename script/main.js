//const rxjs = require('rxjs');
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

class SheetCell {
    constructor(str) {
        this.cell = null; // store the cell that represents it on the sheet table
        this.formula = null; // stores formula
        this.str = str; //stores value
    }
}

class Sheet { // spreadsheet data structure
    constructor(rows, cols) { // create sheet
        this.board = [];
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
                temp.push(cell.str);
            });
            res.push(temp);
        });
        return res;
    }

    toCSV() {
        let rows = this.getStrBoard();
        return "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(",")).join("\n");
    }

    updateCell(x, y, str, formula) { // update cell's content
        let cell = this.getCell(x, y);
        cell.formula = formula;
        cell.str = str;
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
        this.cornerBtn = null;
        this.tableCells = null;
        this.checkBtn = null;
        this.crossBtn = null;
        this.fxBtn = null;

        this.clicked = 0;
        this.writeTable();
        this.addListeners();
    }


    addListeners() { // add listeners to input & button elements
        let sheetTable = this;
        // locator's listener
        this.locator.addEventListener("keyup", function (event) {
            if (event.key === "Enter") { // press Enter or return
                //console.log('Pressed');
                sheetTable.locate();
                this.blur();
            } else if (event.key === "Escape") {
                sheetTable.setLocator();
                this.blur();
            }
        });
        // textedit's listener
        this.textedit.addEventListener("keyup", function (event) {
            if (event.key === "Enter") {
                sheetTable.editCell();
                this.blur();
            } else if (event.key === "Escape") {
                sheetTable.setLocator();
                this.blur();
                sheetTable.disableButtons();
            }
        });
        // this.textedit.addEventListener("input", function () {
        //     let curVal = this.value;
        //     if (curVal === '' || curVal.length === 0) {
        //         sheetTable.enableButton(sheetTable.fxBtn);
        //     } else {
        //         sheetTable.disableButton(sheetTable.fxBtn);
        //     }
        // });
        this.textedit.addEventListener("focusin", function () {
            sheetTable.enableButton(sheetTable.checkBtn);
            sheetTable.enableButton(sheetTable.crossBtn);
            sheetTable.enableButton(sheetTable.fxBtn);
        });

        const buttonClicked = function (resolve, reject) {
            setTimeout(function () {
                if (sheetTable.clicked > 0) {
                    resolve(true);
                } else {
                    reject('No Button Clicked');
                }
            });
        };

        this.crossBtn.addEventListener("click", function () {
            sheetTable.setLocator();
            console.log('X Clicked');
            this.blur();
            sheetTable.disableButtons();
        });

        this.checkBtn.addEventListener("click", function () {
            sheetTable.editCell();
            console.log('Check Clicked');
            this.blur();
            sheetTable.disableButtons();
        });

        this.fxBtn.addEventListener("click", function () {
            let val = sheetTable.textedit.value;
            if (val.length > 0 && val.charAt(0) !== '=') {
                sheetTable.textedit.value = "=" + val;
            }
            this.blur();
            sheetTable.textedit.focus();
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
            this.textedit.value = cell.str;
        }
        this.disableButtons();
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
                cell.setAttribute('title', sheetTable.sheet.getCell(i, letter).str);
                this.sheet.getCell(i, letter).cell = cell;
                row.push(cell);
            }
            buttons.push(row);
        }
        return buttons;
    }

    getCornerBtn() { // make corner btn able to select all cells
        let btn = document.getElementById('corner-btn');
        let sheetTable = this;
        btn.addEventListener("click", function () {
            sheetTable.selectAll();
        });
        return btn;
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
        let res = [];
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
        if (this.sheet.rowNum <= 1 || this.sheet.colNum <= 1) {
            alert('You cannot delete the only row!'); //you cannot delete the only cell
        } else if (confirm("Are you sure to delete Row " + this.x + " ?")) {
            this.sheet.delRow(this.x - 1);
            this.x = this.x > 1 ? this.x - 1 : this.x;
            this.writeTable();
        }
    }

    deleteColumn() {//delete selected column
        if (this.sheet.rowNum <= 1 || this.sheet.colNum <= 1) {
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
            let temp2 = '<td><button class="button sheet-button column-button">'
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

                temp += '<td><div class="cell-div" ' +
                    'id="' + sheet.index2letter(j) + '-cell-' + (i + 1) + '">' + cell.str + '</div></td>';
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
        this.cornerBtn = this.getCornerBtn();
        this.tableCells = this.getTableCells();
        this.checkBtn = document.getElementById('check-btn');
        this.crossBtn = document.getElementById('cross-btn');
        this.fxBtn = document.getElementById('fx-btn');
        this.select(this.x, this.y);
    }

    updateCell(formula, val) { // update cell's content
        this.sheet.updateCell(this.x, this.y, val, formula);
        let cell = this.sheet.getCell(this.x, this.y).cell;
        cell.innerHTML = val;
        cell.setAttribute('title', val);
        this.setLocator();
    }
}

// test only
// let testFunction = function () {
//     let sheet = new Sheet(5, 5,);
//     for (let i = 0; i < 5; i++) {
//         for (let j = 0; j < 5; j++) {
//             sheet.board[i][j].str = 'H';
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

// hide menu
const hideMenu = function () {
    let elements = ["file2-menu", "edit-menu", "help-menu"];
    elements.forEach(function (ele) {
        let dd = document.getElementById(ele);
        if (dd.classList.contains('show')) {
            dd.classList.remove('show');
        }
    });
};
// hide when click other places
window.onclick = function (e) {
    if (!e.target.matches('.drop-btn')) {
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


const newFile = function () { // start a new spreadsheet
    //hideMenu();
    if (confirm("Are you sure to create a new file? This operation would clear all the contents you have changed. ")) {
        document.sheetTable = new SheetTable(100, 27);
    }
};

document.sheetTable = new SheetTable(100, 27);

syncScroll();





