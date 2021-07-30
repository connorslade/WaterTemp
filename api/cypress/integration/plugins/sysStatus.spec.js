const sysStatus = require('../../../plugins/sysStatus/index');

describe('Basic', () => {
    it('Visits System Status page', () => {
        cy.visit('http://localhost:8080/status');
    });
});

describe('Check Version', () => {
    it('Check Page Title', () => {
        cy.visit('http://localhost:8080/status');
        cy.title().should('include', `V${sysStatus.version}`);
    });

    it('Check Page Content', () => {
        cy.visit('http://localhost:8080/status');
        cy.get('#title').contains(sysStatus.version);
    });
});

describe('Check System Status', () => {
    it('Server Version', () => {
        cy.visit('http://localhost:8080/status');
        cy.get('p.web')
            .contains(/Version: .*/)
            .should(e => expect(e.text()).not.to.include('{VERSION}'));
    });

    it('Server TLS', () => {
        cy.visit('http://localhost:8080/status');
        cy.get('p')
            .contains(/TLS: .*/)
            .should(e => expect(e.text()).not.to.include('{TLS}'));
    });

    it('Server IP', () => {
        cy.visit('http://localhost:8080/status');
        cy.get('p')
            .contains(/IP: .*/)
            .should(e => expect(e.text()).not.to.include('{IP}'));
    });

    it('Server Port', () => {
        cy.visit('http://localhost:8080/status');
        cy.get('p')
            .contains(/Port: .*/)
            .should(e => expect(e.text()).not.to.include('{PORT}'));
    });

    it('Server System', () => {
        cy.visit('http://localhost:8080/status');
        cy.get('p')
            .contains(/System: .*/)
            .should(e => expect(e.text()).not.to.include('{SYSTEM}'));
    });

    it('Server Uptime', () => {
        cy.visit('http://localhost:8080/status');
        cy.get('p').contains(/Uptime: .*/).should(e =>
            expect(e.text()).not.to.include('{UPTIME}')
        );
    });

    it('Server Plugins', () => {
        cy.visit('http://localhost:8080/status');
        cy.get('p').contains(/Plugins: .*/).should(e =>
            expect(e.text()).not.to.include('{PLUGINS}')
        );
    });

    it('Sensor Connected', () => {
        cy.visit('http://localhost:8080/status');
        cy.get('p').contains(/Connected: .*/).should(e =>
            expect(e.text()).not.to.include('{S_CONNECTED}')
        );
    });

    it('Sensor Version', () => {
        cy.visit('http://localhost:8080/status');
        cy.get('p.sensor').contains(/Version: .*/).should(e =>
            expect(e.text()).not.to.include('{S_VERSION}')
        );
    });

    it('Sensor Message', () => {
        cy.visit('http://localhost:8080/status');
        cy.get('p').contains(/Message: .*/).should(e =>
            expect(e.text()).not.to.include('{S_MESSAGE}')
        );
    });

    it('Sensor Last Update', () => {
        cy.visit('http://localhost:8080/status');
        cy.get('p').contains(/Last Update: .*/).should(e =>
            expect(e.text()).not.to.include('{S_LAST_UPDATE}')
        );
    });

    it('Sensor Temp', () => {
        cy.visit('http://localhost:8080/status');
        cy.get('p').contains(/Temperature: .*/).should(e =>
            expect(e.text()).not.to.include('{S_TEMP}')
        );
    });
});
