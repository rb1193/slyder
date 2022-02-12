describe('The basic slider', () => {
  it('can be controlled using the next and previous buttons', () => {
    cy.visit('iframe.html?id=slyder--slide&viewMode=story')

    cy.findByText('One').then(($el) => Cypress.dom.isHidden($el)).should('be.false')
    cy.findByText('Two').then(($el) => Cypress.dom.isHidden($el)).should('be.true')

    cy.findByRole('button', { name: 'next' }).click()

    cy.findByText('One').then(($el) => Cypress.dom.isHidden($el)).should('be.true')
    cy.findByText('Two').then(($el) => Cypress.dom.isHidden($el)).should('be.false')

    cy.findByRole('button', { name: 'previous' }).click()

    cy.findByText('One').then(($el) => Cypress.dom.isHidden($el)).should('be.false')
    cy.findByText('Two').then(($el) => Cypress.dom.isHidden($el)).should('be.true')
  });

  it('can be controlled using the slider controls', () => {
    cy.visit('iframe.html?id=slyder--slide&viewMode=story')

    cy.findByText('One').then(($el) => Cypress.dom.isHidden($el)).should('be.false')
    cy.findByText('Two').then(($el) => Cypress.dom.isHidden($el)).should('be.true')

    cy.findByRole('button', { name: 'Go to slide 2 of 3' })
    cy.findByText('One').then(($el) => Cypress.dom.isHidden($el)).should('be.true')
    cy.findByText('Two').then(($el) => Cypress.dom.isHidden($el)).should('be.false')

    cy.findByRole('button', { name: 'Go to slide 2 of 3' }).should('be.disabled')
  })
})

