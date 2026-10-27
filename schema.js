const fs=require('fs');
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
async function run(){
  const res=await fetch(env.NEXT_PUBLIC_SUPABASE_URL+'/rest/v1/',{headers:{apikey:env.SUPABASE_SERVICE_ROLE_KEY,Authorization:'Bearer '+env.SUPABASE_SERVICE_ROLE_KEY}});
  const text=await res.text();
  const spec=JSON.parse(text);
  const defs=spec.definitions||spec.components?.schemas||{};
  const names=Object.keys(defs);
  console.log('STATUS',res.status,'tables:',names.join(','));
  for(const t of names){
    const d=defs[t];
    const props=Object.keys(d.properties||{});
    console.log('== '+t+' : '+props.join(', '));
  }
}
run();
