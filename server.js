// Backend notifikasi Telegram — hanya mencatat event halaman, spin, dan klaim demo.
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json({limit:"2kb"}));

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const allowed = new Set(["page_open","spin_clicked","claim_clicked"]);

app.post("/api/event", async (req,res) => {
  const event = req.body && req.body.event;
  if (!allowed.has(event)) return res.status(400).json({ok:false});
  if (!BOT_TOKEN || !CHAT_ID) return res.status(503).json({ok:false,message:"Telegram belum dikonfigurasi"});
  const labels = {
    page_open: "Pengunjung membuka halaman Spin FF Demo",
    spin_clicked: "Pengunjung menekan tombol spin",
    claim_clicked: "Pengunjung menekan klaim hadiah demo"
  };
  const message = `🔔 ${labels[event]}\nWaktu: ${new Date().toLocaleString("id-ID",{timeZone:"Asia/Jakarta"})}`;
  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({chat_id:CHAT_ID,text:message})
    });
    const data = await r.json();
    if (!data.ok) return res.status(502).json({ok:false});
    res.json({ok:true});
  } catch(e) { res.status(502).json({ok:false}); }
});
app.get("/",(req,res)=>res.send("Spin FF notification backend aktif."));
const port = process.env.PORT || 3000;
app.listen(port,()=>console.log(`Server berjalan di port ${port}`));
