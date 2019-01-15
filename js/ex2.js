"use strict";

import Matrix from 'ml-matrix';
import Page from "./Page.js";

(function () {
    "use strict";

    /**
    * Number of nodes (pages) in the network.
    */
    const NPAGES = 4;


    /**
    * Create adjacency matrix as HTML table.
    *
    * @param {string} htmlElement html element to attach the table to
    * @param {Array} values 2d array with values
    *
    */
    function drawAdjacencyMatrix(htmlElement, values) {
        let table = "<table id='matrix'>";
        for (let row = 0; row <= NPAGES; row++) {
            table += "<tr>";
            for (let col = 0; col <= NPAGES; col++) {
                let td = "";
                if (row == 0) {
                    if (col == 0) {
                        td = "<td></td>";
                    } else {
                        td = `<td class='bold'>${col}</td>`;
                    }
                } else {
                    if (col == 0) {
                        td = `<td class='bold'>${row}</td>`;
                    } else {
                        let value = values[row - 1][col - 1];
                        let active = (value == 1) ? "active" : "";
                        td = `<td id="${row}.${col}">${value}</td>`;
                    }
                }

                table += td;
            }
            table += "</tr>";
        }
        table += "</table>";

        document.getElementById(htmlElement).innerHTML = table;
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
                    hVal = (1 / counter);
                }
                aRow.push(hVal);
            }
            hyp.push(aRow);
        }

        return hyp;
    }


    /**
    * Covert matrix H to S to allow dangling nodes.
    * Formula: M = (1 − m)H + mS
    */
    function modifyMatrix(hyperMat) {
        const m = 0.15;
        let matH = new Matrix(hyperMat);
        let matS = [];
        for (let row = 0; row < NPAGES; row++) {
            matS.push(Array(NPAGES).fill(1 / NPAGES));
        }
        matS = new Matrix(matS);

        let res = Matrix.add(Matrix.mul(matH, (1 - m)), Matrix.mul(matS, m));

        return res;
    }


    /**
    * Calculate PageRank.
    */
    function calculatePageRank(mat) {
        // Modified M matrix
        let modMat = new Matrix(mat);

        // Vector
        let array2D = [];
        for (let i = 0; i < NPAGES; i++) {
            array2D.push([1 / NPAGES]);
        }
        let vector = new Matrix(array2D);

        let rankMat = null;
        let prevMat = null;
        let k = 1;
        let iterate = true;
        do {
            console.log("k: " + k);
            let mkMat = modMat;
            // Calculate M^k
            for (let i = 0; i < k - 1; i++) {
                mkMat = modMat.mmul(mkMat);
            }

            // PageRank
            rankMat = mkMat.mmul(vector);

            // Check whether condition to stop iteration is met.
            if (isIterationOver(rankMat, prevMat)) {
                iterate = false;
            } else {
                prevMat = rankMat;
                k++;
            }
        } while (iterate);

        return rankMat;
    }


    /**
    * Check whether condition to stop iteration is met.
    * Condition |r(k) − r(k − 1)| < ε with ε > 0
    */
    function isIterationOver(actualMat, prevMat) {
        if (prevMat == null) {
            return false;
        }
        let subsMat = Matrix.sub(actualMat, prevMat);

        for (let row = 0; row < NPAGES; row++) {
            if (subsMat.get(row, 0) != 0) {
                return false;
            }
        }

        return true;
    }



    // Adjacency matrix (lecture) 
    var mat = [
        [0, 0, 1, 1],
        [1, 0, 0, 0],
        [1, 1, 0, 1],
        [1, 1, 0, 0]
    ];


    drawAdjacencyMatrix("table-div", mat);
    var hyperMat = calculateHyperlink(mat);
    var modMat = modifyMatrix(hyperMat);
    var rankMat = calculatePageRank(modMat);


    console.log(rankMat);

})();
