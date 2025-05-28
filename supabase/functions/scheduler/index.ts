
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const currentTime = new Date();
    const istTime = new Date(currentTime.getTime() + (5.5 * 60 * 60 * 1000)); // IST offset
    
    console.log('Scheduler running at IST:', istTime.toISOString());

    // Check if it's 11:45 PM IST for analytics collection
    if (istTime.getHours() === 23 && istTime.getMinutes() === 45) {
      console.log('Triggering daily analytics collection...');
      
      // Call analytics collection function
      const analyticsResponse = await supabase.functions.invoke('collect-analytics', {
        body: { trigger: 'scheduled' }
      });
      
      console.log('Analytics collection result:', analyticsResponse);
    }

    // Run AI optimization continuously
    console.log('Running AI optimization...');
    const optimizationResponse = await supabase.functions.invoke('ai-optimization', {
      body: { 
        action: 'performance_analysis',
        trigger: 'scheduled' 
      }
    });
    
    console.log('AI optimization result:', optimizationResponse);

    // Process any scheduled tasks
    const { data: scheduledTasks } = await supabase
      .from('scheduled_tasks')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(10);

    if (scheduledTasks && scheduledTasks.length > 0) {
      for (const task of scheduledTasks) {
        try {
          let result = null;
          
          switch (task.task_type) {
            case 'collect_analytics':
              result = await supabase.functions.invoke('collect-analytics', {
                body: task.task_data
              });
              break;
            case 'publish_content':
              result = await supabase.functions.invoke('publish-content', {
                body: task.task_data
              });
              break;
            case 'optimize_content':
              result = await supabase.functions.invoke('ai-optimization', {
                body: { action: 'optimize_content', ...task.task_data }
              });
              break;
          }

          // Update task status
          await supabase
            .from('scheduled_tasks')
            .update({
              status: 'completed',
              executed_at: new Date().toISOString(),
              result: result
            })
            .eq('id', task.id);
            
        } catch (error) {
          console.error(`Error executing task ${task.id}:`, error);
          
          await supabase
            .from('scheduled_tasks')
            .update({
              status: 'failed',
              executed_at: new Date().toISOString(),
              result: { error: error.message }
            })
            .eq('id', task.id);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Scheduler executed successfully',
      time_ist: istTime.toISOString(),
      tasks_processed: scheduledTasks?.length || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in scheduler function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
