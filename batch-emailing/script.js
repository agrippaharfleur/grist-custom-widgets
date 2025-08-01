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
            description: "Column containing default email content. Format: [Subject] Content or just Content. Subject in brackets will be auto-extracted if at the beginning. Content from the first row will be used as template.",
            optional: true
        }
    ],
    requiredAccess: 'read table'
});

// Language translations
const translations = {
    en: {
        title: "Batch Email Sender",
        subtitle: "Configure and send batch emails to multiple recipients",
        replyToLabel: "Reply-to Email Address",
        replyToPlaceholder: "Enter reply-to email address",
        recipientsLabel: "Recipients (BCC)",
        recipientsWarning: "💡 Filters must be applied on this widget's view to affect the recipient list. Please verify that the recipient count matches your expected results.",
        recipientsSelected: "recipients selected",
        removedRecipientsTitle: "Removed Recipients",
        subjectLabel: "Email Subject",
        subjectPlaceholder: "Enter email subject",
        contentLabel: "Email Content",
        contentPlaceholder: "Write your email content here...",
        additionalRecipientsLabel: "Additional Recipients",
        emailPlaceholder: "Enter email address",
        addRecipientBtn: "Add Recipient",
        manualRecipientsTitle: "Manually Added Recipients",
        composeBtn: "Compose Email",
        mapEmailError: "Please map the email column first",
        noRecipientsError: "No recipient emails found",
        invalidReplyToError: "Please enter a valid reply-to email address",
        noSubjectError: "Please enter an email subject",
        noContentError: "Please enter email content or configure a content column",
        invalidEmailError: "Please enter a valid email address",
        emailExistsError: "This email is already in the recipients list",
        emailOpened: "Email composer opened in your default email client",
        configError: "Please map the email column in widget configuration",
        removedFrom: "Removed {email} from recipients",
        restoredTo: "Restored {email} to recipients",
        addedTo: "Added {email} to recipients",
        removedFromManual: "Removed {email} from manual recipients",
        langName: "English",
        langCode: "EN",
        contentInfoText: "📝 Content auto-filled from first table row. To auto-fill subject, start content with [Subject]. You can edit them before sending.",
        contentInfoSubject: "📝 Subject and content auto-filled from first table row. Subject was extracted from [brackets] at the beginning. You can edit them before sending." 
    },
    fr: {
        title: "Envoi d'emails en lot",
        subtitle: "Configurez et envoyez des emails à plusieurs destinataires",
        replyToLabel: "Adresse de réponse",
        replyToPlaceholder: "Saisissez l'adresse de réponse",
        recipientsLabel: "Destinataires (CCI)",
        recipientsWarning: "💡 Les filtres doivent être appliqués sur la vue de ce widget pour affecter la liste des destinataires. Veuillez vérifier que le nombre de destinataires correspond à vos résultats attendus.",
        recipientsSelected: "destinataires sélectionnés",
        removedRecipientsTitle: "Destinataires supprimés",
        subjectLabel: "Objet de l'email",
        subjectPlaceholder: "Saisissez l'objet de l'email",
        contentLabel: "Contenu de l'email",
        contentPlaceholder: "Rédigez le contenu de votre email ici...",
        additionalRecipientsLabel: "Destinataires supplémentaires",
        emailPlaceholder: "Saisissez une adresse email",
        addRecipientBtn: "Ajouter destinataire",
        manualRecipientsTitle: "Destinataires ajoutés manuellement",
        composeBtn: "Composer l'email",
        mapEmailError: "Veuillez d'abord mapper la colonne email",
        noRecipientsError: "Aucune adresse email de destinataire trouvée",
        invalidReplyToError: "Veuillez saisir une adresse de réponse valide",
        noSubjectError: "Veuillez saisir un objet d'email",
        noContentError: "Veuillez saisir le contenu de l'email ou configurer une colonne de contenu",
        invalidEmailError: "Veuillez saisir une adresse email valide",
        emailExistsError: "Cette adresse email est déjà dans la liste des destinataires",
        emailOpened: "Compositeur d'email ouvert dans votre client email par défaut",
        configError: "Veuillez mapper la colonne email dans la configuration du widget",
        removedFrom: "{email} supprimé des destinataires",
        restoredTo: "{email} restauré dans les destinataires",
        addedTo: "{email} ajouté aux destinataires",
        removedFromManual: "{email} supprimé des destinataires manuels",
        langName: "Français",
        langCode: "FR",
        contentInfoText: "📝 Contenu pré-rempli depuis la première ligne du tableau. Pour pré-remplir le sujet, commencez le contenu par [Sujet]. Vous pouvez les modifier avant l'envoi.",
        contentInfoSubject: "📝 Sujet et contenu pré-remplis depuis la première ligne du tableau. Le sujet a été extrait des [crochets] au début. Vous pouvez les modifier avant l'envoi."
    }
};

