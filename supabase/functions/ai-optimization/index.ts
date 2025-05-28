
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

// AI optimization using Gemini 2.0 Flash
async function optimizeWithGemini(prompt: string) {
  const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
  
  if (!geminiApiKey) {
    throw new Error('Gemini API key not configured');
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${geminiApiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3000,
      },
    }),
  });

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return text;
}

// Advanced performance analysis and strategy generation
async function analyzePerformanceAndCreateStrategy() {
  // Get recent analytics data (last 30 days)
  const { data: analytics } = await supabase
    .from('platform_analytics')
    .select('*')
    .gte('collected_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order('collected_at', { ascending: false });

  if (!analytics || analytics.length === 0) {
    return { message: 'No recent analytics data to analyze' };
  }

  const analysisPrompt = `
    Analyze this comprehensive social media performance data and create an intelligent optimization strategy:

    ANALYTICS DATA (Last 30 Days):
    ${JSON.stringify(analytics, null, 2)}

    REQUIREMENTS FOR ANALYSIS:
    1. Identify top-performing content patterns
    2. Determine optimal posting times per platform
    3. Analyze engagement trends and user behavior
    4. Identify content types with highest ROI
    5. Create autonomous improvement strategies
    6. Generate specific automation rules

    GENERATE COMPREHENSIVE STRATEGY:
    Return ONLY valid JSON with this structure:
    {
      "performance_insights": {
        "best_platforms": ["platform1", "platform2"],
        "optimal_posting_times": {
          "twitter": "optimal_time_analysis",
          "linkedin": "optimal_time_analysis", 
          "instagram": "optimal_time_analysis",
          "youtube": "optimal_time_analysis"
        },
        "top_content_patterns": ["pattern1", "pattern2"],
        "engagement_trends": "detailed_trend_analysis",
        "roi_analysis": "content_roi_breakdown"
      },
      "autonomous_strategies": {
        "seo_improvements": ["specific_seo_action1", "specific_seo_action2"],
        "reach_optimization": ["reach_strategy1", "reach_strategy2"],
        "engagement_boosters": ["engagement_tactic1", "engagement_tactic2"],
        "content_optimization": ["content_rule1", "content_rule2"]
      },
      "automation_rules": [
        {
          "rule_name": "high_engagement_boost",
          "conditions": {"engagement_rate": ">", "value": 0.05},
          "actions": {"increase_posting_frequency": true, "boost_similar_content": true}
        },
        {
          "rule_name": "low_performance_pivot",
          "conditions": {"seo_score": "<", "value": 60},
          "actions": {"regenerate_content": true, "adjust_hashtags": true}
        }
      ],
      "predictive_insights": {
        "next_viral_content_type": "prediction",
        "trending_topics_to_target": ["topic1", "topic2"],
        "seasonal_adjustments": "seasonal_strategy"
      }
    }
  `;

  const response = await optimizeWithGemini(analysisPrompt);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse analysis JSON:', error);
  }
  
  return null;
}

// Content optimization for maximum performance
async function optimizeContentForMaxPerformance(content: any) {
  const optimizationPrompt = `
    ADVANCED CONTENT OPTIMIZATION REQUEST:
    
    Current Content:
    - Title: ${content.optimized_title || content.title}
    - Content: ${content.optimized_content || content.content}
    - Platform: ${content.target_platform}
    - Current SEO Score: ${content.seo_score || 'Unknown'}
    - Current Engagement Prediction: ${content.engagement_prediction || 'Unknown'}

    OPTIMIZATION GOALS:
    1. Maximize SEO score (target: 90+)
    2. Increase engagement prediction (target: 0.8+)
    3. Improve viral potential
    4. Enhance reach and discoverability
    5. Optimize for platform-specific algorithms

    GENERATE SUPER-OPTIMIZED VERSION:
    Return ONLY valid JSON:
    {
      "ultra_optimized_title": "title_optimized_for_maximum_performance",
      "ultra_optimized_content": "content_optimized_for_virality_and_engagement",
      "ultra_optimized_description": "description_with_perfect_keywords",
      "power_hashtags": ["viral_hashtag1", "trending_hashtag2"],
      "seo_score": 95,
      "engagement_prediction": 0.85,
      "viral_potential": 0.8,
      "optimization_reasoning": "detailed_explanation_of_improvements",
      "algorithm_hacks": ["platform_specific_algorithm_optimization1", "optimization2"],
      "posting_strategy": "optimal_posting_time_and_frequency"
    }
  `;

  const response = await optimizeWithGemini(optimizationPrompt);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse optimization JSON:', error);
  }
  
  return null;
}

