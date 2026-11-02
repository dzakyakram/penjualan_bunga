const fs=require('fs');
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
async function run(){
  const res=await fetch(env.NEXT_PUBLIC_SUPABASE_URL+'/rest/v1/',{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY}});
  const spec=await res.json();
  for(const p of ['/rpc/checkout','/rpc/cancel_order','/rpc/is_admin']){
    const item=spec.paths[p]?.post;
    console.log('== '+p);
    console.log(JSON.stringify(item?.parameters||item?.requestBody||'no-params'));
  }
}
run();
