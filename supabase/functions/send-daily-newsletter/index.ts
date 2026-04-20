
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // 1. Get all subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('subscribers')
      .select('email')

    if (subError) throw subError

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: 'No subscribers found' }), { status: 200 })
    }

    // 2. Get latest articles (top 5 from last 24h or just top 5)
    const { data: articles, error: artError } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('date', { ascending: false })
      .limit(5)

    if (artError) throw artError

    // 3. Send emails to each subscriber
    // Optimization: This function can be triggered by pg_cron for automated daily delivery.
    // We iterate and trigger the specific email sending function.
    
    const siteUrl = Deno.env.get('SITE_URL') || 'https://akwabainfo.com'
    
    const sendResults = await Promise.all(subscribers.map(async (sub) => {
      try {
        const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(sub.email)}`
        
        // Triggering the brevo function via HTTP fetch (standard in Edge Functions)
        const res = await fetch(`${SUPABASE_URL}/functions/v1/send-newsletter-brevo`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: sub.email,
            type: 'daily',
            data: {
              articles,
              siteUrl,
              unsubscribeUrl
            }
          })
        })
        return res.ok
      } catch (e) {
        console.error(`Error with ${sub.email}`, e)
        return false
      }
    }))

    return new Response(JSON.stringify({ 
      processed: subscribers.length, 
      successCount: sendResults.filter(Boolean).length 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
