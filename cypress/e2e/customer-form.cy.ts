import { customerFormPage as page } from '../support/pages/customer-form.page'

/**
 * E2E Tests - Màn hình Thêm Khách hàng (/customers/new)
 * Đã được refactor tách data sang fixture và selector sang Page Object.
 */

describe('Thêm khách hàng — Validate Form (Negative cases)', () => {
  beforeEach(() => {
    // 1. Tải dữ liệu mock từ fixture
    cy.fixture('customers').as('custData')

    // 2. Stub API
    cy.intercept('GET', '**/api/v1/customers', {
      statusCode: 200,
      body: { success: true, message: 'OK', data: [] },
    }).as('getCustomers')

    // 3. Đăng nhập và truy cập trang
    cy.loginAndVisit('/customers/new')
  })

  it('Bỏ trống tất cả trường bắt buộc → Hiển thị 4 thông báo lỗi đỏ', () => {
    page.submitBtn.click()

    page.shouldShowError('Họ tên không được để trống')
    page.shouldShowError('Số điện thoại không được để trống')
    page.shouldShowError('Địa chỉ không được để trống')
    page.shouldShowError('Vùng canh tác không được để trống')

    cy.screenshot('form-validate-empty')
    cy.url().should('include', '/customers/new')
  })

  it('Bỏ trống Họ tên → Chỉ field Họ tên báo lỗi đỏ', () => {
    cy.get('@custData').then((data: any) => {
      page.fillForm({
        phone: data.newCustomer.phone,
        address: data.newCustomer.address,
        farming: data.newCustomer.farmingLocation,
      })
    })

    page.submitBtn.click()
    page.shouldShowError('Họ tên không được để trống')
    
    page.shouldNotShowError('Số điện thoại không được để trống')
    page.shouldNotShowError('Địa chỉ không được để trống')
  })

  it('Nhập SĐT chứa chữ cái "abc123" → Hiển thị lỗi định dạng SĐT', () => {
    page.nameInput.type('Nguyễn Văn A')
    page.phoneInput.type('abc123')
    page.addressInput.type('123 Đường Test')
    page.farmingInput.type('Ruộng lúa xã A')

    page.submitBtn.click()
    page.shouldShowError('Số điện thoại phải có 10 số và bắt đầu bằng 03/05/07/08/09')
    
    cy.screenshot('form-validate-phone-invalid')
  })

  it('Lỗi đỏ biến mất khi người dùng bắt đầu nhập vào field lỗi', () => {
    page.submitBtn.click()
    page.shouldShowError('Họ tên không được để trống')

    page.nameInput.type('N')
    page.shouldNotShowError('Họ tên không được để trống')
  })
})

describe('Thêm khách hàng — Happy path (Thêm mới thành công)', () => {
  let custData: any

  beforeEach(() => {
    cy.fixture('customers').then((data) => {
      custData = data

      // Stub POST tạo khách
      cy.intercept('POST', '**/api/v1/customers', {
        statusCode: 200,
        body: { success: true, message: 'OK', data: data.newCustomer },
      }).as('createCustomer')

      // Stub GET danh sách sau khi tạo
      cy.intercept('GET', '**/api/v1/customers', {
        statusCode: 200,
        body: { success: true, message: 'OK', data: [data.newCustomer, data.oldCustomer] },
      }).as('getCustomers')
    })

    cy.loginAndVisit('/customers/new')
  })

  it('Thêm mới thành công hạng Tiêu chuẩn → Toast → Redirect → Đầu danh sách', () => {
    const { newCustomer } = custData

    page.fillForm({
      name: newCustomer.name,
      phone: newCustomer.phone,
      address: newCustomer.address,
      farming: newCustomer.farmingLocation,
      tier: 'STANDARD'
    })

    page.submitBtn.click()

    cy.wait('@createCustomer').its('request.body').should((body) => {
      expect(body.customerTier).to.equal('STANDARD')
    })

    cy.get('body').should('contain.text', 'Đã tạo khách hàng')
    cy.screenshot('customer-create-success-toast')

    cy.url().should('include', '/customers')
    cy.wait('@getCustomers')

    cy.get('tbody tr').first().should('contain.text', newCustomer.name)
    cy.screenshot('customer-list-after-create')
  })

  it('Dropdown "Hạng khách" chỉ hiển thị đúng 3 options', () => {
    page.tierSelect.find('option').should('have.length', 3)
    page.tierSelect.find('option').eq(0).should('have.text', 'Tiêu chuẩn')
    page.tierSelect.find('option').eq(1).should('have.text', 'VIP')
    page.tierSelect.find('option').eq(2).should('have.text', 'Thân thiết')
  })
})

describe('Thêm khách hàng — Navigation', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/v1/customers', {
      statusCode: 200,
      body: { success: true, message: 'OK', data: [] },
    }).as('getCustomers')

    // Bắt đầu từ danh sách
    cy.loginAndVisit('/customers')
    cy.wait('@getCustomers')
    
    // Vào trang thêm mới
    cy.visit('/customers/new')
  })

  it('Nhấn "Quay lại danh sách" → Không lưu, về đúng trang', () => {
    page.nameInput.type('Nhập nháp')
    
    cy.intercept('POST', '**/api/v1/customers').as('createAttempt')
    page.backLink.click()

    cy.url().should('include', '/customers')
    cy.get('@createAttempt.all').should('have.length', 0)
  })

  it('Các trường bắt buộc có dấu * màu đỏ', () => {
    const fields = ['Họ tên', 'Số điện thoại', 'Địa chỉ', 'Vùng canh tác']
    fields.forEach(field => {
      cy.contains('label', field).find('span.text-red-500').should('have.text', '*')
    })
  })
})
