describe('Account UI', () => {
  beforeEach(() => {
    cy.login(Cypress.env('username'), Cypress.env('password'))
    cy.visit('/');
  })

  it('should display account information', () => {

    cy.contains('Tài khoản',{ timeout: 2000 }).click()
    cy.contains('Tài khoản hệ thống').should('be.visible') 

    cy.contains('Tên đăng nhập').should('be.visible')
    cy.contains('admin').should('be.visible')
    cy.contains('Email').should('be.visible')
    cy.contains('SĐT').should('be.visible')
    cy.contains('Vai trò').should('be.visible')
    cy.contains('Trạng thái').should('be.visible')
  })

})
