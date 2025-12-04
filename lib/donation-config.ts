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
    id: 'mercadopago',
    name: 'Tarjeta de Crédito/Débito/Yape',
    type: 'card',
    icon: '💳',
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

// Configuración de MercadoPago
export const MERCADOPAGO_CONFIG = {
  // Configuración de métodos de pago
  PAYMENT_METHODS: {
    excluded_payment_types: [], // Permitir todos los tipos
    excluded_payment_methods: [], // Permitir todos los métodos
    installments: 12, // Hasta 12 cuotas
    default_installments: 1
  },

  // Configuración básica de checkout
  CHECKOUT_SETTINGS: {
    currency: 'PEN',
    statement_descriptor: 'ADOPCION MASCOTAS',
    auto_return: 'approved'
  },

  // Datos de prueba oficiales de MercadoPago
  TEST_CARDS: [
    {
      number: '4509 9535 6623 3704',
      cvv: '123',
      month: '11',
      year: '2025',
      email: 'test_user_123@testuser.com',
      description: 'Visa - Pago aprobado'
    },
    {
      number: '5031 7557 3453 0604',
      cvv: '123', 
      month: '11',
      year: '2025',
      email: 'test_user_123@testuser.com',
      description: 'MasterCard - Pago aprobado'
    },
    {
      number: '4013 5406 8274 6260',
      cvv: '123',
      month: '11', 
      year: '2025',
      email: 'test_user_123@testuser.com',
      description: 'Visa - Pago rechazado'
    }
  ],

  // Validaciones
  MIN_AMOUNT: 1.00, // Monto mínimo en soles
  MAX_AMOUNT: 10000.00 // Monto máximo en soles
}