grist.ready({ 
    requiredAccess: 'read table',
    height: 'auto',
  });
  
  grist.onRecords(function(records) {
    const totalRows = records.length;
    const formattedCount = new Intl.NumberFormat('en-US', {
      notation: totalRows > 9999 ? 'compact' : 'standard',
      maximumFractionDigits: 1
    }).format(totalRows);
    
    document.getElementById('rowCount').innerText = formattedCount;
  });