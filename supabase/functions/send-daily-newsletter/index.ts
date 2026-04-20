
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
    // We call the other edge function or call Brevo directly here to avoid timeout issues with 1000s of emails
    // For simplicity, we'll iterate and call the Brevo function or trigger it.
    // In a real prod environment, we would use a queue or Brevo's campaign API.
    
    const siteUrl = 'https://akwabainfo.com' // Should be an env var
    
    const sendResults = await Promise.all(subscribers.map(async (sub) => {
      try {
        const unsubscribeUrl = `${siteUrl}/unsubscribe?email=${encodeURIComponent(sub.email)}`
        
        // We trigger the send-newsletter-brevo function for each subscriber
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
        console.error(`Failed to send to ${sub.email}`, e)
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
