import { NextRequest, NextResponse } from 'next/server'
import { getDonationById } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const donationId = searchParams.get('donation_id')

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

    // Generar HTML optimizado para PDF (se verá como PDF al imprimir)
    const htmlContent = generatePrintableHTML(donation)
    
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="comprobante-donacion-${donationId}.html"`
      }
    })

  } catch (error) {
    console.error('Error generando comprobante:', error)
    return NextResponse.json(
      { error: 'Error al generar comprobante' },
      { status: 500 }
    )
  }
}

function generatePrintableHTML(donation: any): string {
  const currentDate = new Date().toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprobante de Donación - ${donation.id}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 3px solid #ef4444;
            margin-bottom: 30px;
        }
        
        .logo {
            font-size: 28px;
            font-weight: bold;
            color: #ef4444;
            margin-bottom: 10px;
        }
        
        .title {
            font-size: 24px;
            margin-bottom: 10px;
            color: #1f2937;
        }
        
        .subtitle {
            color: #6b7280;
            font-size: 16px;
        }
        
        .section {
            margin: 25px 0;
            padding: 20px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            background: #f9fafb;
        }
        
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 2px solid #ef4444;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
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
            font-size: 24px;
            color: #059669;
            font-weight: bold;
        }
        
        .status-completed {
            color: #059669;
            font-weight: bold;
        }
        
        .message-box {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 15px 0;
            font-style: italic;
        }
        
        .impact-list {
            list-style: none;
            padding: 0;
        }
        
        .impact-list li {
            padding: 5px 0;
            padding-left: 20px;
            position: relative;
        }
        
        .impact-list li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #059669;
            font-weight: bold;
        }
        
        .thank-you {
            background: linear-gradient(135deg, #ef4444, #dc2626);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin: 25px 0;
        }
        
        .thank-you h2 {
            margin-bottom: 10px;
            font-size: 22px;
        }
        
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        
        .footer p {
            margin: 5px 0;
        }
        
        @media print {
            body { 
                max-width: none; 
                padding: 0; 
                font-size: 12px; 
            }
            .section { 
                break-inside: avoid; 
                background: white !important; 
            }
            .header { page-break-after: avoid; }
        }
    </style>
    <script>
        // Auto-abrir diálogo de impresión para generar PDF
        window.onload = function() {
            setTimeout(() => {
                window.print();
            }, 500);
        }
    </script>
</head>
<body>
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
            <span class="detail-value status-completed">✅ Completada</span>
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
        <h3 style="margin-bottom: 10px; color: #92400e;">💬 Mensaje del Donante:</h3>
        <p>"${donation.message}"</p>
    </div>
    ` : ''}

    <div class="section">
        <h2 class="section-title">📊 Impacto de tu Donación</h2>
        <p style="margin-bottom: 15px;">Con tu aporte de <strong>S/ ${Number(donation.amount).toFixed(2)}</strong> podemos:</p>
        <ul class="impact-list">
            ${getImpactListItems(Number(donation.amount))}
        </ul>
    </div>

    <div class="thank-you">
        <h2>¡Muchas Gracias! ❤️</h2>
        <p>Tu donación hace la diferencia en la vida de nuestras mascotas. Gracias a tu generosidad, podemos seguir brindando amor, cuidado y la oportunidad de encontrar un hogar a cada uno de nuestros peludos amigos.</p>
    </div>

    <div class="footer">
        <p><strong>ONG Adopción Mascotitas</strong></p>
        <p>🏠 Av. Sánchez Carrión 517, El Porvenir 13003</p>
        <p>📞 915 185 711 | 📧 info@huellitasdelmañana.org</p>
        <p>🌐 https://adopcion-mascotitas.vercel.app/</p>
        <hr style="margin: 15px 0; border: 1px solid #e5e7eb;">
        <p>Este comprobante es válido como constancia de tu donación.</p>
        <p><strong>Generado automáticamente el ${currentDate}</strong></p>
    </div>
</body>
</html>`
}

function getPaymentMethodName(method: string): string {
  switch (method) {
    case 'culqi': return 'Tarjeta/Yape (Culqi)'
    case 'yape': return 'Yape'
    default: return method
  }
}

function getImpactListItems(amount: number): string {
  const impacts = []
  
  if (amount >= 10) impacts.push('<li>Alimentar una mascota por 3 días</li>')
  if (amount >= 25) impacts.push('<li>Vacunas básicas para un cachorro</li>')
  if (amount >= 50) impacts.push('<li>Consulta veterinaria completa</li>')
  if (amount >= 100) impacts.push('<li>Cama cómoda y juguetes para una mascota</li>')
  if (amount >= 200) impacts.push('<li>Castración/esterilización de una mascota</li>')
  if (amount >= 500) impacts.push('<li>Tratamiento médico de emergencia</li>')
  
  if (impacts.length === 0) {
    impacts.push('<li>Contribuir al cuidado general de nuestras mascotas</li>')
  }
  
  return impacts.join('')
}