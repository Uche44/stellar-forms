import { describe, it, expect, beforeEach } from 'vitest';
import { mockStorage } from './mockStorage';

describe('mockStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('retrieves default forms when storage is empty', () => {
    const forms = mockStorage.getForms();
    expect(forms.length).toBeGreaterThan(0);
    expect(forms[0].id).toBe('form_1');
  });

  it('saves a new payment form', () => {
    const newForm = mockStorage.saveForm({
      creator: 'GAAAAAA...',
      title: 'Test Consultation',
      description: 'Consultation service',
      amount: '25.00',
      isVariableAmount: false,
      customFields: [{ type: 'text', label: 'Discord Username', required: true }]
    });

    expect(newForm.id).toBeDefined();
    expect(newForm.status).toBe('active');
    expect(newForm.title).toBe('Test Consultation');

    const forms = mockStorage.getForms();
    expect(forms.find(f => f.id === newForm.id)).toBeDefined();
  });

  it('toggles form active status', () => {
    const forms = mockStorage.getForms();
    const formId = forms[0].id;
    const initialStatus = forms[0].status;

    const updated = mockStorage.toggleFormStatus(formId);
    expect(updated).not.toBeNull();
    expect(updated?.status).toBe(initialStatus === 'active' ? 'inactive' : 'active');
  });

  it('saves and retrieves payments', () => {
    const initialCount = mockStorage.getPayments().length;
    
    const payment = mockStorage.savePayment({
      formId: 'form_1',
      formTitle: 'Support My Open Source Work',
      payer: 'G-PAYER...',
      recipient: 'G-CREATOR...',
      amount: '10.00',
      hash: 'testhash123',
      customFieldValues: { Name: 'Dave' }
    });

    expect(payment.id).toBeDefined();
    
    const payments = mockStorage.getPayments();
    expect(payments.length).toBe(initialCount + 1);
    expect(mockStorage.getPaymentByHash('testhash123')).toBeDefined();
  });
});
