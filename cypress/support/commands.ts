/// <reference types="cypress" />

Cypress.Commands.add('loginAndVisit', (url: string, token: string = 'mock-token') => {
  cy.visit(url, {
    onBeforeLoad(win) {
      win.localStorage.setItem('accessToken', token);
    },
  });
});

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Đăng nhập giả lập bằng cách set accessToken vào localStorage sau đó truy cập URL.
       * @example cy.loginAndVisit('/customers')
       */
      loginAndVisit(url: string, token?: string): Chainable<void>;
    }
  }
}

export {};
