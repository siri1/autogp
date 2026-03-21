// ── Types ──────────────────────────────────────────────────────────────────────

export interface InteractionNote {
  id: number;
  date: string;
  type: 'call' | 'email' | 'visit' | 'whatsapp' | 'note';
  content: string;
  author: string;
}

export interface CRMCustomer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  address?: string;
  city?: string;
  idNumber?: string;
  company?: string;
  vatNumber?: string;
  status: 'active' | 'inactive' | 'vip' | 'prospect' | 'blacklisted';
  customerSince: string;
  lastContact?: string;
  nextFollowUp?: string;
  preferredContact: 'phone' | 'whatsapp' | 'email';
  tags: string[];
  notes: InteractionNote[];
}

export const fullName = (c: CRMCustomer) => `${c.firstName} ${c.lastName}`;

// ── Sample Data ────────────────────────────────────────────────────────────────

export const SAMPLE_CRM_CUSTOMERS: CRMCustomer[] = [
  {
    id: 1, firstName: 'João', lastName: 'Silva',
    email: 'joao.silva@email.ao', phone: '+244 923 456 789', whatsapp: '+244 923 456 789',
    address: 'Rua da Missão, 45', city: 'Luanda',
    idNumber: '001234567LA042', company: 'Silva & Filhos Lda',
    vatNumber: '5000123456',
    status: 'vip', customerSince: '2021-03-10', lastContact: '2024-11-26',
    preferredContact: 'whatsapp',
    tags: ['fleet', 'vip', 'corporate'],
    notes: [
      { id: 1, date: '2024-11-26', type: 'visit', content: 'Collected Hilux after service. Happy with results. Asked about fleet discount.', author: 'Admin' },
      { id: 2, date: '2024-09-14', type: 'call', content: 'Called to confirm appointment booking for October service.', author: 'Admin' },
      { id: 3, date: '2024-06-01', type: 'whatsapp', content: 'Sent service reminder. Customer confirmed for next week.', author: 'Admin' },
    ],
  },
  {
    id: 2, firstName: 'Maria', lastName: 'Santos',
    email: 'maria.santos@email.ao', phone: '+244 912 345 678',
    address: 'Av. 4 de Fevereiro, 120', city: 'Luanda',
    idNumber: '007654321LA056',
    status: 'active', customerSince: '2022-08-15', lastContact: '2024-07-23',
    preferredContact: 'phone',
    tags: ['regular'],
    notes: [
      { id: 4, date: '2024-07-23', type: 'visit', content: 'AC regas completed. Customer satisfied. Discussed next service due date.', author: 'Admin' },
      { id: 5, date: '2024-01-10', type: 'email', content: 'Sent annual service reminder email.', author: 'Admin' },
    ],
  },
  {
    id: 3, firstName: 'Carlos', lastName: 'Mendes',
    email: 'carlos.mendes@email.ao', phone: '+244 934 567 890', whatsapp: '+244 934 567 890',
    address: 'Rua Rainha Ginga, 78', city: 'Benguela',
    idNumber: '003456789BE031', company: 'Mendes Construção S.A.',
    vatNumber: '5000987654',
    status: 'active', customerSince: '2020-05-20', lastContact: '2024-10-03',
    nextFollowUp: '2025-01-15',
    preferredContact: 'whatsapp',
    tags: ['construction', 'corporate', 'off-road'],
    notes: [
      { id: 6, date: '2024-10-03', type: 'visit', content: 'Tyre rotation done. Mentioned Discovery needs full service in 3 months. Set follow-up.', author: 'Admin' },
      { id: 7, date: '2024-05-12', type: 'call', content: 'Called regarding suspension noise. Booked for inspection.', author: 'Mike Rodriguez' },
      { id: 8, date: '2023-08-09', type: 'visit', content: 'Major suspension overhaul completed. Customer very satisfied – "drives like new".', author: 'Admin' },
    ],
  },
  {
    id: 4, firstName: 'Ana', lastName: 'Rodrigues',
    email: 'ana.rodrigues@email.ao', phone: '+244 945 678 901',
    address: 'Rua Amílcar Cabral, 33', city: 'Luanda',
    idNumber: '004567890LA078',
    status: 'active', customerSince: '2023-01-05', lastContact: '2024-11-10',
    preferredContact: 'email',
    tags: ['premium', 'bmw'],
    notes: [
      { id: 9, date: '2024-11-10', type: 'visit', content: 'Dropped off BMW for 40,000km service. Job in progress.', author: 'Admin' },
      { id: 10, date: '2023-05-15', type: 'visit', content: 'First service completed. Very impressed with workshop quality.', author: 'Admin' },
    ],
  },
  {
    id: 5, firstName: 'Pedro', lastName: 'Ferreira',
    email: 'pedro.ferreira@email.ao', phone: '+244 956 789 012', whatsapp: '+244 956 789 012',
    address: 'Km 12, Estrada de Catete', city: 'Luanda',
    idNumber: '005678901LA091',
    status: 'vip', customerSince: '2019-11-08', lastContact: '2024-09-02',
    preferredContact: 'whatsapp',
    tags: ['vip', 'off-road', 'high-value'],
    notes: [
      { id: 11, date: '2024-09-02', type: 'visit', content: 'New tyres fitted on Patrol. Asked about upcoming engine service.', author: 'Admin' },
      { id: 12, date: '2022-07-07', type: 'visit', content: 'Major engine overhaul completed. Engine runs perfectly. Customer very happy.', author: 'Mike Rodriguez' },
      { id: 13, date: '2022-06-20', type: 'call', content: 'Called re: unusual smoke from exhaust. Diagnosed valve seat issue. Booked for overhaul.', author: 'Admin' },
    ],
  },
  {
    id: 6, firstName: 'Beatriz', lastName: 'Costa',
    email: 'beatriz.costa@email.ao', phone: '+244 967 890 123',
    address: 'Rua Ngola Kiluanje, 15', city: 'Luanda',
    idNumber: '006789012LA103',
    status: 'active', customerSince: '2023-12-01', lastContact: '2024-06-17',
    nextFollowUp: '2024-12-10',
    preferredContact: 'phone',
    tags: ['new-customer'],
    notes: [
      { id: 14, date: '2024-06-17', type: 'visit', content: 'First service completed. Explained service schedule. Booked 30,000km service.', author: 'Admin' },
    ],
  },
  {
    id: 7, firstName: 'António', lastName: 'Lopes',
    email: 'antonio.lopes@email.ao', phone: '+244 978 901 234',
    address: 'Bairro Miramar, Casa 7', city: 'Luanda',
    idNumber: '007890123LA115',
    status: 'prospect', customerSince: '2024-10-01', lastContact: '2024-10-01',
    nextFollowUp: '2024-12-20',
    preferredContact: 'phone',
    tags: ['prospect'],
    notes: [
      { id: 15, date: '2024-10-01', type: 'call', content: 'Enquired about service pricing for Toyota Land Cruiser. Sent quotation via email. Follow up before Christmas.', author: 'Admin' },
    ],
  },
  {
    id: 8, firstName: 'Francisca', lastName: 'Neto',
    email: 'francisca.neto@email.ao', phone: '+244 989 012 345',
    address: 'Av. Ho Chi Minh, 200', city: 'Luanda',
    idNumber: '008901234LA128', company: 'Neto Transportes Lda',
    vatNumber: '5001234567',
    status: 'inactive', customerSince: '2020-02-14', lastContact: '2022-11-30',
    preferredContact: 'email',
    tags: ['inactive', 'corporate'],
    notes: [
      { id: 16, date: '2022-11-30', type: 'email', content: 'Sent win-back offer. No response received.', author: 'Admin' },
      { id: 17, date: '2022-08-10', type: 'note', content: 'Customer moved fleet maintenance in-house. May return for specialist work.', author: 'Admin' },
    ],
  },
];
