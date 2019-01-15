"use strict";

import Matrix from 'ml-matrix';
import Page from "./Page.js";

(function () {
    /**
    * Create adjacency matrix as HTML table.
    *
    * @param {string} htmlElement html element to attach the table to
    * @param {Array} values Adjacency array (2D array)
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
                        let disabled = (row == col) ? "disabled" : "";
                        td = `<td id="${row}.${col}" class="${active} ${disabled}">${value}</td>`;
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
    *
    * @param {Array} mat adjacency array (2D array)
    *
    * @return {Array} Hyperlink array2D
    *
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
    *
    * @param {Array} hyperMat hyperlink array2D
    *
    * @return {Matrix} M array (2d)
    *
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
    *
    * @param {Matrix} mat
    *
    * @return {Matrix} Matrix (4x1)
    *
    */
    function calculatePageRank(modMat) {
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
            let mkMat = modMat;
            // Calculate M^k
            for (let i = 0; i < k - 1; i++) {
                mkMat = modMat.mmul(mkMat);
            }

            // PageRank
            rankMat = mkMat.mmul(vector);

            // Check whether condition to stop iteration is met.
            if (isIterationOver(rankMat, prevMat, k)) {
                iterate = false;
            } else {
                prevMat = rankMat;
                k++;
            }
        } while (iterate);

        console.log("iterations: " + k);

        return rankMat;
    }


    /**
    * Check whether condition to stop iteration is met.
    * Condition |r(k) − r(k − 1)| < ε with ε > 0.001
    *
    * @param {Array} actualMat PageRank for actual iteration
    * @param {Array} prevMat PageRank for previous iteration
    *
    * @return {Boolean} true if condition to finish iteration is met.
    *
    */
    function isIterationOver(actualMat, prevMat, k) {
        if (prevMat == null) {
            return false;
        }
        let subsMat = Matrix.sub(actualMat, prevMat);

        for (let row = 0; row < NPAGES; row++) {
            // ε > 0.001
            if (Math.abs(subsMat.get(row, 0)) > 0.001) {
                return false;
            }
        }

        return true;
    }


    /**
    * Generate random network with given number of nodes and links.
    *
    * @param {integer} totalPages
    * @param {integer} totalLinks
    *
    * @return {Array} array of Page objects
    *
    */
    function generateRandomNetwork(totalPages, totalLinks) {
        let pageArray = [];
        for (let i = 0; i < totalPages; i++) {
            let page = new Page(i + 1);
            pageArray.push(page);
        }

        // Assign links to pages
        for (let i = 0; i < totalLinks; i++) {
            // Index of page origin in array [0, totalPages - 1]
            let pOrigin = Math.floor(Math.random() * totalPages);
            // ID of page target
            let targetId = Math.floor(Math.random() * totalPages) + 1;
            let pageOrigin = pageArray[pOrigin];
            if (targetId == pageOrigin.id || pageOrigin.links.includes(targetId)) {
                i--;
            } else {
                pageArray[pOrigin].links.push(targetId);
            }
        }

        // Assign keywords to pages
        let words = ["dog", "cat", "horse", "chicken", "fish", "bear",
            "bird", "shark", "snake", "pig", "lion", "turkey", "wolf", "spider"];

        for (let i = 0; i < totalPages; i++) {
            // One page can have [1, 3] keywords
            let num = Math.floor(Math.random() * 3) + 1;
            for (let key = 0; key < num; key++) {
                let word = Math.floor(Math.random() * words.length);
                pageArray[i].keywords.push(words[word]);
            }
        }

        return pageArray;
    }


    /**
    * Generate adjancency matrix from array of pages.
    *
    * @param {Array} pageArray array of Page objects
    *
    * @return {Array} Adjacency Array (2D array)
    *
    */
    function createAdjacencyMatrix(pageArray) {
        let mat = [];
        for (let row = 0; row < NPAGES; row++) {
            let aRow = Array(NPAGES).fill(0);
                pageArray[row].links.forEach (function (link) {
                    aRow[link - 1] = 1;
                });
            mat.push(aRow);
        }
        return mat;
    }


    /**
    * Sort page rank matrix.
    *
    * @param {Matrix} mat
    *
    * @return {Array}   2d array with row [page number, PR value]
    *                   sorted by PR value DESC
    */
    function sortPageRank(mat) {
        // Extract Matrix to array 4x1
        let array2d = [];
        for (let row = 0; row < NPAGES; row++) {
            array2d.push([row, mat.get(row, 0)]);
        }

        // Sort
        array2d.sort(function compare(a, b) {
            return b[1] - a[1];
        });

        return array2d;
    }



    /**
    * Number of nodes (pages) and connections in the network.
    * Note maximum number of NLINKS = NPAGES * (NPAGES - 1)
    */
    const NPAGES = 5;
    const NLINKS = 20;

    // Adjacency matrix (lecture)
    // var mat = [
    //     [0, 0, 1, 1],
    //     [1, 0, 0, 0],
    //     [1, 1, 0, 1],
    //     [1, 1, 0, 0]
    // ];

    // Generate networks of pages
    var pageArray = generateRandomNetwork(NPAGES, NLINKS);
    var mat = createAdjacencyMatrix(pageArray);

    drawAdjacencyMatrix("table-div", mat);
    var hyperMat = calculateHyperlink(mat);
    var modMat = modifyMatrix(hyperMat);

    // // DEBUG
    // var modMat = new Matrix(hyperMat);
    //
    //
    var rankMat = calculatePageRank(modMat);

    console.log(rankMat);

    var sortMat = sortPageRank(rankMat);

    // console.log(rankMat);

})();
