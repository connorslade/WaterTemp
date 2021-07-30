const getData = require('../../../plugins/getData/index');

describe('Basic', () => {
    it('Visits Get Data page', () => {
        cy.visit('http://localhost:8080/data');
    });
});

// Check that the version number on the page is correct
describe('Check Version', () => {
    it('Check Page Title', () => {
        cy.visit('http://localhost:8080/data');
        cy.title().should('include', `V${getData.version}`);
    });

    it('Check Page Footer', () => {
        cy.visit('http://localhost:8080/data');
        cy.get('.footer-content').should('contain', `V${getData.version}`);
    });

    it('Check Error Page Footer', () => {
        cy.visit('http://localhost:8080/data/error.html');
        cy.get('.footer-content').should('contain', `V${getData.version}`);
    });
});

describe('Data Download', () => {
    it('Download CSV', () => {
        cy.visit('http://localhost:8080/data');
        cy.get('#CSV_DOWNLOAD').click();
    });

    it('Download JSON', () => {
        cy.visit('http://localhost:8080/data');
        cy.get('#JSON_DOWNLOAD').click();
    });
});