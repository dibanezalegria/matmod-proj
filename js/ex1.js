// index.js
import Matrix from 'ml-matrix';

(function () {
    "use strict";

    /**
    * Number of nodes (pages) in the network.
    */
    const NPAGES = 8;


    // Adjacency matrix (lecture)
    // var initialValues = [
    //     [0, 0, 1, 1],
    //     [1, 0, 0, 0],
    //     [1, 1, 0, 1],
    //     [1, 1, 0, 0]
    // ];


    var initialValues = [
        [0, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 0, 1, 0, 0, 0],
        [0, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 1],
        [0, 0, 0, 0, 0, 1, 0, 0],
        [0, 0, 1, 0, 1, 0, 1, 0],
        [0, 0, 0, 0, 0, 0, 0, 1],
        [0, 0, 0, 1, 0, 0, 1, 0],
    ];


    /**
    * Create HTML table.
    */
    function createEmptyTable() {
        let table = "<table id='matrix' class='matrix-table'>";
        for (let row = 0; row <= NPAGES; row++) {
            table += "<tr>";
            for (let col = 0; col <= NPAGES; col++) {
                let td = "";
                if (row == 0) {
                    if (col == 0) {
                        td = "<td></td>";
                    } else {
                        td = "<td class='bold'>" + col + "</td>";
                    }
                } else {
                    if (col == 0) {
                        td = "<td class='bold'>" + row + "</td>";
                    } else {
                        td = "<td id='" +  row + "." + col + "'>" + 0 + "</td>";
                    }
                }

                table += td;
            }
            table += "</tr>";
        }
        table += "</table>";

        document.getElementById('table-div').innerHTML = table;

        // Set event for each cell
        table = document.getElementById('matrix');
        let cells = table.getElementsByTagName('td');
        Array.from(cells).forEach(function (cell) {
            // Get row and col
            let rowcol = cell.id.split(".");
            if (rowcol[0] == rowcol[1]) {
                cell.classList.add("disabled");
                cell.innerHTML = 0;
            } else if (rowcol[0] != 0 && rowcol[1] != 0) {
                cell.addEventListener("click", function () {
                    if (cell.classList.contains("active")) {
                        cell.classList.remove("active");
                        cell.innerHTML = 0;
                    } else {
                        cell.classList.add("active");
                        cell.innerHTML = 1;
                    }
                });
            }
        });
    }


    /**
    * Fill table with values from array.
    */
    function fillTable(values) {
        for (let row = 1; row <= NPAGES; row++) {
            for (let col = 1; col <= NPAGES; col++) {
                let id = row + "." + col;
                let element = document.getElementById(id);
                element.innerHTML = values[row - 1][col - 1];
                if (element.innerHTML == 1) {
                    element.classList.add("active");
                }
            }
        }
    }


    /**
    * Get values from html table.
    */
    function getTableValues() {
        let mat = [];
        let table = document.getElementById('matrix');
        let cells = table.getElementsByTagName('td');
        let cellArray = Array.from(cells);
        let cellCount = 0;
        for (let row = 0; row <= NPAGES; row++) {
            let aRow = [];
            for (let col = 0; col <= NPAGES; col++) {
                if (row != 0 && col != 0) {
                    aRow.push(cellArray[cellCount].innerHTML);
                }
                cellCount++;
            }
            if (row != 0) {
                mat.push(aRow);
            }
        }
        return mat;
    }


    /**
    * Calculate Hyperlink matrix.
    */
    function calculateHyperlink(mat) {
        let hyp = [];
        for (let row = 0; row < NPAGES; row++) {
            let aRow = [];
            for (let col = 0; col < NPAGES; col++) {
                let hVal = 0;
                if (row != col && mat[row][col] != 0) {
                    let counter = 0;
                    for (let r = 0; r < NPAGES; r++) {
                        counter += parseInt(mat[r][col]);
                    }
                    // hVal = (1 / counter).toFixed(3);
                    hVal = (1 / counter);
                }
                aRow.push(hVal);
            }
            hyp.push(aRow);
        }

        return hyp;
    }


    /**
    * Calculate PageRank.
    */
    function calculatePageRank(hypMat, niterations) {
        // Vector
        let array2D = [];
        for (let i = 0; i < NPAGES; i++) {
            array2D.push([1 / NPAGES]);
        }
        let vector = new Matrix(array2D);

        // Hyperlink matrix
        let hMatrix = new Matrix(hypMat);

        let mkMat = hMatrix;

        // Calculate M^k
        for (let i = 0; i < niterations - 1; i++) {
            mkMat = hMatrix.mmul(mkMat);
        }

        let rankMat = mkMat.mmul(vector);
        return rankMat;
    }


    /**
    * Print Hyperlink table.
    */
    function printHyperlinkTable(hyperMat) {
        let resultDiv = document.getElementById('hyperlink-div');
        let table = "<h3>Hyperlink matrix H</h3><hr><table class='result-table'>";
        for (let row = 0; row < NPAGES; row++) {
            table += "<tr>";
            for (let col = 0; col < NPAGES; col++) {
                table += "<td>" + hyperMat[row][col].toFixed(2) + "</td>";
            }
            table += "</tr>";
        }
        table += "</table>";
        resultDiv.innerHTML = table;
    }


    /**
    * Print PageRank table.
    */
    function printPageRankTable(rankMat, niterations) {
        let pageRankDiv = document.getElementById('pagerank-div');
        let table = "<h3>PageRank (" + niterations + " iterations)</h3><hr><table class='result-table'><tr><th>page</th><th>PR</th></tr>";
        for (let row = 0; row < NPAGES; row++) {
            table += "<tr>";
            table += "<td>" + (row + 1) + "</td>";
            table += "<td>" + rankMat[row][0] + "</td>";
            table += "</tr>";
        }
        table += "</table>";
        pageRankDiv.innerHTML = table;
    }


    /**
    * Check for dangling nodes.
    */
    function hasDanglingNodes(mat) {
        for (let row = 0; row < NPAGES; row++) {
            for (let col = 0; col < NPAGES; col++) {
                let counter = 0;
                for (let r = 0; r < NPAGES; r++) {
                    counter += parseInt(mat[r][col]);
                }
                if (counter == 0) {
                    return true;
                }
            }
        }
        return false;
    }


    // Get matrix Button
    var calculateBtn = document.getElementById("calculate-btn");
    calculateBtn.addEventListener("click", function () {
        // Get number of iterations
        let niterations = document.getElementById("num-iterations").value;
        if (niterations < 1 || niterations > 50) {
            niterations = 9;
        }
        let valuesMat = getTableValues();   // get updated values
        let errorMsg = document.getElementById("error-message");
        if (!hasDanglingNodes(valuesMat)) {
            errorMsg.innerHTML = "";
            let hypMat = calculateHyperlink(valuesMat);
            printHyperlinkTable(hypMat);
            let pageRankMat = calculatePageRank(hypMat, niterations);
            printPageRankTable(pageRankMat, niterations);
        } else {
            errorMsg.innerHTML = "Network has dangling nodes.";
            let resultDiv = document.getElementById('hyperlink-div');
            let pageRankDiv = document.getElementById('pagerank-div');
            resultDiv.innerHTML = "";
            pageRankDiv.innerHTML = "";
        }
    });


    createEmptyTable();
    fillTable(initialValues);

    // Done. Now just wait for button event from user.

}());