const languageFlags = {
    en: "🇬🇧",
    fr: "🇫🇷"
};

let currentLang = 'en';
let isDropdownOpen = false;

function t(key, replacements = {}) {
    let text = translations[currentLang][key] || translations.en[key] || key;
    
    // Replace placeholders like {email}
    Object.keys(replacements).forEach(placeholder => {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    });
    
    return text;
}

function updateLanguage() {
    // Update header
    document.querySelector('.widget-header h2').textContent = t('title');
    document.querySelector('.widget-header p').textContent = t('subtitle');
    
    // Update form labels and placeholders
    document.querySelector('label[for="replyTo"]').textContent = t('replyToLabel');
    document.getElementById('replyTo').placeholder = t('replyToPlaceholder');
    
    document.querySelector('label[for="recipientsList"]').textContent = t('recipientsLabel');
    document.querySelector('.warning-text i').textContent = t('recipientsWarning');
    
    document.querySelector('label[for="subject"]').textContent = t('subjectLabel');
    document.getElementById('subject').placeholder = t('subjectPlaceholder');
    
    document.querySelector('label[for="emailContent"]').textContent = t('contentLabel');
    document.getElementById('emailContent').placeholder = t('contentPlaceholder');
    
    document.querySelector('label[for="newEmail"]').textContent = t('additionalRecipientsLabel');
    document.getElementById('newEmail').placeholder = t('emailPlaceholder');
    document.getElementById('addEmail').textContent = t('addRecipientBtn');
    
    document.getElementById('sendEmail').textContent = t('composeBtn');
    
    // Update dynamic content
    updateRecipientsDisplay();
    updateRemovedEmailsDisplay();
    updateManualEmailsDisplay();
    
    // Update language switcher
    updateLanguageSwitcher();
}

function updateLanguageSwitcher() {
    const currentLangElement = document.querySelector('.current-lang');
    if (currentLangElement) {
        currentLangElement.innerHTML = `
            <span>${languageFlags[currentLang]}</span>
            <span class="lang-text">${t('langCode')}</span>
        `;
    }
    
    const dropdown = document.querySelector('.lang-dropdown');
    if (dropdown) {
        dropdown.innerHTML = '';
        Object.keys(translations).forEach(lang => {
            if (lang !== currentLang) {
                const option = document.createElement('button');
                option.className = 'lang-option';
                option.innerHTML = `
                    <span>${languageFlags[lang]}</span>
                    <span>${translations[lang].langName}</span>
                `;
                option.addEventListener('click', () => {
                    switchLanguage(lang);
                    toggleDropdown(false);
                });
                dropdown.appendChild(option);
            }
        });
    }
}

function toggleDropdown(force = null) {
    const dropdown = document.querySelector('.lang-dropdown');
    if (dropdown) {
        isDropdownOpen = force !== null ? force : !isDropdownOpen;
        dropdown.classList.toggle('open', isDropdownOpen);
    }
}

function switchLanguage(lang) {
    currentLang = lang;
    updateLanguage();
    
    localStorage.setItem('batchEmailLang', lang);
}

