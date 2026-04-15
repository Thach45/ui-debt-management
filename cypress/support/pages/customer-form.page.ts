/**
 * Page Object cho màn hình Thêm/Sửa Khách hàng.
 * Chứa các selector và các action helper dùng chung cho test.
 */
class CustomerFormPage {
  // ─── Selectors ─────────────────────────────────────────────────────────────

  get nameInput() { return cy.get('input[placeholder="Nguyễn Văn A"]') }
  get phoneInput() { return cy.get('input[placeholder="0901234567"]') }
  get addressInput() { return cy.get('input[placeholder="Thôn / xã / huyện"]') }
  get farmingInput() { return cy.get('input[placeholder="VD: Ruộng lúa xã A"]') }
  get tierSelect() { return cy.get('select') }
  get submitBtn() { return cy.get('button[type="submit"]') }
  get backLink() { return cy.get('a').contains('Quay lại danh sách') }

  // ─── Assertions/Helpers ────────────────────────────────────────────────────

  /** Kiểm tra thông báo lỗi hiển thị dưới một field nào đó */
  shouldShowError(message: string) {
    cy.contains('p.text-red-600', message).should('be.visible')
  }

  /** Kiểm tra một field không có thông báo lỗi */
  shouldNotShowError(message: string) {
    cy.contains('p.text-red-600', message).should('not.exist')
  }

  /** Điền nhanh toàn bộ form */
  fillForm(data: { name?: string, phone?: string, address?: string, farming?: string, tier?: string }) {
    if (data.name) this.nameInput.clear().type(data.name)
    if (data.phone) this.phoneInput.clear().type(data.phone)
    if (data.address) this.addressInput.clear().type(data.address)
    if (data.farming) this.farmingInput.clear().type(data.farming)
    if (data.tier) this.tierSelect.select(data.tier)
  }
}

export const customerFormPage = new CustomerFormPage()
