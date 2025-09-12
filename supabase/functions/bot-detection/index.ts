import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UserAnalysis {
  username: string;
  account_age_days: number;
  comment_karma: number;
  link_karma: number;
  is_verified: boolean;
  has_verified_email: boolean;
  is_premium: boolean;
  post_count: number;
  comment_count: number;
  avg_post_score: number;
  posting_frequency: number;
}

interface BotDetectionResult {
  username: string;
  bot_probability: number;
  confidence_score: number;
  detection_method: string;
  features_analyzed: Record<string, any>;
  risk_factors: string[];
}

// Isolation Forest-like algorithm for anomaly detection
class SimpleAnomalyDetector {
  private data: number[][] = [];
  private featureNames: string[] = [];

  constructor(featureNames: string[]) {
    this.featureNames = featureNames;
  }

  fit(data: number[][]) {
    this.data = data;
  }

  // Simple anomaly score based on statistical deviation
  predict(sample: number[]): number {
    if (this.data.length === 0) return 0.5;

    let anomalyScore = 0;
    
    for (let i = 0; i < sample.length; i++) {
      const feature = sample[i];
      const featureValues = this.data.map(row => row[i]);
      
      const mean = featureValues.reduce((a, b) => a + b, 0) / featureValues.length;
      const variance = featureValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / featureValues.length;
      const stdDev = Math.sqrt(variance);
      
      if (stdDev > 0) {
        const zScore = Math.abs((feature - mean) / stdDev);
        anomalyScore += Math.min(zScore / 3, 1); // Normalize to 0-1
      }
    }
    
    return Math.min(anomalyScore / sample.length, 1);
  }
}

function extractFeatures(user: UserAnalysis): number[] {
  const karmaRatio = user.link_karma + user.comment_karma > 0 
    ? user.comment_karma / (user.link_karma + user.comment_karma) 
    : 0;
  
  const postCommentRatio = user.comment_count > 0 
    ? user.post_count / user.comment_count 
    : user.post_count;
  
  return [
    user.account_age_days || 0,
    user.comment_karma || 0,
    user.link_karma || 0,
    karmaRatio,
    user.posting_frequency || 0,
    user.avg_post_score || 0,
    postCommentRatio,
    user.is_verified ? 1 : 0,
    user.has_verified_email ? 1 : 0,
    user.is_premium ? 1 : 0,
  ];
}