function loadLanguagePreference() {
    const saved = localStorage.getItem('batchEmailLang');
    if (saved && translations[saved]) {
        currentLang = saved;
    }
}

// Global variables
let emailList = [];
let removedEmails = new Set();
let manuallyAddedEmails = new Set();
let mappedColumns = null;
let allRecords = [];
let currentMappings = {};

// DOM Elements (will be initialized in DOMContentLoaded)
let recipientsList, recipientsCount, removedEmailsList, removedListSection, 
    manualEmailsList, manualListSection, replyToInput, subjectInput, 
    emailContent, newEmailInput, addEmailBtn, sendEmailBtn, statusMessage;

loadLanguagePreference();

// Handle record updates from Grist
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
        showError(t('configError'));
    }
});

// Parse content to extract subject and content
function parseContentAndSubject(rawContent) {
    if (!rawContent || typeof rawContent !== 'string') {
        return { subject: null, content: rawContent || '' };
    }
    
    const trimmedContent = rawContent.trim();
    
    // Check if content starts with [subject]
    const subjectMatch = trimmedContent.match(/^\[([^\]]+)\]\s*([\s\S]*)$/);
    
    if (subjectMatch) {
        const subject = subjectMatch[1].trim();
        const content = subjectMatch[2].trim();
        return { subject, content };
    }
    
    // No subject found, return all as content
    return { subject: null, content: trimmedContent };
}

// Auto-fill content and subject from content column if available
function prefillContentFromColumn() {
    const hasContentColumn = currentMappings && currentMappings.content;
    
    if (hasContentColumn && allRecords.length > 0) {
        const firstRecord = allRecords[0];
        const mapped = grist.mapColumnNames(firstRecord);
        const columnContent = mapped.content;
        
        if (columnContent && columnContent.trim()) {
            const { subject, content } = parseContentAndSubject(columnContent);
            
            // Auto-fill subject if found and field is empty
            if (subject && subjectInput && !subjectInput.value.trim()) {
                subjectInput.value = subject;
            }
            
            // Auto-fill content if field is empty
            if (content && emailContent && !emailContent.value.trim()) {
                emailContent.value = content;
            }
            
            // Show appropriate info message
            const infoText = document.getElementById('contentInfoText');
            if (infoText) {
                if (subject) {
                    infoText.textContent = t('contentInfoSubject');
                } else {
                    infoText.textContent = t('contentInfoText');
                }
                infoText.style.display = 'block';
            }
        }
    }
}

// Get email content from textarea
function getEmailContent() {
    return emailContent ? emailContent.value.trim() : '';
}

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
    if (!recipientsList || !recipientsCount) return;
    
    recipientsList.innerHTML = '';

    const activeEmails = emailList.filter(email => !removedEmails.has(email) && !manuallyAddedEmails.has(email));
    activeEmails.forEach(email => {
        recipientsList.appendChild(createRecipientElement(email));
    });

    recipientsCount.innerHTML = `<b>${activeEmails.length + manuallyAddedEmails.size}</b> ${t('recipientsSelected')}`;
}

// Update removed emails display
function updateRemovedEmailsDisplay() {
    if (!removedEmailsList || !removedListSection) return;
    
    removedEmailsList.innerHTML = '';

    if (removedEmails.size > 0) {
        removedListSection.style.display = 'block';
        removedListSection.querySelector('h3').textContent = t('removedRecipientsTitle');
        [...removedEmails].forEach(email => {
            removedEmailsList.appendChild(createRecipientElement(email, true));
        });
    } else {
        removedListSection.style.display = 'none';
    }
}

