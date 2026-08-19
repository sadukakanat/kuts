function broadcastMasterDirective(event) {
    event.preventDefault();
    const directiveText = document.getElementById('master-directive-input').value.trim();
    if (!directiveText) return;

    const timestamp = generateKUTSTimestamp("(+00)");
    
    // Push to local mesh broadcast stack
    let directives = JSON.parse(localStorage.getItem('kuts_master_directives') || '[]');
    directives.unshift({ timestamp, source: "THRINC000-PINALEAF", message: directiveText });
    localStorage.setItem('kuts_master_directives', JSON.stringify(directives));

    alert("Master Directive successfully broadcasted across localized mesh nodes.");
    document.getElementById('master-directive-input').value = '';
}