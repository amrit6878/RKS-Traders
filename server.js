import express from 'express';
import {mkdirSync} from 'node:fs';
import {DatabaseSync} from 'node:sqlite';
import {timingSafeEqual} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
const dataDir=process.env.RKS_DATA_DIR||root+'data';
export const products=[
{id:'brick',name:'अव्वल लाल ईंट',english:'Premium Red Bricks',category:'building',price:8500,unit:'1,000 ईंट',step:1,image:'photo-1590069261209-f8e9b8642343',tag:'सबसे ज़्यादा माँग',detail:'मजबूत नींव, भरोसेमंद गुणवत्ता • स्थानीय भट्ठा'},
{id:'sand',name:'सोन नदी लाल बालू',english:'Son River Red Sand',category:'building',price:4800,unit:'100 CFT',step:1,image:'photo-1504307651254-35680f356dfd',tag:'मंडी भाव',detail:'साफ़ और बेहतरीन • ढलाई और निर्माण के लिए'},
{id:'cement',name:'UltraTech सीमेंट',english:'UltraTech Portland Cement',category:'building',price:365,unit:'50 kg बैग',step:1,image:'photo-1519003722824-194d4455a60c',tag:'टॉप ब्रांड',detail:'मजबूती जो साथ निभाए • ताज़ा स्टॉक'},
{id:'steel',name:'Tata Tiscon सरिया 12mm',english:'Tata Tiscon 550D TMT',category:'building',price:64,unit:'किलो',step:10,image:'photo-1504917595217-d4dc5ebe6122',tag:'ISI प्रमाणित',detail:'550D ग्रेड • भूकंप प्रतिरोधी मजबूती'},
{id:'aggregate',name:'स्टोन गिट्टी 20mm',english:'20mm Stone Aggregate Gitti Granules',category:'building',price:5200,unit:'100 CFT',step:1,image:'photo-1504307651254-35680f356dfd',tag:'ढलाई के लिए',detail:'कंक्रीट और छत की ढलाई के लिए'},
{id:'toilet',name:'वेस्टर्न वॉल हंग कमोड',english:'Cera Western Wall Hung Toilet',category:'sanitary',price:4200,unit:'सेट',step:1,image:'photo-1620626011761-996317b8d101',tag:'बाथरूम कलेक्शन',detail:'व्हाइट फिनिश • सीट सहित'},
{id:'tank',name:'1000 लीटर पानी की टंकी',english:'Supreme 1000L Water Storage Tank',category:'plumbing',price:5800,unit:'टंकी',step:1,image:'photo-1585704032915-c3400ca199e7',tag:'पानी का स्टोरेज',detail:'छत पर लगाने के लिए • फिटिंग अलग'},
{id:'fan',name:'सीलिंग फैन 1200mm',english:'Ceiling Fan Electrical Appliance',category:'electrical',price:1650,unit:'पीस',step:1,image:'photo-1621905251189-08b45d6a269e',tag:'घर के लिए',detail:'ब्रांड और मॉडल कोटेशन में कन्फ़र्म होंगे'},
{id:'basin',name:'डिज़ाइनर टेबल टॉप बेसिन',english:'Hindware Oval Wash Basin',category:'sanitary',price:1850,unit:'पीस',step:1,image:'photo-1620626011761-996317b8d101',tag:'प्रीमियम पसंद',detail:'ग्लॉसी व्हाइट • आधुनिक बाथरूम के लिए'},
{id:'tiles',name:'मार्बल फिनिश विट्रिफाइड टाइल्स',english:'Marble Finish Vitrified Tiles',category:'tiles',price:48,unit:'वर्ग फ़ीट',step:10,image:'photo-1600210492486-724fe5c67fb0',tag:'नई कलेक्शन',detail:'600 × 600 mm • खूबसूरती और टिकाऊपन'},
{id:'pipe',name:'Astral CPVC पाइप 1 इंच',english:'Astral CPVC Plumbing Pipe',category:'plumbing',price:340,unit:'10 ft पाइप',step:1,image:'photo-1585704032915-c3400ca199e7',tag:'100% ओरिजिनल',detail:'गर्म और ठंडे पानी के लिए • लीक प्रूफ'},
{id:'wire',name:'Polycab 1.5 sq mm वायर',english:'Polycab FR Electrical Wire',category:'electrical',price:1950,unit:'90 m कॉइल',step:1,image:'photo-1621905251189-08b45d6a269e',tag:'सेफ्टी फर्स्ट',detail:'फ्लेम रिटार्डेंट • भरोसे की वायरिंग'}];
mkdirSync(dataDir,{recursive:true,mode:0o700});
const db=new DatabaseSync(dataDir+'/rks.sqlite');
db.exec(`PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS quotations(id TEXT PRIMARY KEY, createdAt TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'new', record TEXT NOT NULL, agentNote TEXT NOT NULL DEFAULT '');`);
export const app=express();
app.disable('x-powered-by');
app.use((req,res,next)=>{res.set('X-Content-Type-Options','nosniff');res.set('Referrer-Policy','strict-origin-when-cross-origin');next()});
app.use(express.json({limit:'7mb'}));
app.use(express.static(root+'public'));
app.get('/api/products',(_,res)=>res.set('Cache-Control','public, max-age=300').json(products));
app.get('/api/config',(_,res)=>res.json({whatsapp:process.env.BUSINESS_WHATSAPP||'918290124902',telegram:process.env.BUSINESS_TELEGRAM||null}));
const attempts=new Map();
function rateLimit(req,res,next){const key=req.ip;const now=Date.now();const old=attempts.get(key);const entry=old&&now-old.start<3600000?old:{start:now,count:0};entry.count++;attempts.set(key,entry);if(attempts.size>10000)for(const [k,v] of attempts)if(now-v.start>3600000)attempts.delete(k);if(entry.count>30)return res.status(429).json({error:'बहुत अधिक अनुरोध। कृपया बाद में कोशिश करें।'});next()}
app.post('/api/quotations',rateLimit,(req,res)=>{
 const {name,phone,location,items,note='',attachment,consent}=req.body||{};
 if(typeof name!=='string'||!name.trim()||name.length>100||typeof phone!=='string'||!/^[6-9]\d{9}$/.test(phone)||typeof location!=='string'||!location.trim()||location.length>300||!Array.isArray(items)||items.length>50||typeof note!=='string'||note.length>3000||(!items.length&&!note.trim()&&!attachment)||consent!==true)return res.status(400).json({error:'नाम, सही मोबाइल नंबर, पता, सहमति और सामान की जानकारी भरें।'});
 const normalized=[];const ids=new Set();
 for(const item of items){const p=products.find(p=>p.id===item?.id);if(!p||ids.has(p.id)||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>100000)return res.status(400).json({error:'सामान की मात्रा सही करें।'});ids.add(p.id);normalized.push({id:p.id,name:p.name,quantity:item.quantity,unit:p.unit,indicativePrice:p.price});}
 let photo=null;
 if(attachment){if(typeof attachment!=='string'||attachment.length>7000000)return res.status(400).json({error:'फोटो 5 MB तक होनी चाहिए।'});const match=attachment.match(/^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/);if(!match)return res.status(400).json({error:'केवल JPG, PNG या WebP फोटो भेजें।'});const buffer=Buffer.from(match[2],'base64');const valid=(match[1]==='jpeg'&&buffer[0]===255&&buffer[1]===216)||(match[1]==='png'&&buffer.subarray(0,8).toString('hex')==='89504e470d0a1a0a')||(match[1]==='webp'&&buffer.toString('ascii',0,4)==='RIFF'&&buffer.toString('ascii',8,12)==='WEBP');if(!valid||buffer.length>5*1024*1024)return res.status(400).json({error:'सही फोटो चुनें (अधिकतम 5 MB)।'});photo=attachment;}
 const id='RKS-'+crypto.randomUUID().slice(0,8).toUpperCase();const createdAt=new Date().toISOString();
 const record={id,name:name.trim(),phone,location:location.trim(),items:normalized,note,attachment:photo,consent:true,createdAt};
 try{db.prepare('INSERT INTO quotations(id,createdAt,record) VALUES(?,?,?)').run(id,createdAt,JSON.stringify(record));res.status(201).json({id});}catch{res.status(500).json({error:'अनुरोध सेव नहीं हुआ। कृपया फिर कोशिश करें।'});}
});
function admin(req,res,next){res.set('Cache-Control','no-store');const token=process.env.ADMIN_TOKEN;const provided=(req.get('Authorization')||'').replace(/^Bearer /,'');if(!token||token.length<24)return res.status(503).json({error:'Set ADMIN_TOKEN (at least 24 characters) on the server to enable agent access.'});const a=Buffer.from(provided),b=Buffer.from(token);if(a.length!==b.length||!timingSafeEqual(a,b))return res.status(401).json({error:'Incorrect agent access key.'});next()}
app.get('/api/admin/quotations',admin,(req,res)=>{const rows=db.prepare('SELECT * FROM quotations ORDER BY createdAt DESC LIMIT 500').all();res.json(rows.map(r=>({...JSON.parse(r.record),status:r.status,agentNote:r.agentNote})));});
app.patch('/api/admin/quotations/:id',admin,(req,res)=>{const {status,agentNote=''}=req.body||{};if(!['new','contacted','quoted','closed'].includes(status)||typeof agentNote!=='string'||agentNote.length>3000)return res.status(400).json({error:'Invalid status or note.'});const result=db.prepare('UPDATE quotations SET status=?,agentNote=? WHERE id=?').run(status,agentNote,req.params.id);if(!result.changes)return res.status(404).json({error:'Request not found.'});res.json({ok:true});});
app.use((err,req,res,next)=>res.status(err.status===413?413:400).json({error:err.status===413?'फाइल बहुत बड़ी है। अधिकतम 5 MB फोटो चुनें।':'अनुरोध पढ़ा नहीं जा सका।'}));
if(process.env.NODE_ENV!=='test')app.listen(process.env.PORT||3000,'0.0.0.0',()=>console.log('RKS Traders running on port '+(process.env.PORT||3000)));
