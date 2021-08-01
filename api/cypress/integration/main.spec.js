describe('Basic', () => {
    it('Visits hosted web page', () => {
        cy.wait(500);
        cy.visit('http://localhost:8080');
    });

    it('Visits data get plugin is running', () => {
        cy.visit('http://localhost:8080/data');
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
        cy.get('#unit')
            .click()
            .then(() => {
                cy.get('#unit').should('have.text', '°C');
            });
    });

    it('Switch Unit to K', () => {
        cy.visit('http://localhost:8080');
        cy.get('#unit')
            .click()
            .then(() => {
                cy.get('#unit')
                    .click()
                    .then(() => {
                        cy.get('#unit').should('have.text', '°K');
                    });
            });
    });
});

describe('Test saving options to LocalStorage', () => {
    it('Check LocalStorage Init', () => {
        cy.visit('http://localhost:8080');
        cy.get('#unit')
            .click()
            .should(() => {
                expect(localStorage.getItem('setup')).to.eq('true');
            });
    });

    it('Save Unit', () => {
        cy.visit('http://localhost:8080');
        cy.get('#unit')
            .click()
            .should(() => {
                expect(localStorage.getItem('unit')).to.eq('1');
            });
    });

    it('Save Showing Graph', () => {
        cy.visit('http://localhost:8080');
        cy.get('#graphToggle')
            .click()
            .should(() => {
                expect(localStorage.getItem('showingGraph')).to.eq('true');
            });
    });
});

describe('Chart', () => {
    it('Check chart is invisible', () => {
        cy.visit('http://localhost:8080');
        cy.get('#graph').should('have.css', 'display', 'none');
    });

    it('Toggle Chart Visibility', () => {
        cy.visit('http://localhost:8080');
        cy.get('#graphToggle')
            .click()
            .then(() => {
                cy.get('#graph').should('have.css', 'display', 'block');
            });
    });

    it('Chart Size [WIDE]', () => {
        cy.visit('http://localhost:8080');
        cy.viewport(1920, 1080);
        cy.get('#graphToggle')
            .click()
            .then(() => {
                cy.get('#graph').should('have.css', 'width', '1920px');
                cy.get('#graph').should('have.css', 'height', '972px');
            });
    });

    it('Chart Size [NARROW]', () => {
        cy.visit('http://localhost:8080');
        cy.viewport(375, 812);
        cy.get('#graphToggle')
            .click()
            .then(() => {
                cy.get('#graph').should('have.css', 'width', '375px');
                cy.get('#graph').should('have.css', 'height', '284px');
            });
    });
});

describe('Error 404 Page', () => {
    it('Check 404 Page', () => {
        cy.visit('http://localhost:8080/asdf', { failOnStatusCode: false });
        cy.title().should('eq', 'Error');
        cy.get('p')
            .contains(/The page .* was not found... sorwy./)
            .should(e => expect(e.text()).include('/asdf'));
    });
});
