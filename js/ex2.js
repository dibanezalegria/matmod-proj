"use strict";

import Matrix from 'ml-matrix';
import Network from "./Network.js";

(function () {

    /**
    * Run application
    */
    function run(npages, nlinks) {
        network = new Network(npages, nlinks);
        network.generateRandom();

        let adjMatTable = network.getAdjacencyMatrixAsTable();
        let tableDiv = document.getElementById("table-div");
        tableDiv.innerHTML = adjMatTable;

        let pagesTable = network.getPagesTable();
        let pagesDiv = document.getElementById("view-pages-div");
        pagesDiv.innerHTML = pagesTable;
    }

    /**
    * Event handler for reset button.
    */

    var resetBtn = document.getElementById("reset-btn");
    resetBtn.addEventListener("click", function () {
        let npages = document.getElementById("num-pages").value;
        let nlinks = document.getElementById("num-links").value;
        let errorMsg = document.getElementById("error-message");
        let resultDiv = document.getElementById('search-result-div');
        resultDiv.innerHTML = "";

        if (npages < 4 || npages > 40 || nlinks < 1 || nlinks > (npages * (npages - 1))) {
            errorMsg.innerHTML = "Check the following:<br>- Number of pages must be in [4,40] range.<br>- Number of links must be bigger than 0.<br>- Number of links must be less or equal than (pages x (pages - 1))."
            let pagesDiv = document.getElementById("view-pages-div");
            pagesDiv.innerHTML = "";
            network = null;
        } else {
            errorMsg.innerHTML = "";
            run(npages, nlinks);
        }
    });

    /**
    * Event handler for search button.
    */

    var searchBtn = document.getElementById("search-btn");
    searchBtn.addEventListener("click", function () {
        if (network == null) {
            return;
        }
        let word = document.getElementById("search").value;
        let resultDiv = document.getElementById('search-result-div');
        let errorMsg = document.getElementById("error-message");
        if (word.length < 3) {
            resultDiv.innerHTML = "";
            errorMsg.innerHTML = "Search string must be at least 3 characters.";
        } else {
            errorMsg.innerHTML = "";
            resultDiv.innerHTML = network.getSearchResultAsTable(word);
        }
    });

    // Begin execution
    var network = null;
    run(30, 50);
})();
