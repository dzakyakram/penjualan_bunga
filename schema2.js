const fs=require('fs');
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
async function run(){
  const res=await fetch(env.NEXT_PUBLIC_SUPABASE_URL+'/rest/v1/',{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY}});
  const spec=await res.json();
  const paths=Object.keys(spec.paths||{}).filter(p=>p.startsWith('/rpc/'));
  console.log('RPCs:', paths.join(', ')||'(none)');
  const enums=(spec.definitions?.orders?.properties||{});
  console.log('orders.status:', JSON.stringify(spec.definitions?.orders?.properties?.status));
  console.log('payments.status:', JSON.stringify(spec.definitions?.payments?.properties?.status));
}
run();
