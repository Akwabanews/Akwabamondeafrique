
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
    const { email, type, data } = await req.json()
    console.log(`[send-newsletter-brevo] Demande reçue pour ${email}, type: ${type}`);

    if (!BREVO_API_KEY) {
      console.error("[send-newsletter-brevo] BREVO_API_KEY est manquante dans les variables d'environnement !");
      return new Response(JSON.stringify({ error: "Configuration manquante: BREVO_API_KEY non définie" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    let subject = ''
    let htmlContent = ''

    if (type === 'welcome') {
      subject = 'Bienvenue chez Akwaba Info !'
      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
          <div style="background-color: #1FA463; padding: 40px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AKWABA INFO</h1>
            <p style="color: white; opacity: 0.8; margin-top: 10px; font-weight: bold;">L'info du monde en un clic</p>
          </div>
          <div style="padding: 40px; background-color: white;">
            <h2 style="color: #1e293b; margin-top: 0;">Bienvenue parmi nous !</h2>
            <p style="color: #475569; line-height: 1.6;">Merci de vous être abonné à la newsletter d'Akwaba Info. Vous recevrez désormais nos meilleures actualités directement dans votre boîte mail.</p>
            <div style="margin: 30px 0; padding: 20px; background-color: #f8fafc; border-radius: 12px; border-left: 4px solid #1FA463;">
              <p style="margin: 0; font-style: italic; color: #64748b;">"L'information est une arme, nous vous donnons les clés pour comprendre le monde."</p>
            </div>
            <p style="color: #475569; line-height: 1.6;">À très vite sur notre plateforme !</p>
            <a href="${data?.siteUrl || 'https://akwabainfo.com'}" style="display: inline-block; background-color: #1FA463; color: white; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 20px;">Visiter le site</a>
          </div>
          <div style="padding: 20px; background-color: #f1f5f9; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>© 2026 Akwaba Info. Tous droits réservés.</p>
            <p>Vous recevez cet email car vous vous êtes inscrit à notre newsletter. <a href="${data?.unsubscribeUrl}" style="color: #1FA463;">Se désabonner</a></p>
          </div>
        </div>
      `
    } else if (type === 'daily') {
      subject = `Akwaba Info : L'actualité du jour - ${new Date().toLocaleDateString('fr-FR')}`
      const articlesHtml = data?.articles?.map((a: any) => `
        <div style="margin-bottom: 30px; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px;">
          ${a.image ? `<img src="${a.image}" style="width: 100%; border-radius: 12px; height: 200px; object-fit: cover; margin-bottom: 15px;" />` : ''}
          <span style="background-color: #1FA46315; color: #1FA463; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: bold; text-transform: uppercase;">${a.category}</span>
          <h3 style="margin: 10px 0; font-size: 18px; color: #1e293b;">${a.title}</h3>
          <p style="color: #64748b; font-size: 14px; line-height: 1.5;">${a.excerpt}</p>
          <a href="${data?.siteUrl}/article/${a.id}" style="color: #1FA463; font-weight: bold; text-decoration: none; font-size: 14px;">Lire la suite →</a>
        </div>
      `).join('') || ''

      htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden;">
          <div style="background-color: #1FA463; padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px; letter-spacing: -1px;">AKWABA INFO</h1>
            <p style="color: white; opacity: 0.7; margin-top: 5px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;">Le débrief quotidien</p>
          </div>
          <div style="padding: 30px; background-color: white;">
            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 20px; font-weight: bold;">${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <h2 style="color: #1e293b; margin-top: 0; margin-bottom: 30px; border-left: 4px solid #1FA463; padding-left: 15px;">À la une aujourd'hui</h2>
            ${articlesHtml}
            <div style="text-align: center; margin-top: 40px;">
              <a href="${data?.siteUrl}" style="display: inline-block; background-color: #1FA463; color: white; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: bold;">Voir toute l'actualité</a>
            </div>
          </div>
          <div style="padding: 30px; background-color: #f8fafc; text-align: center; color: #94a3b8; font-size: 11px;">
            <p>© 2026 Akwaba Info. Abidjan, Côte d'Ivoire.</p>
            <p>Suivez-nous sur nos réseaux sociaux pour ne rien rater.</p>
            <p style="margin-top: 20px;">
              <a href="${data?.unsubscribeUrl}" style="color: #94a3b8; text-decoration: underline;">Se désabonner</a>
            </p>
          </div>
        </div>
      `
    }

    // Note: We use native fetch here as requested, avoiding pg_net conflicts in the Edge Function environment.
    console.log(`[send-newsletter-brevo] Appel de l'API Brevo...`);
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY || '',
        'content-type': 'application/json',
        'accept': 'application/json',
      },
      body: JSON.stringify({
        sender: { name: 'Akwaba Info', email: 'newsletter@akwabainfo.com' },
        to: [{ email }],
        subject,
        htmlContent,
      }),
    })

    const result = await response.json()
    console.log(`[send-newsletter-brevo] Statut API Brevo: ${response.status}`, result);

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
