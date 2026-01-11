/**
 * Live Sync Server for Election Contacts (Komandoo C13)
 */
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');
app.use(cors());
app.use(express.json({ limit: '2mb' }));
function loadData() { try { return JSON.parse(fs.readFileSync(DATA_FILE,'utf-8')); } catch(e){ return {contacts:[],comments:[]};}}
function saveData(d){ fs.writeFileSync(DATA_FILE, JSON.stringify(d,null,2),'utf-8');}
let db = loadData();
let clients=[];
app.get('/events',(req,res)=>{res.setHeader('Content-Type','text/event-stream');res.setHeader('Cache-Control','no-cache');res.setHeader('Connection','keep-alive');const id=Date.now();clients.push({id,res});res.write('event: ping
');res.write('data:{"ok":true}

');req.on('close',()=>{clients=clients.filter(c=>c.id!==id);});});
function broadcast(type,payload){const data=JSON.stringify(payload);clients.forEach(c=>{c.res.write(`event: ${type}
`);c.res.write(`data: ${data}

`);});}
app.get('/contacts',(req,res)=>res.json(db.contacts));
app.post('/contacts',(req,res)=>{const c=req.body;if(!c.fullName)return res.status(400).json({error:'fullName required'});c.id=Number(c.id)|| (db.contacts.reduce((m,x)=>Math.max(m,x.id||0),0)+1);db.contacts.push(c);saveData(db);broadcast('contacts',{action:'create',contact:c});res.json(c);});
app.put('/contacts/:id',(req,res)=>{const id=Number(req.params.id);const idx=db.contacts.findIndex(x=>Number(x.id)===id);if(idx<0)return res.status(404).json({error:'not found'});const updated={...db.contacts[idx],...req.body,id};db.contacts[idx]=updated;saveData(db);broadcast('contacts',{action:'update',contact:updated});res.json(updated);});
app.delete('/contacts/:id',(req,res)=>{const id=Number(req.params.id);db.contacts=db.contacts.filter(x=>Number(x.id)!=id);db.comments=db.comments.filter(cm=>Number(cm.contactId)!=id);saveData(db);broadcast('contacts',{action:'delete',id});res.json({ok:true});});
app.get('/comments',(req,res)=>{const cid=req.query.contactId?Number(req.query.contactId):null;res.json(cid?db.comments.filter(cm=>Number(cm.contactId)===cid):db.comments);});
app.post('/comments',(req,res)=>{const cm=req.body;if(!cm.contactId||!cm.text)return res.status(400).json({error:'contactId & text required'});cm.id=Number(cm.id)|| (db.comments.reduce((m,x)=>Math.max(m,x.id||0),0)+1);cm.commentedOn=cm.commentedOn||new Date().toISOString();db.comments.push(cm);saveData(db);broadcast('comments',{action:'create',comment:cm});res.json(cm);});
app.listen(PORT,()=>console.log(`Server running on http://localhost:${PORT}`));
