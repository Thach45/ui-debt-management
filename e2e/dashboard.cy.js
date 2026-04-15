describe('Dashboard', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'))
  })

  it('should display dashboard information', () => {
    cy.intercept('GET', '/api/v1/dashboard/stats').as('getDashboardStats')

    cy.visit('/')

    cy.wait('@getDashboardStats').then(interception => {
      // Check status code
      expect(interception.response?.statusCode).to.eq(200)

      // Check response body
      const body = interception.response?.body?.data
      expect(body).to.have.property('totalContracts')
      expect(body).to.have.property('activeCount')
      expect(body).to.have.property('overdueCount')
      expect(body).to.have.property('completedCount')
      expect(body).to.have.property('totalCollected').that.is.a('number')
      expect(body).to.have.property('totalRemaining').that.is.a('number')
    })

    // Check UI text
    cy.contains('Tổng hợp đồng').should('be.visible')
    cy.contains('Đang vay').should('be.visible')
    cy.contains('Quá hạn').should('be.visible')
    cy.contains('Đã tất toán').should('be.visible')
  })
})