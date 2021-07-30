describe('Check API', () => {
    it('Get Data', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:8080/analytics',
            headers: {
                auth: 'SuperGoodPassword'
            }
        }).then(res => {
            expect(res.status).to.eq(200);
        });
    });

    it('Test Auth', () => {
        cy.request({
            method: 'GET',
            url: 'http://localhost:8080/analytics',
            failOnStatusCode : false,
            headers: {
                auth: 'FakePa$$w0rd'
            }
        }).then(res => {
            expect(res.status).to.eq(401);
        });
    });
});