// Update manual emails display
function updateManualEmailsDisplay() {
    if (!manualEmailsList || !manualListSection) return;
    
    manualEmailsList.innerHTML = '';

    if (manuallyAddedEmails.size > 0) {
        manualListSection.style.display = 'block';
        manualListSection.querySelector('h3').textContent = t('manualRecipientsTitle');
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
                showSuccess(t('removedFromManual', {email}));
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
    showSuccess(t('removedFrom', {email}));
}

// Restore email to active list
function restoreEmail(email) {
    removedEmails.delete(email);
    updateRecipientsDisplay();
    updateRemovedEmailsDisplay();
    showSuccess(t('restoredTo', {email}));
}

// Add new email manually
function addNewEmail(email) {
    if (!isValidEmail(email)) {
        showError(t('invalidEmailError'));
        return;
    }

    if (emailList.includes(email)) {
        if (removedEmails.has(email)) {
            restoreEmail(email);
        } else {
            showError(t('emailExistsError'));
        }
        return;
    }

    manuallyAddedEmails.add(email);
    emailList.push(email);
    updateManualEmailsDisplay();
    updateRecipientsDisplay();
    if (newEmailInput) newEmailInput.value = '';
    showSuccess(t('addedTo', {email}));
}

// Show success message
function showSuccess(message) {
    if (!statusMessage) return;
    statusMessage.className = 'status-message success';
    statusMessage.textContent = message;

    setTimeout(() => {
        statusMessage.className = 'status-message';
        statusMessage.textContent = '';
    }, 3000);
}

// Show error message
function showError(message) {
    if (!statusMessage) return;
    statusMessage.className = 'status-message error';
    statusMessage.textContent = message;
}

// Validate email address
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize DOM elements
    recipientsList = document.getElementById('recipientsList');
    recipientsCount = document.getElementById('recipientsCount');
    removedEmailsList = document.getElementById('removedEmails');
    removedListSection = document.getElementById('removedList');
    manualEmailsList = document.getElementById('manualEmails');
    manualListSection = document.getElementById('manualList');
    replyToInput = document.getElementById('replyTo');
    subjectInput = document.getElementById('subject');
    emailContent = document.getElementById('emailContent');
    newEmailInput = document.getElementById('newEmail');
    addEmailBtn = document.getElementById('addEmail');
    sendEmailBtn = document.getElementById('sendEmail');
    statusMessage = document.getElementById('statusMessage');
    
    // Add event listeners
    if (addEmailBtn) {
        addEmailBtn.addEventListener('click', () => {
            const email = newEmailInput ? newEmailInput.value.trim() : '';
            addNewEmail(email);
        });
    }

    if (newEmailInput) {
        newEmailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const email = newEmailInput.value.trim();
                addNewEmail(email);
            }
        });
    }

    if (sendEmailBtn) {
        sendEmailBtn.addEventListener('click', function() {
            if (!mappedColumns) {
                showError(t('mapEmailError'));
                return;
            }

            const activeEmails = emailList.filter(email => !removedEmails.has(email));
            if (activeEmails.length === 0) {
                showError(t('noRecipientsError'));
                return;
            }

            const replyTo = replyToInput ? replyToInput.value.trim() : '';
            if (!replyTo || !isValidEmail(replyTo)) {
                showError(t('invalidReplyToError'));
                return;
            }

            const subject = subjectInput ? subjectInput.value.trim() : '';
            if (!subject) {
                showError(t('noSubjectError'));
                return;
            }

            const content = getEmailContent();
            if (!content) {
                showError(t('noContentError'));
                return;
            }

            const mailtoUrl = `mailto:${replyTo}?bcc=${activeEmails.join(',')}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(content)}`;

            if (window.parent && window.parent !== window) {
                window.parent.open(mailtoUrl, '_blank');
            } else {
                window.open(mailtoUrl, '_blank');
            }

            showSuccess(t('emailOpened'));
        });
    }
    
    // Initialize language
    updateLanguage();
    
    // Language switcher functionality
    const currentLangElement = document.querySelector('.current-lang');
    if (currentLangElement) {
        currentLangElement.addEventListener('click', () => {
            toggleDropdown();
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        const switcher = document.querySelector('.language-switcher');
        if (switcher && !switcher.contains(e.target)) {
            toggleDropdown(false);
        }
    });
});