"use strict";

import Matrix from 'ml-matrix';
import Page from "./Page.js";

/**
* Class Network
*/

export default class Network {
    constructor(npages, nlinks) {
        this.npages = npages;
        this.nlinks = nlinks;
        this.pageArray = [];    // array of Page objects
        this.adjMat = [];       // 2d array of int (adjacency matrix)
        this.hyperMat = [];     // 2d array of int (Hyperlink matrix)
        this.modMat = [];       // Matrix object (modified matrix)
        this.pageRankMat = [];  // Matrix object (PageRank)
        this.sortedPRMat = [];  // 2d array of sorted PR values
    }


    // Fill pageArray with npages and nlinks
    generateRandom() {
        for (let i = 0; i < this.npages; i++) {
            let page = new Page(i + 1);
            this.pageArray.push(page);
        }

        // Assign links to pages
        for (let i = 0; i < this.nlinks; i++) {
            // Index of page origin in array [0, this.npages - 1]
            let pOrigin = Math.floor(Math.random() * this.npages);
            // ID of page target
            let targetId = Math.floor(Math.random() * this.npages) + 1;
            let pageOrigin = this.pageArray[pOrigin];
            if (targetId == pageOrigin.id || pageOrigin.links.includes(targetId)) {
                i--;
            } else {
                this.pageArray[pOrigin].links.push(targetId);
            }
        }

        // Assign keywords to pages
        let words = ["dog", "cat", "horse", "chicken", "fish", "bear",
        "bird", "shark", "snake", "pig", "lion", "turkey", "wolf", "spider"];

        for (let i = 0; i < this.npages; i++) {
            // One page can have [1, 3] keywords
            let nkeys = Math.floor(Math.random() * 3) + 1;
            for (let key = 0; key < nkeys; key++) {
                let wordIndex = Math.floor(Math.random() * words.length);
                if (this.pageArray[i].keywords.includes(words[wordIndex])) {
                    key--;
                } else {
                    this.pageArray[i].keywords.push(words[wordIndex]);
                }
            }
        }
    }

    // Generate adjacency matrix from pageArray
    generateAdjacencyMatrix() {
        let mat = [];
        for (let row = 0; row < this.npages; row++) {
            // let aRow = Array(this.npages).fill(0);
            let aRow = [];
            for (let i = 0; i < this.npages; i++) {
                aRow.push(0);
            }
            this.pageArray[row].links.forEach (function (link) {
                aRow[link - 1] = 1;
            });
            this.adjMat.push(aRow);
        }
    }


    // Create HTML table from adjacency matrix
    getAdjacencyMatrixAsTable(htmlElement) {
        this.generateAdjacencyMatrix();
        let table = "<table class='matrix-table'>";
        for (let row = 0; row <= this.npages; row++) {
            table += "<tr>";
            for (let col = 0; col <= this.npages; col++) {
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
                        let value = this.adjMat[row - 1][col - 1];
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
        return table;
    }

    // Calculates Hyperlink matrix
    calculateHyperlinkMat() {
        for (let row = 0; row < this.npages; row++) {
            let aRow = [];
            for (let col = 0; col < this.npages; col++) {
                let hVal = 0;
                if (row != col && this.adjMat[row][col] != 0) {
                    let counter = 0;
                    for (let r = 0; r < this.npages; r++) {
                        counter += parseInt(this.adjMat[r][col]);
                    }
                    hVal = (1 / counter);
                }
                aRow.push(hVal);
            }
            this.hyperMat.push(aRow);
        }
    }

    // Modify hyperlink matrix to handle matrices with dangling pages
    // M = (1 − m)H + mS
    modifyMatrix() {
        const m = 0.15;
        let matH = new Matrix(this.hyperMat);
        let matS = [];
        for (let row = 0; row < this.npages; row++) {
            let aRow = [];
            for (let i = 0; i < this.npages; i++) {
                aRow.push(1 / this.npages);
            }
            matS.push(aRow);
        }
        matS = new Matrix(matS);

        this.modMat = Matrix.add(Matrix.mul(matH, (1 - m)), Matrix.mul(matS, m));
    }

    // Calculate PageRank
    calculatePageRank() {
        this.calculateHyperlinkMat();   // Calculate Hyperlink matrix
        this.modifyMatrix();            // Adjust matrix for dangling pages
        // Vector
        let array2D = [];
        for (let i = 0; i < this.npages; i++) {
            array2D.push([1 / this.npages]);
        }
        let vector = new Matrix(array2D);

        let rankMat = null;
        let prevMat = null;
        let k = 1;
        let iterate = true;
        do {
            let mkMat = this.modMat;
            // Calculate M^k
            for (let i = 0; i < k - 1; i++) {
                mkMat = this.modMat.mmul(mkMat);
            }

            // PageRank
            rankMat = mkMat.mmul(vector);

            // Check whether condition to stop iteration is met.
            if (this.isIterationOver(rankMat, prevMat)) {
                iterate = false;
            } else {
                prevMat = rankMat;
                k++;
            }
        } while (iterate);

        this.pageRankMat = rankMat;
        // console.log("k: " + k);
    }

    // Return true |actualMat − prevMat| < ε for every value
    isIterationOver(actualMat, prevMat) {
        if (prevMat == null) {
            return false;
        }
        let subsMat = Matrix.sub(actualMat, prevMat);

        for (let row = 0; row < this.npages; row++) {
            // ε = 0.001
            if (Math.abs(subsMat.get(row, 0)) > 0.001) {
                return false;
            }
        }

        return true;
    }

    // Sort PageRank matrix by PR value
    sortPageRank() {
        // Extract Matrix to array with dimensions (npages x 1)
        let array2d = [];
        for (let row = 0; row < this.npages; row++) {
            array2d.push([row, this.pageRankMat.get(row, 0)]);
        }

        // Sort
        array2d.sort(function compare(a, b) {
            return b[1] - a[1];
        });

        this.sortedPRMat = array2d;
    }

    // Return HTML table with all pages sorted by PR value
    getPagesTable(htmlElement) {
        this.calculatePageRank();    // Calculate Page Rank matrix
        this.sortPageRank();         // Sort Page Rank matrix by PR value
        let table = "<h3>Pages sorted by PageRank value</h3><hr>";
        table += "<table class='result-table'><tr><th>page #</th><th>PR</th><th>Keywords</th></tr>";
        this.sortedPRMat.forEach(page => {
            table += "<tr>";
            table += "<td>" + parseInt(page[0] + 1) + "</td>";
            table += "<td>" + page[1] + "</td>";
            // Keywords column
            table += "<td>" + this.pageArray[page[0]].keywords.toString() + "</td>";
            table += "</tr>";
        });
        table += "</table>";
        return table;
    }

    // Return HTML table with result for search with given string
    getSearchResultAsTable(str) {
        let searchStr = str.trim().toLowerCase();
        let table = "<h3>Search result</h3><hr>";
        table += "<table class='result-table'><tr><th>#</th><th>Keyword</th></tr>";
        let empty = true;
        this.sortedPRMat.forEach(page => {
            let pageObj = this.pageArray[page[0]];
            pageObj.keywords.forEach(function (keyword) {
                if (keyword.includes(searchStr)) {
                    table += "<tr>";
                    table += "<td>" + pageObj.id + "</td>";
                    table += "<td>" + keyword + "</td>";
                    table += "</tr>";
                    empty = false;
                }
            });
        });
        if (empty) {
            table += "<tr><td>-</td><td>-</td></tr>";
        }
        table += "</table>";
        return table;
    }
}
