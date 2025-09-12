import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { action, session_name, subreddit, session_id } = await req.json();

    if (action === 'create') {
      // Create new analysis session
      const { data, error } = await supabaseClient
        .from('analysis_sessions')
        .insert({
          session_name: session_name || `Analysis ${new Date().toISOString()}`,
          subreddit: subreddit,
          status: 'pending',
          analysis_parameters: {
            subreddit: subreddit,
            created_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create session: ${error.message}`);
      }

      console.log(`Created new analysis session: ${data.id}`);

      return new Response(JSON.stringify({ 
        success: true,
        session: data,
        message: 'Analysis session created successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'get') {
      // Get session details
      const { data, error } = await supabaseClient
        .from('analysis_sessions')
        .select('*')
        .eq('id', session_id)
        .single();

      if (error) {
        throw new Error(`Failed to get session: ${error.message}`);
      }

      return new Response(JSON.stringify({ 
        success: true,
        session: data
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'list') {
      // List all sessions
      const { data, error } = await supabaseClient
        .from('analysis_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to list sessions: ${error.message}`);
      }

      return new Response(JSON.stringify({ 
        success: true,
        sessions: data || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'delete') {
      // Delete session and related data
      const { error } = await supabaseClient
        .from('analysis_sessions')
        .delete()
        .eq('id', session_id);

      if (error) {
        throw new Error(`Failed to delete session: ${error.message}`);
      }

      console.log(`Deleted analysis session: ${session_id}`);

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Analysis session deleted successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'run-full-analysis') {
      // Run complete analysis pipeline
      const { data: session, error: sessionError } = await supabaseClient
        .from('analysis_sessions')
        .select('*')
        .eq('id', session_id)
        .single();

      if (sessionError) {
        throw new Error(`Failed to get session: ${sessionError.message}`);
      }

      console.log(`Starting full analysis for session: ${session_id}`);

      // Step 1: Extract Reddit data
      const extractResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/reddit-extract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          subreddit: session.subreddit,
          limit: 100,
          session_id: session_id
        })
      });

      if (!extractResponse.ok) {
        throw new Error('Failed to extract Reddit data');
      }

      const extractResult = await extractResponse.json();
      console.log('Reddit extraction completed:', extractResult);

      // Step 2: Run bot detection
      const detectionResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/bot-detection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          session_id: session_id
        })
      });

      if (!detectionResponse.ok) {
        throw new Error('Failed to run bot detection');
      }

      const detectionResult = await detectionResponse.json();
      console.log('Bot detection completed:', detectionResult);

      return new Response(JSON.stringify({ 
        success: true,
        extraction_result: extractResult,
        detection_result: detectionResult,
        message: 'Full analysis pipeline completed successfully'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in analysis-session function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});