function analyzeBotProbability(user: UserAnalysis): BotDetectionResult {
  const features = extractFeatures(user);
  const riskFactors: string[] = [];
  
  // Rule-based risk assessment
  if (user.account_age_days < 30) {
    riskFactors.push('Very new account');
  }
  
  if (user.comment_karma < 10 && user.account_age_days > 90) {
    riskFactors.push('Low karma for account age');
  }
  
  if (user.posting_frequency > 10) {
    riskFactors.push('High posting frequency');
  }
  
  if (!user.has_verified_email && user.account_age_days > 7) {
    riskFactors.push('Unverified email');
  }
  
  const karmaRatio = user.link_karma + user.comment_karma > 0 
    ? user.comment_karma / (user.link_karma + user.comment_karma) 
    : 0;
  
  if (karmaRatio < 0.1 && user.link_karma > 100) {
    riskFactors.push('Unusually high link karma ratio');
  }
  
  // Simple scoring algorithm
  let botScore = 0;
  
  // Account age factor
  if (user.account_age_days < 7) botScore += 0.3;
  else if (user.account_age_days < 30) botScore += 0.2;
  else if (user.account_age_days < 90) botScore += 0.1;
  
  // Karma factors
  if (user.comment_karma < 5) botScore += 0.2;
  if (user.link_karma === 0 && user.comment_karma === 0) botScore += 0.3;
  
  // Activity patterns
  if (user.posting_frequency > 5) botScore += 0.2;
  if (user.avg_post_score < 1) botScore += 0.1;
  
  // Verification factors
  if (!user.has_verified_email) botScore += 0.1;
  if (!user.is_verified && user.account_age_days > 365) botScore += 0.05;
  
  const botProbability = Math.min(botScore, 1);
  const confidenceScore = riskFactors.length > 0 ? 0.7 + (riskFactors.length * 0.1) : 0.5;
  
  return {
    username: user.username,
    bot_probability: botProbability,
    confidence_score: Math.min(confidenceScore, 1),
    detection_method: 'rule_based_scoring',
    features_analyzed: {
      account_age_days: user.account_age_days,
      comment_karma: user.comment_karma,
      link_karma: user.link_karma,
      karma_ratio: karmaRatio,
      posting_frequency: user.posting_frequency,
      avg_post_score: user.avg_post_score,
      is_verified: user.is_verified,
      has_verified_email: user.has_verified_email,
      is_premium: user.is_premium
    },
    risk_factors: riskFactors
  };
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

    const { session_id, usernames } = await req.json();
    
    console.log(`Starting bot detection analysis for session: ${session_id}`);

    // Update session status
    if (session_id) {
      await supabaseClient
        .from('analysis_sessions')
        .update({ status: 'analyzing' })
        .eq('id', session_id);
    }

    // Get users to analyze
    let query = supabaseClient
      .from('reddit_accounts')
      .select('*');
    
    if (usernames && usernames.length > 0) {
      query = query.in('username', usernames);
    }
    
    const { data: users, error: usersError } = await query;
    
    if (usersError) {
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    if (!users || users.length === 0) {
      throw new Error('No users found for analysis');
    }

    console.log(`Analyzing ${users.length} users for bot behavior`);

    // Get post and comment counts for each user
    const analysisResults: BotDetectionResult[] = [];
    
    for (const user of users) {
      // Get post count and average score
      const { data: posts } = await supabaseClient
        .from('reddit_posts')
        .select('score')
        .eq('author_username', user.username);
      
      // Get comment count
      const { data: comments } = await supabaseClient
        .from('reddit_comments')
        .select('id')
        .eq('author_username', user.username);
      
      const postCount = posts?.length || 0;
      const commentCount = comments?.length || 0;
      const avgPostScore = postCount > 0 
        ? posts!.reduce((sum, post) => sum + (post.score || 0), 0) / postCount 
        : 0;
      
      const postingFrequency = user.account_age_days > 0 
        ? (postCount + commentCount) / user.account_age_days 
        : 0;
      
      const userAnalysis: UserAnalysis = {
        username: user.username,
        account_age_days: user.account_age_days || 0,
        comment_karma: user.comment_karma || 0,
        link_karma: user.link_karma || 0,
        is_verified: user.is_verified || false,
        has_verified_email: user.has_verified_email || false,
        is_premium: user.is_premium || false,
        post_count: postCount,
        comment_count: commentCount,
        avg_post_score: avgPostScore,
        posting_frequency: postingFrequency
      };
      
      const result = analyzeBotProbability(userAnalysis);
      analysisResults.push(result);
    }

    // Store results
    const resultInserts = analysisResults.map(result => ({
      username: result.username,
      bot_probability: result.bot_probability,
      confidence_score: result.confidence_score,
      detection_method: result.detection_method,
      features_analyzed: result.features_analyzed,
      risk_factors: result.risk_factors
    }));

    await supabaseClient
      .from('bot_detection_results')
      .upsert(resultInserts, { onConflict: 'username' });

    const botsDetected = analysisResults.filter(r => r.bot_probability > 0.5).length;

    // Update session
    if (session_id) {
      await supabaseClient
        .from('analysis_sessions')
        .update({ 
          status: 'completed',
          bots_detected: botsDetected,
          completed_at: new Date().toISOString()
        })
        .eq('id', session_id);
    }

    console.log(`Analysis completed. Detected ${botsDetected} potential bots out of ${users.length} users`);

    return new Response(JSON.stringify({ 
      success: true,
      users_analyzed: users.length,
      bots_detected: botsDetected,
      results: analysisResults,
      message: 'Bot detection analysis completed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in bot-detection function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});