// Generate intelligent automation rules based on performance
async function generateIntelligentAutomationRules(analytics: any[]) {
  const rulesPrompt = `
    Create intelligent automation rules based on this performance data:
    
    ANALYTICS DATA:
    ${JSON.stringify(analytics.slice(0, 50), null, 2)}

    GENERATE SMART AUTOMATION RULES:
    Create rules that will autonomously improve performance. Return ONLY valid JSON:
    {
      "intelligent_rules": [
        {
          "rule_name": "content_performance_optimizer",
          "rule_type": "performance_based",
          "conditions": {"metric": "engagement_rate", "operator": ">", "value": 0.05},
          "actions": {
            "auto_boost": true,
            "replicate_style": true,
            "increase_frequency": true
          },
          "priority": "high"
        },
        {
          "rule_name": "seo_auto_improver", 
          "rule_type": "seo_optimization",
          "conditions": {"metric": "seo_score", "operator": "<", "value": 70},
          "actions": {
            "regenerate_content": true,
            "optimize_hashtags": true,
            "improve_title": true
          },
          "priority": "medium"
        }
      ],
      "autonomous_strategies": [
        "strategy1_based_on_data",
        "strategy2_based_on_trends"
      ]
    }
  `;

  const response = await optimizeWithGemini(rulesPrompt);
  
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Failed to parse rules JSON:', error);
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, content_id, trigger } = await req.json();
    
    let result = {};

    if (action === 'optimize_content' && content_id) {
      // Optimize specific content for maximum performance
      const { data: content } = await supabase
        .from('processed_content')
        .select('*')
        .eq('id', content_id)
        .single();

      if (content) {
        const optimization = await optimizeContentForMaxPerformance(content);
        
        if (optimization) {
          // Update with ultra-optimized version
          await supabase
            .from('processed_content')
            .update({
              optimized_title: optimization.ultra_optimized_title,
              optimized_content: optimization.ultra_optimized_content,
              optimized_description: optimization.ultra_optimized_description,
              hashtags: optimization.power_hashtags,
              seo_score: optimization.seo_score,
              engagement_prediction: optimization.engagement_prediction,
              ai_insights: {
                ...content.ai_insights,
                ultra_optimization: optimization.optimization_reasoning,
                viral_potential: optimization.viral_potential,
                algorithm_hacks: optimization.algorithm_hacks,
                posting_strategy: optimization.posting_strategy
              }
            })
            .eq('id', content_id);

          // Store optimization history
          await supabase
            .from('ai_optimization_history')
            .insert({
              content_id: content_id,
              optimization_type: 'ultra_performance_optimization',
              original_data: content,
              optimized_data: optimization,
              ai_reasoning: optimization.optimization_reasoning,
              success_score: optimization.seo_score / 100
            });

          result = { message: 'Content ultra-optimized for maximum performance', optimization };
        }
      }
    } else if (action === 'performance_analysis' || trigger === 'scheduled') {
      // Comprehensive performance analysis and strategy creation
      const analysis = await analyzePerformanceAndCreateStrategy();
      
      if (analysis && analysis.automation_rules) {
        // Store intelligent automation rules
        for (const rule of analysis.automation_rules) {
          await supabase
            .from('automation_rules')
            .upsert({
              rule_name: rule.rule_name,
              rule_type: rule.rule_type || 'performance_based',
              conditions: rule.conditions,
              actions: rule.actions,
              is_active: true
            }, { onConflict: 'rule_name' });
        }
      }
      
      result = analysis;
    } else if (action === 'auto_optimize_all') {
      // Auto-optimize all content for maximum performance
      const { data: allContent } = await supabase
        .from('processed_content')
        .select('*')
        .lt('seo_score', 80)
        .limit(10);

      let optimizedCount = 0;
      
      if (allContent) {
        for (const content of allContent) {
          const optimization = await optimizeContentForMaxPerformance(content);
          
          if (optimization) {
            await supabase
              .from('processed_content')
              .update({
                optimized_title: optimization.ultra_optimized_title,
                optimized_content: optimization.ultra_optimized_content,
                optimized_description: optimization.ultra_optimized_description,
                hashtags: optimization.power_hashtags,
                seo_score: optimization.seo_score,
                engagement_prediction: optimization.engagement_prediction,
                ai_insights: {
                  ...content.ai_insights,
                  ultra_optimization: optimization.optimization_reasoning,
                  viral_potential: optimization.viral_potential
                }
              })
              .eq('id', content.id);

            optimizedCount++;
          }
        }
      }
      
      result = { 
        message: `Auto-optimized ${optimizedCount} pieces of content for maximum performance`,
        optimized_count: optimizedCount 
      };
    } else {
      result = { message: 'AI optimization system running autonomously' };
    }

    return new Response(JSON.stringify({ success: true, ...result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-optimization function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
