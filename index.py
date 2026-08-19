corrected_html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KUTS | Kinetic Unified Temporal Synchronization</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>

<div class="grid"></div>

<div class="wrapper">

<div class="panel">

<div class="header">

<img src="assets/logo.png" class="logo">

<div>

<h1>KUTS GATEWAY</h1>

<div class="subtitle">

Kinetic Unified Temporal Synchronization

</div>

</div>

</div>

<div class="console" id="console">

<span class="cursor">█</span>

</div>

<div class="progress">

<div class="bar" id="bar"></div>

</div>

<div class="status">

<div class="card">

<div class="label">Temporal Engine</div>

<div class="value">ONLINE</div>

</div>

<div class="card">

<div class="label">Synchronization</div>

<div class="value">ACTIVE</div>

</div>

<div class="card">

<div class="label">Distributed Registry</div>

<div class="value">VERIFIED</div>

</div>

<div class="card">

<div class="label">Secure Mesh</div>

<div class="value">CONNECTED</div>

</div>

</div>

<div class="footer">

Initializing Secure Distributed Environment...

</div>

</div>

</div>

<script>

const lines=[

"> Booting KUTS Core",

"> Loading Temporal Engine",




"> Initializing Synchronization Matrix",

"> Verifying Distributed Registry",

"> Connecting Secure Mesh",

"> Loading User Workspace",

"> Gateway Ready"

];

let i=0;

let progress=0;

const consoleBox=document.getElementById("console");

const bar=document.getElementById("bar");

function boot(){

if(i<lines.length){

consoleBox.innerHTML+=lines[i]+"<br>";

consoleBox.scrollTop=consoleBox.scrollHeight;

progress+=15;

bar.style.width=progress+"%";

i++;

setTimeout(boot,700);

}else{

bar.style.width="100%";

consoleBox.innerHTML+="<br><span style='color:#6dff98'>SYSTEM READY</span>";

setTimeout(function(){

window.location.href="dashboard.html";

/*
If your application starts somewhere else,
replace dashboard.html with:

menu.html
account.html
or your real start page.
*/

},2000);

}

}

boot();

</script>

</body>

</html>"""

with open("index.html", "w") as f:
    f.write(corrected_html)