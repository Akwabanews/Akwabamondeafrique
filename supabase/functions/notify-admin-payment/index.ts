
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, amount, method, type, date, adminUrl } = await req.json()
    console.log(`[notify-admin-payment] Notification de paiement pour ${email}`);

    if (!BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: "BREVO_API_KEY non définie" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const subject = `🔔 [AKWABA INFO] Nouveau paiement de ${email}`
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #1e293b; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Notification de Paiement</h1>
        </div>
        <div style="padding: 30px; background-color: white;">
          <p style="font-size: 16px; color: #1e293b;">Un utilisateur a déclaré avoir effectué un paiement sur Akwaba Info.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Email client :</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Montant :</strong> ${amount} FCFA</p>
            <p style="margin: 5px 0;"><strong>Méthode :</strong> ${method}</p>
            <p style="margin: 5px 0;"><strong>Type :</strong> ${type}</p>
            <p style="margin: 5px 0;"><strong>Date :</strong> ${date}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${adminUrl}" style="display: inline-block; background-color: #1FA463; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold;">Accéder à l'Admin</a>
          </div>
        </div>
        <div style="padding: 20px; background-color: #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px;">
          <p>© 2026 Akwaba Info. Système de notification automatique.</p>
        </div>
      </div>
    `

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Notification Akwaba', email: 'notification@akwabainfo.com' },
        to: [{ email: 'akwabanewsinfo@gmail.com' }],
        subject,
        htmlContent,
      }),
    })

    const result = await response.json()
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: response.status,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
