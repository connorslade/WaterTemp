const simpleAPi = require('../../../plugins/simpleAPi/index');

describe('Basic', () => {
    it('Visits Api Docs Page', () => {
        cy.visit('http://localhost:8080/api');
    });
});

describe('Check Version', () => {
    it('Check Page Title', () => {
        cy.visit('http://localhost:8080/api');
        cy.title().should('include', `V${simpleAPi.version}`);
    });

    it('Check Page Footer', () => {
        cy.visit('http://localhost:8080/api');
        cy.get('.footer-content').should('contain', `V${simpleAPi.version}`);
    });
});

describe('Simple API', () => {
    it('Get Temp', () => {
        cy.request('http://localhost:8080/api/temp');
    });

    it('Get Temp At', () => {
        cy.request('http://localhost:8080/api/temp/0');
    });

    it('Get Stats', () => {
        cy.request('http://localhost:8080/api/stats');
    });

    it('Get History', () => {
        cy.request('http://localhost:8080/api/history');
    });
});