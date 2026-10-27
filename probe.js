const fs=require('fs');
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const {createClient}=require('@supabase/supabase-js');
const c=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:false,persistSession:false}});
async function run(){
  const email='probe'+Date.now()+'@test.local';
  const {data,error}=await c.auth.admin.createUser({email,password:'test123456',email_confirm:true,user_metadata:{nama:'Probe User'}});
  if(error){console.log('CREATE ERR',error.message);return;}
  const uid=data.user.id;
  await new Promise(r=>setTimeout(r,800));
  const {data:prof,error:perr}=await c.from('profiles').select('*').eq('id',uid);
  console.log('AUTO PROFILE:', perr?('ERR '+perr.message):JSON.stringify(prof));
  const {error:ce}=await c.from('profiles').insert({id:uid,nama:'Probe User'});
  console.log('INSERT PROFILE:', ce?('ERR '+ce.message):'ok');
  const {data:r,error:re}=await c.rpc('checkout',{p_user_id:uid,p_alamat_kirim:'Jl. Test No. 1',p_tanggal_kirim:'2026-12-01',p_kartu_ucapan:'',p_items:[]});
  console.log('CHECKOUT EMPTY:', re?('ERR '+re.message):JSON.stringify(r));
  await c.auth.admin.deleteUser(uid);
  console.log('cleaned');
}
run();
