/**
 * class representing a Document viewable on the kiruna explorer map
 * 
 * @param {string} title
 * @param {array} stakeholders
 * @param {string} date
 * @param {string} type
 * @param {string} language
 * @param {string} description
 * @param {number} areaId
 * @param {number} pages
 * @param {number} planNumber
 * @param {scale} scale
 */

export default class DocumentClass {
    constructor(title="", stakeholders=[], date="", type="none", language="", description="", areaId=null, scale="none", pages="", planNumber="", links=[]) {
        this.title = title;
        this.stakeholders = stakeholders;
        this.date = date;
        this.type = type;
        this.language = language;
        this.description = description;
        this.areaId = areaId;
        this.scale = scale;
        this.pages = pages;
        this.planNumber = planNumber;
        this.links = links
    }

}