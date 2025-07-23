grist.ready({
    columns: [
        {
            name: "emails",
            title: "Email Column",
            type: "Text",
            description: "Column containing email addresses",
            optional: false
        },
        {
            name: "content",
            title: "Content Column",
            type: "Text",
            description: "Column containing email content. If empty, manual content will be used.",
            optional: true
        }
    ],
    requiredAccess: 'read table'
});

let emailList = [];
let removedEmails = new Set();
let manuallyAddedEmails = new Set();
let mappedColumns = null;
let allRecords = [];
let currentMappings = {};

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

grist.onRecords(function(records, mappings) {
    allRecords = records || [];
    currentMappings = mappings || {};
    mappedColumns = allRecords.length > 0 ? grist.mapColumnNames(allRecords[0]) : null;

    if (mappedColumns) {
        const newEmailList = [...new Set(allRecords
            .map(record => grist.mapColumnNames(record).emails)
            .filter(email => email && email.trim() !== '')
            .flatMap(email => email.split(',').map(e => e.trim()).filter(e => e !== ''))
        )];

        emailList = [...new Set([...newEmailList, ...manuallyAddedEmails])];

        updateRecipientsDisplay();
        updateRemovedEmailsDisplay();
        updateManualEmailsDisplay();
        prefillContentFromColumn();
    } else {
        showError("Please map the email column in widget configuration");
    }
});

function prefillContentFromColumn() {
    const hasContentColumn = currentMappings && currentMappings.content;
    
    if (hasContentColumn && allRecords.length > 0) {
        const firstRecord = allRecords[0];
        const mapped = grist.mapColumnNames(firstRecord);
        const columnContent = mapped.content;
        
        if (columnContent && columnContent.trim()) {
            if (!emailContent.value.trim()) {
                emailContent.value = columnContent;
            }
        }
    }
}

function getEmailContent() {
    return emailContent.value.trim();
}

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

function updateRecipientsDisplay() {
    recipientsList.innerHTML = '';

    const activeEmails = emailList.filter(email => !removedEmails.has(email) && !manuallyAddedEmails.has(email));
    activeEmails.forEach(email => {
        recipientsList.appendChild(createRecipientElement(email));
    });

    recipientsCount.textContent = activeEmails.length + manuallyAddedEmails.size;
}

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

function removeEmail(email) {
    removedEmails.add(email);
    updateRecipientsDisplay();
    updateRemovedEmailsDisplay();
    showSuccess(`Removed ${email} from recipients`);
}

function restoreEmail(email) {
    removedEmails.delete(email);
    updateRecipientsDisplay();
    updateRemovedEmailsDisplay();
    showSuccess(`Restored ${email} to recipients`);
}

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

function showSuccess(message) {
    statusMessage.className = 'status-message success';
    statusMessage.textContent = message;

    setTimeout(() => {
        statusMessage.className = 'status-message';
        statusMessage.textContent = '';
    }, 3000);
}

function showError(message) {
    statusMessage.className = 'status-message error';
    statusMessage.textContent = message;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

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

    const content = getEmailContent();
    if (!content) {
        showError("Please enter email content or configure a content column");
        return;
    }

    const mailtoUrl = `mailto:${replyTo}?bcc=${activeEmails.join(',')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;

    window.location.href = mailtoUrl;

    showSuccess("Email composer opened in your default email client");
});
