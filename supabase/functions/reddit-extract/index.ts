import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RedditTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface RedditUser {
  name: string;
  created_utc: number;
  comment_karma: number;
  link_karma: number;
  is_verified?: boolean;
  has_verified_email?: boolean;
  is_gold?: boolean;
}

interface RedditPost {
  data: {
    id: string;
    author: string;
    title: string;
    selftext: string;
    subreddit: string;
    score: number;
    upvote_ratio: number;
    num_comments: number;
    created_utc: number;
    is_self: boolean;
    domain: string;
    url: string;
  }
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

    const { subreddit, limit = 100, session_id } = await req.json();
    
    console.log(`Starting Reddit extraction for subreddit: ${subreddit}, limit: ${limit}`);

    // Get Reddit OAuth token
    const clientId = Deno.env.get('REDDIT_CLIENT_ID');
    const clientSecret = Deno.env.get('REDDIT_CLIENT_SECRET');
    
    if (!clientId || !clientSecret) {
      throw new Error('Reddit API credentials not configured');
    }

    const auth = btoa(`${clientId}:${clientSecret}`);
    const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'User-Agent': 'BotDetectionApp/1.0',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials'
    });

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get Reddit token: ${tokenResponse.statusText}`);
    }

    const tokenData: RedditTokenResponse = await tokenResponse.json();
    console.log('Successfully obtained Reddit OAuth token');

    // Update session status
    if (session_id) {
      await supabaseClient
        .from('analysis_sessions')
        .update({ status: 'extracting_data' })
        .eq('id', session_id);
    }

    // Extract subreddit posts
    const postsResponse = await fetch(`https://oauth.reddit.com/r/${subreddit}/hot?limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': 'BotDetectionApp/1.0',
      }
    });

    if (!postsResponse.ok) {
      throw new Error(`Failed to fetch posts: ${postsResponse.statusText}`);
    }

    const postsData = await postsResponse.json();
    const posts = postsData.data.children as RedditPost[];
    
    console.log(`Extracted ${posts.length} posts from r/${subreddit}`);

    // Store posts and extract unique users
    const uniqueUsers = new Set<string>();
    const postInserts = [];
    
    for (const post of posts) {
      if (post.data.author && post.data.author !== '[deleted]') {
        uniqueUsers.add(post.data.author);
        
        postInserts.push({
          reddit_id: post.data.id,
          author_username: post.data.author,
          title: post.data.title,
          content: post.data.selftext,
          subreddit: post.data.subreddit,
          score: post.data.score,
          upvote_ratio: post.data.upvote_ratio,
          num_comments: post.data.num_comments,
          created_utc: post.data.created_utc,
          is_self: post.data.is_self,
          domain: post.data.domain,
          url: post.data.url
        });
      }
    }

    // Insert posts
    if (postInserts.length > 0) {
      await supabaseClient
        .from('reddit_posts')
        .upsert(postInserts, { onConflict: 'reddit_id' });
    }

    // Extract user data
    const userInserts = [];
    const userArray = Array.from(uniqueUsers);
    
    console.log(`Extracting data for ${userArray.length} unique users`);

    for (const username of userArray) {
      try {
        const userResponse = await fetch(`https://oauth.reddit.com/user/${username}/about`, {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'User-Agent': 'BotDetectionApp/1.0',
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const user: RedditUser = userData.data;
          
          const accountAge = Math.floor((Date.now() / 1000 - user.created_utc) / (24 * 60 * 60));
          
          userInserts.push({
            username: user.name,
            account_created_utc: user.created_utc,
            comment_karma: user.comment_karma,
            link_karma: user.link_karma,
            is_verified: user.is_verified || false,
            has_verified_email: user.has_verified_email || false,
            is_premium: user.is_gold || false,
            account_age_days: accountAge
          });
        }
      } catch (error) {
        console.log(`Failed to fetch user ${username}:`, error);
      }
      
      // Rate limiting - wait between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Insert users
    if (userInserts.length > 0) {
      await supabaseClient
        .from('reddit_accounts')
        .upsert(userInserts, { onConflict: 'username' });
    }

    // Update session
    if (session_id) {
      await supabaseClient
        .from('analysis_sessions')
        .update({ 
          status: 'data_extracted',
          total_accounts_analyzed: userInserts.length
        })
        .eq('id', session_id);
    }

    console.log(`Successfully extracted and stored data for ${userInserts.length} users`);

    return new Response(JSON.stringify({ 
      success: true,
      posts_extracted: posts.length,
      users_extracted: userInserts.length,
      message: 'Reddit data extraction completed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in reddit-extract function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});