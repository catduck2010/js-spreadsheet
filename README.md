# Lihang Zhou's Assignment 6

#### Lihang Zhou 001302072

<div align="center">
	<img src="pics/za-warudo.gif" />
	<div>ZA WARUDO!</div>
	<div>ザ・ワールド!</div>
</div>

#### Main Features:
* **Excel-like Designs:** comes with name box, formula bar and 3 buttons to add function & apply/cancel changes;
* **Handling Complex Formulas:** `SUM` function can be part of the formula, e.g. `=4+SUM(A1:A5)/5` is calculated to `5` when `A1` to `A5` are all equal to `1`;
* **Reference Tree:** the data structure to detect circular references & determine the order of updating cells.

#### Technologies Used:
* Google Web Font(Open Sans, Noto Sans HK/KR/JP);
* node-sass
* RxJS

#### Requirements:
* Internet (Fonts & RxJS);
* nodejs & npm;

#### How To Run:
1. `git clone` to local directory;
2. Run `npm install` to install dependencies;
3. Rum `npm run-script build` to compile SCSS files to CSS file;
5. Double click `spreadsheet.html` to show webpage

#### Assignment Descriptions:
> Create a spreadsheet application like Google sheets using Javascript, RxJS, and CSS.
> 
> **User Requirements:**
> 
> 1. As a user, I should be able to add/delete rows/columns to the spreadsheet using specific buttons.
> 2. As a user, I should be able to select multiple rows or columns and display their sum in a cell by using a formula. The formula should be of the format "=SUM(START\_CELL:END\_CELL)". Example "=SUM(A1:A10)" to display the sum of all items from cell A1 to A10. Any changes to the cell content in the selected range should update the sum.
> 6. As a user, I should be able to perform simple algebraic operations (+, -, *, /) with cell references. Example "=A1+A2".
> 7. As a user, I should be able to export the sheet as a CSV file.
> 8. As a user, I should be able to load a CSV from the node server on clicking a load button.
> 
> **Technical Requirements:**
> 
> 1. The goal of this assignment is to learn about JavaScript events & RxJS.
> 2. Events for the formula should be implemented using RxJS and buttons can use simple event listeners.
> 3. On clearing formula, all subscribers and events should be cleared from the page.
> 4. No javascript frameworks should be used except RxJS.
> 5. No CSS frameworks should be used.
> 6. Should use ES6 syntax.
> 7. Should document your code extensively.
> 8. Should have .gitignore, ReadMe.md files.
> 9. ReadMe.md file should have markdown with project description and instructions to run the project.
> 
> Github Link: https://classroom.github.com/a/2mcQfQ9V
> 
> **Grading:**
> 
> This assignment will be graded for 200 points.
> 
> * Code documentation. (5 Points)
> * .gitignore, README.md and multiple Git commits (10 Points)
> * Use external CSS, JavaScript files. (5 Points)
> * If RxJS not used for formulas. (-50 Points)
> * Assignment completion. (180 Points)
> 
> **Useful Links:**
> 
> https://github.com/ReactiveX/rxjs#cdn
> 
> https://rxmarbles.com/
> 
> https://www.learnrxjs.io/

