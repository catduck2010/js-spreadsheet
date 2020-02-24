const rxjs = require('rxjs');
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
            row.insert(at, new SheetCell(" ".trim()));
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
        this.x = 0;
        this.y = 'A';
        this.locator = document.getElementById('locator');
        this.textedit = document.getElementById('text-edit');
        this.sheet = new Sheet(row, col);
        this.rowBar = document.getElementById('left-row-bar');
        this.colBar = document.getElementById('sticky-col-bar');
        this.table = document.getElementById('sheet-table');
        // console.log(document.getElementById('left-row-bar'));
        // console.log(this.table);
        this.writeTable();
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
            str += '<button class="button sheet-button row-button">' + (i + 1) + '</button>';
        }
        this.rowBar.innerHTML = str;
        //console.log(str);
    }

    writeColBar() {
        let str = '<tr class="bg-lightgray">';
        for (let i = 0; i < this.sheet.colNum; i++) {
            str += '<td><button class="button sheet-button column-button">' + this.sheet.index2letter(i) + '</button></td>';
        }
        str += '</tr>';
        this.colBar.innerHTML = str;
        return str;
    }

    writeTable() {
        this.writeRowBar();
        let innerStr = this.writeColBar();
        let board = this.sheet.board;
        board.forEach(function (row) {
            let temp = '<tr>';
            row.forEach(function (cell) {
                let str = cell.str;

                temp += '<td>' + cell.str + '</td>'

            });
            temp += '</tr>';
            innerStr += temp;
        });
        //console.log(innerStr);
        this.table.innerHTML = innerStr;
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
    }
    up.addEventListener('mouseover', function () {
        down.removeEventListener('scroll', syncDown);
        up.addEventListener('scroll', syncUp);
    });
    down.addEventListener('mouseover', function () {
        up.removeEventListener('scroll', syncUp);
        down.addEventListener('scroll', syncDown);
    });
};


const newFile = function () {
    hideMenu();
    if (confirm("Are you sure to create a new file? This operation would clear all the contents you have changed. ")) {
        document.sheetTable = new SheetTable(30, 27);
    }
};

document.sheetTable = new SheetTable(30, 27);
syncScroll();





