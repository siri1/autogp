export type GarageStatus = 'active' | 'inactive';

export interface Garage {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  managerName: string;
  status: GarageStatus;
  isMain: boolean;
  bayCount: number;
  technicianCount: number;
  createdAt: string; // ISO date
  notes?: string;
}

export const SAMPLE_GARAGES: Garage[] = [
  {
    id: 'g1',
    name: 'AutoGP Luanda — Sede',
    address: 'Rua Comandante Gika, 45',
    city: 'Luanda',
    phone: '+244 923 456 789',
    email: 'luanda@autogp.ao',
    managerName: 'Paulo Rodrigues',
    status: 'active',
    isMain: true,
    bayCount: 8,
    technicianCount: 6,
    createdAt: '2022-01-15',
  },
  {
    id: 'g2',
    name: 'AutoGP Talatona',
    address: 'Av. de Portugal, 112',
    city: 'Luanda (Talatona)',
    phone: '+244 923 111 222',
    email: 'talatona@autogp.ao',
    managerName: 'Carlos Mendes',
    status: 'active',
    isMain: false,
    bayCount: 5,
    technicianCount: 4,
    createdAt: '2023-06-01',
  },
  {
    id: 'g3',
    name: 'AutoGP Benguela',
    address: 'Rua 1º de Agosto, 78',
    city: 'Benguela',
    phone: '+244 923 333 444',
    email: 'benguela@autogp.ao',
    managerName: 'Ana Pereira',
    status: 'inactive',
    isMain: false,
    bayCount: 3,
    technicianCount: 2,
    createdAt: '2024-03-10',
    notes: 'Branch temporarily closed for renovation.',
  },
];
