import { NextRequest, NextResponse } from 'next/server'
import { getDonationById } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const donationId = searchParams.get('donation_id')
    const format = searchParams.get('format') || 'html' // html o text

    if (!donationId) {
      return NextResponse.json(
        { error: 'ID de donación requerido' },
        { status: 400 }
      )
    }

    // Obtener datos de la donación
    const donation = await getDonationById(donationId)
    
    if (!donation) {
      return NextResponse.json(
        { error: 'Donación no encontrada' },
        { status: 404 }
      )
    }

    if (format === 'text') {
      // Generar comprobante en texto plano para fácil copia/impresión
      const receiptText = generateReceiptText(donation)
      
      return new NextResponse(receiptText, {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': `attachment; filename="comprobante-donacion-${donationId}.txt"`
        }
      })
    } else {
      // Generar HTML del comprobante
      const receiptHTML = generateReceiptHTML(donation)
      
      return new NextResponse(receiptHTML, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="comprobante-donacion-${donationId}.html"`
        }
      })
    }

  } catch (error) {
    console.error('Error generando comprobante:', error)
    return NextResponse.json(
      { error: 'Error al generar comprobante' },
      { status: 500 }
    )
  }
}

function generateReceiptText(donation: any) {
  const currentDate = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return `
═══════════════════════════════════════════════════════════
🐾 ADOPCIÓN MASCOTITAS - COMPROBANTE DE DONACIÓN 🐾
═══════════════════════════════════════════════════════════

📋 INFORMACIÓN DE LA DONACIÓN
──────────────────────────────────────────────────────────
ID de Transacción: ${donation.id}
Fecha de Donación: ${new Date(donation.created_at).toLocaleDateString('es-PE')}
Monto Donado: S/ ${Number(donation.amount).toFixed(2)}
Frecuencia: ${donation.frequency === 'monthly' ? 'Mensual' : 'Única'}
Método de Pago: ${getPaymentMethodName(donation.payment_method)}
Estado: ${getStatusText(donation.status)}

👤 INFORMACIÓN DEL DONANTE
──────────────────────────────────────────────────────────
Nombre: ${donation.donor_name || 'Donación Anónima'}
Correo Electrónico: ${donation.donor_email || 'No proporcionado'}

${donation.message ? `💬 MENSAJE DEL DONANTE:
──────────────────────────────────────────────────────────
"${donation.message}"

` : ''}❤️ ¡MUCHAS GRACIAS!
──────────────────────────────────────────────────────────
Tu donación hace la diferencia en la vida de nuestras mascotas.
Gracias a tu generosidad, podemos seguir brindando amor, cuidado
y la oportunidad de encontrar un hogar a cada uno de nuestros
peludos amigos.

📊 IMPACTO DE TU DONACIÓN
──────────────────────────────────────────────────────────
Con tu aporte de S/ ${Number(donation.amount).toFixed(2)} podemos:
${getImpactText(Number(donation.amount))}

🏠 CONTACTO - ONG ADOPCIÓN MASCOTITAS
──────────────────────────────────────────────────────────
Dirección: Av. Sánchez Carrión 517, El Porvenir 13003
Teléfono: 915 185 711
Email: info@huellitasdelmañana.org
Web: https://adopcion-mascotitas.vercel.app/

Este comprobante es válido como constancia de tu donación.
Generado automáticamente el ${currentDate}

═══════════════════════════════════════════════════════════
`
}

function getImpactText(amount: number): string {
  const impacts = []
  
  if (amount >= 10) impacts.push('🍖 Alimentar una mascota por 3 días')
  if (amount >= 25) impacts.push('💉 Vacunas básicas para un cachorro')
  if (amount >= 50) impacts.push('🏥 Consulta veterinaria completa')
  if (amount >= 100) impacts.push('🛏️ Cama cómoda y juguetes para una mascota')
  if (amount >= 200) impacts.push('🎯 Castración/esterilización de una mascota')
  if (amount >= 500) impacts.push('🚑 Tratamiento médico de emergencia')
  
  if (impacts.length === 0) {
    impacts.push('❤️ Contribuir al cuidado general de nuestras mascotas')
  }
  
  return impacts.map(impact => `• ${impact}`).join('\n')
}

function generateReceiptHTML(donation: any) {
  const currentDate = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprobante de Donación - ${donation.id}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
            color: #374151;
        }
        .receipt {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            padding: 40px;
            margin: 20px 0;
        }
        .header {
            text-align: center;
            border-bottom: 3px solid #ef4444;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #ef4444;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 8px;
        }
        .subtitle {
            color: #6b7280;
            font-size: 14px;
        }
        .section {
            margin: 25px 0;
            padding: 20px;
            background-color: #f8fafc;
            border-radius: 8px;
            border-left: 4px solid #ef4444;
        }
        .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 15px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            font-weight: 500;
            color: #4b5563;
        }
        .detail-value {
            font-weight: 600;
            color: #1f2937;
        }
        .amount {
            font-size: 28px;
            color: #059669;
            font-weight: bold;
        }
        .status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            background-color: #dcfce7;
            color: #166534;
        }
        .message-box {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin-top: 20px;
        }
        .message-text {
            color: #92400e;
            font-style: italic;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 12px;
        }
        .thank-you {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        @media print {
            body { background-color: white; }
            .receipt { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <div class="logo">🐾 Adopción Mascotitas</div>
            <h1 class="title">Comprobante de Donación</h1>
            <p class="subtitle">Gracias por tu generosidad y apoyo</p>
        </div>

        <div class="section">
            <h2 class="section-title">📋 Información de la Donación</h2>
            <div class="detail-row">
                <span class="detail-label">ID de Transacción:</span>
                <span class="detail-value">${donation.id}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Fecha de Donación:</span>
                <span class="detail-value">${new Date(donation.created_at).toLocaleDateString('es-PE')}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Monto Donado:</span>
                <span class="detail-value amount">S/ ${Number(donation.amount).toFixed(2)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Frecuencia:</span>
                <span class="detail-value">${donation.frequency === 'monthly' ? 'Mensual' : 'Única'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Método de Pago:</span>
                <span class="detail-value">${getPaymentMethodName(donation.payment_method)}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Estado:</span>
                <span class="detail-value">
                    <span class="status">${getStatusText(donation.status)}</span>
                </span>
            </div>
        </div>

        <div class="section">
            <h2 class="section-title">👤 Información del Donante</h2>
            <div class="detail-row">
                <span class="detail-label">Nombre:</span>
                <span class="detail-value">${donation.donor_name || 'Donación Anónima'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Correo Electrónico:</span>
                <span class="detail-value">${donation.donor_email || 'No proporcionado'}</span>
            </div>
        </div>

        ${donation.message ? `
        <div class="message-box">
            <h3 style="margin-top: 0; color: #92400e;">💬 Mensaje del Donante:</h3>
            <p class="message-text">"${donation.message}"</p>
        </div>
        ` : ''}

        <div class="thank-you">
            <h2 style="margin-top: 0;">¡Muchas Gracias! ❤️</h2>
            <p>Tu donación hace la diferencia en la vida de nuestras mascotas. 
            Gracias a tu generosidad, podemos seguir brindando amor, cuidado y 
            la oportunidad de encontrar un hogar a cada uno de nuestros peludos amigos.</p>
        </div>

        <div class="section">
            <h2 class="section-title">📊 Impacto de tu Donación</h2>
            <p>Con tu aporte de <strong>S/ ${Number(donation.amount).toFixed(2)}</strong> podemos:</p>
            <ul style="margin-left: 20px; color: #4b5563;">
                ${getImpactList(Number(donation.amount))}
            </ul>
        </div>

        <div class="footer">
            <p><strong>ONG Adopción Mascotitas</strong></p>
            <p>🏠 Dirección: Av. Sánchez Carrión 517, El Porvenir 13003</p>
            <p>📞 Teléfono: 915 185 711 | 📧 Email: info@huellitasdelmañana.org</p>
            <p>🌐 Web: https://adopcion-mascotitas.vercel.app/</p>
            <hr style="margin: 15px 0;">
            <p>Este comprobante es válido como constancia de tu donación.</p>
            <p>Generado automáticamente el ${currentDate}</p>
        </div>
    </div>

    <script>
        // Función para imprimir automáticamente si se solicita
        if (window.location.search.includes('print=true')) {
            window.onload = function() {
                setTimeout(() => window.print(), 500);
            }
        }
    </script>
</body>
</html>`
}

function getPaymentMethodName(method: string): string {
  switch (method) {
    case 'culqi': return 'Tarjeta de Crédito/Débito (Culqi)'
    case 'yape': return 'Yape'
    default: return method
  }
}

function getStatusText(status: string): string {
  switch (status) {
    case 'completed': return '✅ Completada'
    case 'pending': return '⏳ Pendiente'
    case 'failed': return '❌ Falló'
    default: return status
  }
}

function getImpactList(amount: number): string {
  const impacts = []
  
  if (amount >= 10) impacts.push('<li>🍖 Alimentar una mascota por 3 días</li>')
  if (amount >= 25) impacts.push('<li>💉 Vacunas básicas para un cachorro</li>')
  if (amount >= 50) impacts.push('<li>🏥 Consulta veterinaria completa</li>')
  if (amount >= 100) impacts.push('<li>🛏️ Cama cómoda y juguetes para una mascota</li>')
  if (amount >= 200) impacts.push('<li>🎯 Castración/esterilización de una mascota</li>')
  if (amount >= 500) impacts.push('<li>🚑 Tratamiento médico de emergencia</li>')
  
  if (impacts.length === 0) {
    impacts.push('<li>❤️ Contribuir al cuidado general de nuestras mascotas</li>')
  }
  
  return impacts.join('')
}