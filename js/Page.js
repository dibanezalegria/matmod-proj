"use strict";

/**
* Class Page
*/

export default class Page {
    constructor(id) {
        this.id = id;
        this.keywords = [];
        this.links = [];     // array of pages ids linking to this page
    }
}
