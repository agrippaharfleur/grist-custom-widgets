// Initialize Grist API with required columns
grist.ready({
    columns: [
      {
        name: "emails",
        title: "Email Column",
        type: "Text",
        description: "Column containing email addresses",
        optional: false
      }
    ],
    requiredAccess: 'read table'
  });
  
  // Global variables to store state
  let emailList = [];
  let removedEmails = new Set();
  let manuallyAddedEmails = new Set();
  let mappedColumns = null;
  
  // DOM Elements
  const recipientsList = document.getElementById('recipientsList');
  const recipientsCount = document.getElementById('recipientsCount');
  const removedEmailsList = document.getElementById('removedEmails');
  const removedListSection = document.getElementById('removedList');
  const manualEmailsList = document.getElementById('manualEmails');
  const manualListSection = document.getElementById('manualList');
  const replyToInput = document.getElementById('replyTo');
  const subjectInput = document.getElementById('subject');
  const emailContent = document.getElementById('emailContent');
  const newEmailInput = document.getElementById('newEmail');
  const addEmailBtn = document.getElementById('addEmail');
  const sendEmailBtn = document.getElementById('sendEmail');
  const statusMessage = document.getElementById('statusMessage');
  
  // Handle record updates from Grist
  grist.onRecords(function(records, mappings) {
    mappedColumns = grist.mapColumnNames(records[0]);
    
    if (mappedColumns) {
      // Extract email addresses from records
      const newEmailList = [...new Set(records
        .map(record => grist.mapColumnNames(record).emails)
        .filter(email => email && email.trim() !== '')
      )];
      
      // Add manually added emails to the list
      emailList = [...new Set([...newEmailList, ...manuallyAddedEmails])];
      
      updateRecipientsDisplay();
      updateRemovedEmailsDisplay();
      updateManualEmailsDisplay();
    } else {
      showError("Please map the email column in widget configuration");
    }
  });
  
  // Create recipient element
  function createRecipientElement(email, isRemoved = false) {
    const div = document.createElement('div');
    div.className = `recipient${isRemoved ? ' removed' : ''}`;
    
    div.innerHTML = `
      <span>${email}</span>
      <div class="actions">
        ${isRemoved ? 
          `<button class="btn-icon btn-success" data-action="restore" title="Restore">↩</button>` :
          `<button class="btn-icon btn-danger" data-action="remove" title="Remove">×</button>`
        }
      </div>
    `;
    
    // Add event listeners for actions
    const actionBtn = div.querySelector('[data-action]');
    actionBtn.addEventListener('click', () => {
      if (isRemoved) {
        restoreEmail(email);
      } else {
        removeEmail(email);
      }
    });
    
    return div;
  }
  
  // Update the recipients display
  function updateRecipientsDisplay() {
    recipientsList.innerHTML = '';
    
    const activeEmails = emailList.filter(email => !removedEmails.has(email) && !manuallyAddedEmails.has(email));
    activeEmails.forEach(email => {
      recipientsList.appendChild(createRecipientElement(email));
    });
    
    recipientsCount.textContent = activeEmails.length + manuallyAddedEmails.size;
  }
  
  // Update removed emails display
  function updateRemovedEmailsDisplay() {
    removedEmailsList.innerHTML = '';
    
    if (removedEmails.size > 0) {
      removedListSection.style.display = 'block';
      [...removedEmails].forEach(email => {
        removedEmailsList.appendChild(createRecipientElement(email, true));
      });
    } else {
      removedListSection.style.display = 'none';
    }
  }
  
  // Update manual emails display
  function updateManualEmailsDisplay() {
    manualEmailsList.innerHTML = '';
    
    if (manuallyAddedEmails.size > 0) {
      manualListSection.style.display = 'block';
      [...manuallyAddedEmails].forEach(email => {
        const div = document.createElement('div');
        div.className = 'manual-email';
        div.innerHTML = `
          <span>${email}<span class="tag">Manual</span></span>
          <div class="actions">
            <button class="btn-icon btn-danger" data-action="remove" title="Remove">×</button>
          </div>
        `;
        
        const removeBtn = div.querySelector('[data-action="remove"]');
        removeBtn.addEventListener('click', () => {
          manuallyAddedEmails.delete(email);
          emailList = emailList.filter(e => e !== email);
          updateManualEmailsDisplay();
          updateRecipientsDisplay();
          showSuccess(`Removed ${email} from manual recipients`);
        });
        
        manualEmailsList.appendChild(div);
      });
    } else {
      manualListSection.style.display = 'none';
    }
  }
  
  // Remove email from active list
  function removeEmail(email) {
    removedEmails.add(email);
    updateRecipientsDisplay();
    updateRemovedEmailsDisplay();
    showSuccess(`Removed ${email} from recipients`);
  }
  
  // Restore email to active list
  function restoreEmail(email) {
    removedEmails.delete(email);
    updateRecipientsDisplay();
    updateRemovedEmailsDisplay();
    showSuccess(`Restored ${email} to recipients`);
  }
  
  // Add new email manually
  function addNewEmail(email) {
    if (!isValidEmail(email)) {
      showError("Please enter a valid email address");
      return;
    }
    
    if (emailList.includes(email)) {
      if (removedEmails.has(email)) {
        restoreEmail(email);
      } else {
        showError("This email is already in the recipients list");
      }
      return;
    }
    
    manuallyAddedEmails.add(email);
    emailList.push(email);
    updateManualEmailsDisplay();
    updateRecipientsDisplay();
    newEmailInput.value = '';
    showSuccess(`Added ${email} to recipients`);
  }
  
  // Show success message
  function showSuccess(message) {
    statusMessage.className = 'status-message success';
    statusMessage.textContent = message;
    
    setTimeout(() => {
      statusMessage.className = 'status-message';
      statusMessage.textContent = '';
    }, 3000);
  }
  
  // Show error message
  function showError(message) {
    statusMessage.className = 'status-message error';
    statusMessage.textContent = message;
  }
  
  // Validate email address
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  // Event Listeners
  addEmailBtn.addEventListener('click', () => {
    const email = newEmailInput.value.trim();
    addNewEmail(email);
  });
  
  newEmailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const email = newEmailInput.value.trim();
      addNewEmail(email);
    }
  });
  
  // Handle email composition
  sendEmailBtn.addEventListener('click', function() {
    if (!mappedColumns) {
      showError("Please map the email column first");
      return;
    }
  
    const activeEmails = emailList.filter(email => !removedEmails.has(email));
    if (activeEmails.length === 0) {
      showError("No recipient emails found");
      return;
    }
  
    const replyTo = replyToInput.value.trim();
    if (!replyTo || !isValidEmail(replyTo)) {
      showError("Please enter a valid reply-to email address");
      return;
    }
  
    const subject = subjectInput.value.trim();
    if (!subject) {
      showError("Please enter an email subject");
      return;
    }
  
    const content = emailContent.value.trim();
    if (!content) {
      showError("Please enter email content");
      return;
    }
  
    // Construct mailto URL with BCC
    const mailtoUrl = `mailto:${replyTo}?bcc=${activeEmails.join(',')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;
  
    // Open default email client
    window.location.href = mailtoUrl;
    
    showSuccess("Email composer opened in your default email client");
  });