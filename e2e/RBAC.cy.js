describe('template spec', () => {
  beforeEach(() => {
    cy.login('trinhduycongvinh@gmail.com', '123456')
    cy.visit('/');
  })
  it('should deny create new user', () => {
    cy.contains('Tài khoản',{ timeout: 2000 }).click()
    cy.contains('Thêm tài khoản').click()
    cy.get('#ua-username').type('testuser')
    cy.get('#ua-password').type('123456')
    cy.get('#ua-email').type('a@a')
    cy.get('#ua-phone').type('0123456789')
    cy.get('#ua-role').select('ADMIN')

    cy.intercept('POST', '/api/v1/auth/register').as('createAccount')
    cy.contains('Tạo tài khoản').click()

    cy.wait('@createAccount').then(interception => {
      // Check status code
      expect(interception.response?.statusCode).to.eq(403)
    })

  })
})