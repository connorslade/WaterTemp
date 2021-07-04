describe('Basic', () => {
    it('Visits hosted web page', () => {
        cy.wait(500);
        cy.visit('http://localhost:8080');
    });
});

// Check data is coming from API
describe('API Check', () => {
    it('Temperature Data', () => {
        cy.visit('http://localhost:8080');
        cy.get('#temp').should(e => {
            expect(e.text()).not.to.include('...');
        });
    });

    it('Avg Temperature', () => {
        cy.visit('http://localhost:8080');
        cy.get('#avg').should(e => {
            expect(e.text()).not.to.include('...');
        });
    });
});

describe('Unit Changing', () => {
    it('Check unit set to F', () => {
        cy.visit('http://localhost:8080');
        cy.get('#unit').should('have.text', '°F');
    });

    it('Switch Unit to C', () => {
        cy.visit('http://localhost:8080');
        cy.get('#unit').click();
        cy.get('#unit').should('have.text', '°C');
    });

    it('Swich Unit to K', () => {
        cy.visit('http://localhost:8080');
        cy.get('#unit').click();
        cy.get('#unit').click();
        cy.get('#unit').should('have.text', '°K');
    });
});

describe('Chart', () => {
    it('Check chart is invisible', () => {
        cy.visit('http://localhost:8080');
        cy.get('#graph').should('have.css', 'display', 'none');
    });

    it('Toggle Chart Visibility', () => {
        cy.visit('http://localhost:8080');
        cy.get('#graphToggle').click();
        cy.get('#graph').should('have.css', 'display', 'block');
    });
});

describe('EXIT', () => {
    it('Stop server now that tests are done', () => {
        cy.visit('localhost:8080/EXIT');
    });
});
