const {createClient}=require('@supabase/supabase-js');
const c=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run(){
  const tables=['profiles','categories','products','cart_items','orders','order_items','payments','reviews'];
  for(const t of tables){
    const {count,error}=await c.from(t).select('*',{count:'exact',head:true});
    console.log(t.padEnd(14), error?('ERROR: '+error.message):('rows='+count));
  }
  const {data:buckets,error:be}=await c.storage.listBuckets();
  console.log('buckets:', be?('ERROR '+be.message):buckets.map(b=>b.name+'('+(b.public?'public':'private')+')').join(', '));
}
run();
