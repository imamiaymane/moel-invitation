import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = "https://rdnauhyhjiefgitgddoa.supabase.co"
const supabaseKey = "YOUR_SUPABASE_PUBLIC_KEY"

const supabase = createClient(supabaseUrl, supabaseKey)

const form = document.getElementById("inviteForm")

form.addEventListener("submit", async (e) => {

e.preventDefault()

const name = document.getElementById("name").value
const email = document.getElementById("email").value
const phone = document.getElementById("phone").value

/* Save guest in Supabase */

const { error } = await supabase
.from("guests")
.insert([
{
name:name,
email:email,
phone:phone
}
])

if(error){

alert("Fehler beim Speichern.")
console.log(error)
return

}

/* Send email */

try{

const response = await fetch("/api/send-email",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
name:name,
email:email
})
})

const result = await response.json()

console.log("Email result:", result)

}catch(err){

console.log("Email error:", err)

}

/* Show success message */

document.getElementById("inviteForm").style.display="none"
document.getElementById("title").style.display="none"
document.getElementById("subtitle").style.display="none"
document.getElementById("successMessage").classList.add("show")

})