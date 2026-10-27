const fs=require('fs');
const env=Object.fromEntries(fs.readFileSync('.env.local','utf8').split(/\r?\n/).filter(l=>l.includes('=')).map(l=>{const i=l.indexOf('=');return [l.slice(0,i).trim(), l.slice(i+1).trim()];}));
const {createClient}=require('@supabase/supabase-js');
const c=createClient(env.NEXT_PUBLIC_SUPABASE_URL,env.SUPABASE_SERVICE_ROLE_KEY);
async function run(){
  const {count:cc}=await c.from('categories').select('*',{count:'exact',head:true});
  if(cc>0){console.log('already seeded');return;}
  const cats=[{nama:'Buket Mawar'},{nama:'Buket Bunga Kering'},{nama:'Bunga Meja'},{nama:'Papan Bunga'}];
  const {data:ins,error:ce}=await c.from('categories').insert(cats).select();
  if(ce){console.log('CAT ERR',ce.message);return;}
  const id=n=>ins.find(x=>x.nama===n).id;
  const prods=[
    {nama:'Buket Mawar Merah Premium',deskripsi:'12 tangkai mawar merah segar dengan wrapping kertas premium.',harga:185000,stok:25,kategori_id:id('Buket Mawar'),gambar_url:'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=800',is_active:true},
    {nama:'Buket Mawar Putih Elegan',deskripsi:'10 tangkai mawar putih dengan pita satin.',harga:165000,stok:18,kategori_id:id('Buket Mawar'),gambar_url:'https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=800',is_active:true},
    {nama:'Buket Mawar Pink Romantis',deskripsi:'15 tangkai mawar pink untuk momen spesial.',harga:225000,stok:12,kategori_id:id('Buket Mawar'),gambar_url:'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=800',is_active:true},
    {nama:'Buket Bunga Kering Pastel',deskripsi:'Bunga kering tahan lama, cocok untuk dekorasi.',harga:145000,stok:30,kategori_id:id('Buket Bunga Kering'),gambar_url:'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=800',is_active:true},
    {nama:'Vas Bunga Meja Sakura',deskripsi:'Rangkaian bunga sakura dengan vas keramik.',harga:275000,stok:8,kategori_id:id('Bunga Meja'),gambar_url:'https://images.unsplash.com/photo-1495231916356-a86217efff12?w=800',is_active:true},
    {nama:'Papan Bunga Ucapan Selamat',deskripsi:'Papan bunga besar untuk ucapan selamat, gratis desain.',harga:850000,stok:5,kategori_id:id('Papan Bunga'),gambar_url:'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=800',is_active:true}
  ];
  const {error:pe}=await c.from('products').insert(prods);
  if(pe){console.log('PROD ERR',pe.message);return;}
  console.log('SEEDED '+ins.length+' kategori, '+prods.length+' produk');
}
run();
