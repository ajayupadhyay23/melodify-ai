require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

async function runSchema() {
  console.log('🔧 Setting up Supabase tables...\n');

  // Create chat_history table
  const { error: e1 } = await supabase.rpc('exec_sql', {
    sql: `
      create table if not exists chat_history (
        id          uuid primary key default gen_random_uuid(),
        session_id  text not null,
        user_message text not null,
        ai_reply    text not null,
        topic       text default 'General',
        created_at  timestamptz default now()
      );
    `
  });
  if (e1) console.log('Note (chat_history):', e1.message);
  else console.log('✅ chat_history table ready');

  // Create quiz_results table
  const { error: e2 } = await supabase.rpc('exec_sql', {
    sql: `
      create table if not exists quiz_results (
        id          uuid primary key default gen_random_uuid(),
        session_id  text not null,
        player_name text not null default 'Anonymous',
        topic       text not null,
        level       text not null default 'Beginner',
        score       int not null,
        total       int not null,
        created_at  timestamptz default now()
      );
    `
  });
  if (e2) console.log('Note (quiz_results):', e2.message);
  else console.log('✅ quiz_results table ready');

  // Test insert into chat_history
  console.log('\n📝 Testing chat_history insert...');
  const { data: d1, error: e3 } = await supabase
    .from('chat_history')
    .insert([{
      session_id: 'test_setup',
      user_message: 'What is a C Major chord?',
      ai_reply: 'A C Major chord consists of C, E, and G.',
      topic: 'Chords'
    }])
    .select();
  if (e3) console.log('❌ Insert failed:', e3.message);
  else console.log('✅ chat_history insert works! Row ID:', d1[0]?.id);

  // Test insert into quiz_results
  console.log('\n📝 Testing quiz_results insert...');
  const { data: d2, error: e4 } = await supabase
    .from('quiz_results')
    .insert([{
      session_id: 'test_setup',
      player_name: 'Test User',
      topic: 'Major Scales',
      level: 'Beginner',
      score: 4,
      total: 5
    }])
    .select();
  if (e4) console.log('❌ Insert failed:', e4.message);
  else console.log('✅ quiz_results insert works! Row ID:', d2[0]?.id);

  // Get stats
  console.log('\n📊 Stats:');
  const { count: c1 } = await supabase.from('chat_history').select('*', { count: 'exact', head: true });
  const { count: c2 } = await supabase.from('quiz_results').select('*', { count: 'exact', head: true });
  console.log('  chat_history rows:', c1);
  console.log('  quiz_results rows:', c2);

  console.log('\n✅ All done! Tables are ready.');
}

runSchema().catch(console.error);
