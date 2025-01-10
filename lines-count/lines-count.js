grist.ready({ requiredAccess: 'read table' });

// Fetch all rows and count them
grist.onRecords(records => {
    const totalElement = document.getElementById('total');
    if (records && records.length >= 0) {
        totalElement.textContent = records.length;
    } else {
        totalElement.textContent = "Data not available";
    }
});