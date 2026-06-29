export interface CustomField {
  type: 'text' | 'email' | 'message';
  label: string;
  required: boolean;
}

export interface PaymentForm {
  id: string;
  creator: string;
  title: string;
  description: string;
  amount: string; // "0" or empty implies variable/optional amount
  isVariableAmount: boolean;
  customFields: CustomField[];
  status: 'active' | 'inactive';
  createdAt: number;
}

export interface PaymentRecord {
  id: string;
  formId: string;
  formTitle: string;
  payer: string;
  recipient: string;
  amount: string;
  hash: string;
  timestamp: number;
  customFieldValues: Record<string, string>;
}

const DEFAULT_FORMS: PaymentForm[] = [
  {
    id: 'form_1',
    creator: 'GBX...',
    title: 'Support My Open Source Work',
    description: 'If you use my libraries or read my articles, feel free to buy me a coffee!',
    amount: '10.00',
    isVariableAmount: false,
    customFields: [
      { type: 'text', label: 'Name', required: true },
      { type: 'email', label: 'Email', required: false },
      { type: 'message', label: 'Message', required: false }
    ],
    status: 'active',
    createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000
  },
  {
    id: 'form_2',
    creator: 'GBX...',
    title: 'Digital Consultation Fee',
    description: 'Fee for 1 hour of professional digital consultation.',
    amount: '50.00',
    isVariableAmount: true,
    customFields: [
      { type: 'text', label: 'Client Name', required: true }
    ],
    status: 'active',
    createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000
  }
];

const DEFAULT_PAYMENTS: PaymentRecord[] = [
  {
    id: 'pay_1',
    formId: 'form_1',
    formTitle: 'Support My Open Source Work',
    payer: 'GD6...3Y8',
    recipient: 'GBX...',
    amount: '10.00',
    hash: '5c28a25c6020ec3f8efdf1206d2008477ff261eb8fb97f9a1e05d21a591e32d5',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    customFieldValues: { Name: 'Alice Smith', Email: 'alice@example.com', Message: 'Keep up the amazing work!' }
  },
  {
    id: 'pay_2',
    formId: 'form_1',
    formTitle: 'Support My Open Source Work',
    payer: 'GB7...4H2',
    recipient: 'GBX...',
    amount: '10.00',
    hash: '8b7f1681283ea4e112d7c58bf141eb93ee7f311c107147b192cf26229ee0e632',
    timestamp: Date.now() - 12 * 60 * 60 * 1000,
    customFieldValues: { Name: 'Bob Johnson', Message: 'Thanks for fixing that bug!' }
  }
];

export const mockStorage = {
  getForms: (creatorAddress?: string): PaymentForm[] => {
    const data = localStorage.getItem('stellarforms_forms');
    let forms = data ? JSON.parse(data) : DEFAULT_FORMS;
    if (creatorAddress) {
      forms = forms.filter((f: PaymentForm) => f.creator === creatorAddress || f.id.startsWith('form_'));
    }
    return forms;
  },

  getFormById: (id: string): PaymentForm | null => {
    const forms = mockStorage.getForms();
    return forms.find(f => f.id === id) || null;
  },

  saveForm: (form: Omit<PaymentForm, 'id' | 'createdAt' | 'status'>): PaymentForm => {
    const forms = mockStorage.getForms();
    const newForm: PaymentForm = {
      ...form,
      id: `form_${Math.random().toString(36).substr(2, 9)}`,
      status: 'active',
      createdAt: Date.now()
    };
    forms.unshift(newForm);
    localStorage.setItem('stellarforms_forms', JSON.stringify(forms));
    return newForm;
  },

  toggleFormStatus: (id: string): PaymentForm | null => {
    const forms = mockStorage.getForms();
    const formIndex = forms.findIndex(f => f.id === id);
    if (formIndex === -1) return null;
    
    forms[formIndex].status = forms[formIndex].status === 'active' ? 'inactive' : 'active';
    localStorage.setItem('stellarforms_forms', JSON.stringify(forms));
    return forms[formIndex];
  },

  getPayments: (creatorAddress?: string): PaymentRecord[] => {
    const data = localStorage.getItem('stellarforms_payments');
    let payments = data ? JSON.parse(data) : DEFAULT_PAYMENTS;
    if (creatorAddress) {
      payments = payments.filter((p: PaymentRecord) => p.recipient === creatorAddress || p.recipient === 'GBX...');
    }
    return payments;
  },

  getPaymentByHash: (hash: string): PaymentRecord | null => {
    const payments = mockStorage.getPayments();
    return payments.find(p => p.hash === hash) || null;
  },

  savePayment: (payment: Omit<PaymentRecord, 'id' | 'timestamp'>): PaymentRecord => {
    const payments = mockStorage.getPayments();
    const newPayment: PaymentRecord = {
      ...payment,
      id: `pay_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };
    payments.unshift(newPayment);
    localStorage.setItem('stellarforms_payments', JSON.stringify(payments));
    return newPayment;
  }
};
