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
        this.cell = null;
        this.formula = null;
        this.str = str;
    }
}

class Sheet {
    constructor(rows, cols) {
        this.board = [];
        this.rowNum = rows;
        this.colNum = cols;
        for (let i = 0; i < rows; i++) {
            let temp = [];
            for (let j = 0; j < cols; j++) {
                temp.push(new SheetCell("01234567890123456789"));
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

    getCell(row, col) {
        let x = row;
        let y = this.letter2index(col);

        return this.board[x][y];
    }

    get(row, col) {
        return this.getCell(row, col).str;
    }

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

class SheetTable {
    constructor(row, col) {
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
        this.writeTable();
        this.toggleSelect(1, 'A');
        this.rowBtns = this.getRowButtons();
        this.colBtns = this.getColButtons();
        this.cornerBtn = this.getCornerBtn();
    }

    getCornerBtn() {
        let btn = document.getElementById('corner-btn');
        let sheetTable = this;
        btn.addEventListener("click", function () {
            sheetTable.selectAll();
        });
        return btn;
    }

    getRowButtons() {
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

    getColButtons() {
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

    toggleSelect(x, y) {
        let cell = document.getElementById(y + '-cell-' + x).parentElement;
        let col = document.getElementById('col-btn-' + y).parentElement;
        let row = document.getElementById('row-btn-' + x);
        col.classList.toggle('selected-row-col');
        row.classList.toggle('selected-row-col');
        cell.classList.toggle('selected-cell');
    }

    select(x, y) {
        this.unselect();
        this.x = x;
        this.y = y;
        this.toggleSelect(x, y);
        this.flags = [false, false];
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
    }

    selectAll() {
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
    }

    unselect() {
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
                this.toggleSelect(this.x, this.y);
            }
        }
    }


    getCur() {
        let res = [];
        let label = this.locator.value;
        let start = 0;
        while (!(label.charCodeAt(start) <= '9'.charCodeAt(0)
            && label.charCodeAt(start) >= '0'.charCodeAt(0))
        && start < label.length) {
            start++;
        }
        if (start === label.length) return [];
        return [Number.parseInt(label.substring(start)) - 1, label.substring(0, start)];
    }

    addRow(at) {
        this.sheet.addRow(at);
        this.writeTable();
    }

    addRowAfter(at) {
        this.addRow(at + 1);
    }

    addColumn(at) {
        this.sheet.addColumn(at);
        this.writeTable();
    }

    addColumnAfter(at) {
        this.sheet.addColumnAfter(at);
        this.writeTable();
    }

    deleteRow(at) {
        this.sheet.delRow(at);
        this.writeTable();
    }

    deleteColumn(at) {
        this.sheet.delColumn(at);
        this.writeTable();
    }

    writeRowBar() {
        let str = "";
        for (let i = -1; i < this.sheet.rowNum; i++) {
            str += '<button class="button sheet-button row-button" id="row-btn-' + (i + 1) + '">' + (i + 1) + '</button>';
        }
        this.rowBar.innerHTML = str;
        //console.log(str);
    }

    writeColBar() {
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

    writeTable() {
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
    }

    flushTable() {

    }
}


let testFunction = function () {
    let sheet = new Sheet(5, 5,);
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            sheet.board[i][j].str = 'H';
        }
    }
    sheet.addColumn('F');

    console.log(sheet.getStrBoard());
};


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

const syncScroll = function () {
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


const newFile = function () {
    hideMenu();
    if (confirm("Are you sure to create a new file? This operation would clear all the contents you have changed. ")) {
        document.sheetTable = new SheetTable(100, 27);
    }
};

document.sheetTable = new SheetTable(100, 27);
document.sheetTable.locator.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        console.log('Pressed');
        this.blur();
    }
})
syncScroll();
let enterPress = function (e) {
    let keyCode = null;
    if (e.which) keyCode = e.which; else if (e.keyCode) keyCode = e.keyCode;
    if (keyCode == 13) {
        return false;
    }
    return true;

};




