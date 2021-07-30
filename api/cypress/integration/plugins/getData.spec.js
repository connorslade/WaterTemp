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

// Test the download buttons
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

// Make sure the data has been inserted into the site
describe('Stats data', () => {
    it('Data Points', () => {
        cy.visit('http://localhost:8080/data');
        cy.get('#POINTS').should(e =>
            expect(e.text()).not.to.include('{DATA_POINTS}')
        );
    });

    it('Data Rate', () => {
        cy.visit('http://localhost:8080/data');
        cy.get('#RATE').should(e =>
            expect(e.text()).not.to.include('{DATA_RATE}')
        );
    });

    it('Data Min', () => {
        cy.visit('http://localhost:8080/data');
        cy.get('#MIN').should(e =>
            expect(e.text()).not.to.include('{DATA_MIN}')
        );
    });

    it('Data Max', () => {
        cy.visit('http://localhost:8080/data');
        cy.get('#MAX').should(e =>
            expect(e.text()).not.to.include('{DATA_Max}')
        );
    });

    it('Data Start', () => {
        cy.visit('http://localhost:8080/data');
        cy.get('#START').should(e =>
            expect(e.text()).not.to.include('{DATA_S}')
        );
    });

    it('Data End', () => {
        cy.visit('http://localhost:8080/data');
        cy.get('#END').should(e =>
            expect(e.text()).not.to.include('{DATA_E}')
        );
    });

    it('Data Size', () => {
        cy.visit('http://localhost:8080/data');
        cy.get('#SIZE').should(e =>
            expect(e.text()).not.to.include('{DATA_SIZE}')
        );
    });
});
