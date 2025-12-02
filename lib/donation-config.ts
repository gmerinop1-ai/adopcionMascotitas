import { DonationPlan, PaymentMethod } from './db'

export const DONATION_PLANS: DonationPlan[] = [
  {
    id: 'basic',
    name: 'Cuidado Básico',
    description: 'Ayuda con comida y medicinas básicas',
    amount: 30,
    frequency: 'monthly',
    features: [
      'Alimentación de una mascota por 1 semana',
      'Vacunas básicas',
      'Desparasitación'
    ]
  },
  {
    id: 'standard',
    name: 'Cuidado Completo',
    description: 'Cuidado integral para nuestras mascotas',
    amount: 60,
    frequency: 'monthly',
    features: [
      'Alimentación de una mascota por 2 semanas',
      'Atención veterinaria completa',
      'Productos de higiene y limpieza',
      'Juguetes y entretenimiento'
    ],
    popular: true
  },
  {
    id: 'premium',
    name: 'Protector Angel',
    description: 'Máximo apoyo para el refugio',
    amount: 120,
    frequency: 'monthly',
    features: [
      'Alimentación de una mascota por 1 mes',
      'Cirugías y tratamientos especiales',
      'Mejoras en las instalaciones',
      'Programa de esterilización',
      'Campañas de adopción'
    ]
  }
]

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'culqi',
    name: 'Tarjeta de Crédito/Débito',
    type: 'card',
    icon: '💳',
    available: true
  },
  {
    id: 'yape',
    name: 'Yape',
    type: 'yape',
    icon: '📱',
    available: true
  },
  {
    id: 'bank_transfer',
    name: 'Transferencia Bancaria',
    type: 'bank_transfer',
    icon: '🏦',
    available: false // Para implementar más adelante
  }
]