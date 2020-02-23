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
        this._rowNum = rows;
        this._colNum = cols;
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
        for (let i = 0; i < this._colNum; i++) {
            temp.push(new SheetCell(""));
        }
        this.board.insert(at, temp);
        this._rowNum++;
    }

    addColumn(at) {//at as before, at+1 as after
        at = this._letter2index(at);
        this.addColumnWithNum(at);
    }

    addColumnWithNum(at) {
        this.board.forEach(function (row) {
            row.insert(at, new SheetCell(""));
        });
        this._colNum++;
    }

    delRow(at) {
        this.board.remove(at);
        this._rowNum--;
    }

    delColumn(at) {
        at = this._letter2index(at);
        this.delColumnWithNum(at);
    }

    delColumnWithNum(at) {
        this.board.forEach(function (row) {
            row.remove(at);
        });
        this._colNum--;
    }

    getCell(row, col) {
        let x = row;
        let y = this._letter2index(col);

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
        let csvContent = "data:text/csv;charset=utf-8,"
            + rows.map(e => e.join(",")).join("\n");
        return csvContent;
    }


    _letter2index(letter) {
        let str = letter.toUpperCase();
        let num = 0, increase = 0;
        for (let i = str.length - 1; i >= 0; i--) {
            num += increase + str.charCodeAt(i) - 'A'.charCodeAt(0);
            increase += 26;
        }
        //console.log(num);
        return num;
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

document.sheet = new Sheet(10, 10);

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

const newFile = function () {
    hideMenu();
    if (confirm("Are you sure to create a new file? This operation would clear all the contents you have changed. ")) {
        document.sheet = new Sheet(10, 10);
    }
};




