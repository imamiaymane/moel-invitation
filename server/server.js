import express from "express"
import fetch from "node-fetch"
import cors from "cors"

const app = express()

app.use(cors())
app.use(express.json())

const RESEND_KEY = "re_A97s7Ln3_GKhbtySUGDtTfPq5sYmcAw3a"

app.post("/send-email", async (req,res)=>{

const {name,email} = req.body

console.log("Sending email to:", email)

try{

const response = await fetch("https://api.resend.com/emails",{
method:"POST",
headers:{
"Authorization":`Bearer ${RESEND_KEY}`,
"Content-Type":"application/json"
},
body:JSON.stringify({

from:"MOEL <info@moel.de>",
to:[email],
subject:"Ihre Einladung zur MOEL Eröffnung",

html:`

<h2>Hallo ${name},</h2>

<p>Ihre Teilnahme zur Eröffnung von <b>MOEL</b> wurde bestätigt.</p>

<p>Wir freuen uns, Sie am <b>21. März 2026</b> begrüßen zu dürfen.</p>

<img src="https://rdnauhyhjiefgitgddoa.supabase.co/storage/v1/object/public/invitations/invitation.png" width="400"/>

<p>
Eckenheimer Landstraße 48<br>
60318 Frankfurt am Main
</p>

`

})
})

const result = await response.text()

console.log("Resend response:", result)

res.json({success:true})

}catch(err){

console.log("Server error:", err)

res.json({success:false})

}

})

app.listen(3000,()=>{
console.log("Email server running on port 3000")
})