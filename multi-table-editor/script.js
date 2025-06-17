let tablesSchema = {};
let currentData = {};
let currentTable = null;
let editingRecord = null;
let isLoading = false;

grist.ready({
    requiredAccess: 'full',
    allowSelectBy: true
});

const statusMessage = document.getElementById('statusMessage');
const navTabs = document.getElementById('navTabs');
const dynamicContent = document.getElementById('dynamicContent');
const initialState = document.getElementById('initialState');
const tableCount = document.getElementById('tableCount');
const refreshSchemaBtn = document.getElementById('refreshSchema');

const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalForm = document.getElementById('modalForm');
const modalSave = document.getElementById('modalSave');

function showMessage(message, type = 'success') {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    setTimeout(() => {
        statusMessage.className = 'status-message';
    }, 5000);
}

function showError(message) {
    showMessage(message, 'error');
    console.error(message);
}

function showWarning(message) {
    showMessage(message, 'warning');
}

async function loadTablesSchema() {
    if (isLoading) return;
    isLoading = true;
    
    try {
        showMessage('Chargement de la structure des tables...', 'warning');
        
        const [tablesData, columnsData] = await Promise.all([
            grist.docApi.fetchTable("_grist_Tables"),
            grist.docApi.fetchTable("_grist_Tables_column")
        ]);

        console.log('Tables data:', tablesData);
        console.log('Columns data:', columnsData);

        const schema = {};
        
        for (let i = 0; i < tablesData.id.length; i++) {
            const tableId = tablesData.tableId[i];
            const tableName = tablesData.tableId[i];
            
            if (tableId.startsWith('_grist_') || tableId.startsWith('GristDocTutorial')) {
                continue;
            }
            
            schema[tableId] = {
                id: tablesData.id[i],
                name: tableName,
                fields: {}
            };
        }

        for (let i = 0; i < columnsData.id.length; i++) {
            const tableRef = columnsData.parentId[i];
            const colId = columnsData.colId[i];
            const label = columnsData.label[i];
            const type = columnsData.type[i];
            const isFormula = columnsData.isFormula[i];
            
            const tableEntry = Object.values(schema).find(table => table.id === tableRef);
            if (!tableEntry) continue;
            
            if (type === 'ManualSortPos' || colId.startsWith('gristHelper')) {
                continue;
            }
            
            tableEntry.fields[colId] = {
                label: label || colId,
                type: type,
                isFormula: isFormula
            };
        }

        tablesSchema = schema;
        
        console.log('Final schema:', tablesSchema);
        
        updateTableCount();
        generateTabsUI();
        hideInitialState();
        
        const firstTable = Object.keys(tablesSchema)[0];
        if (firstTable) {
            switchTab(firstTable);
        }
        
        showMessage(`Structure chargée : ${Object.keys(tablesSchema).length} tables trouvées`, 'success');
        
    } catch (error) {
        console.error('Error loading schema:', error);
        showError(`Erreur lors du chargement du schéma: ${error.message}`);
    } finally {
        isLoading = false;
    }
}

function updateTableCount() {
    const count = Object.keys(tablesSchema).length;
    tableCount.textContent = `${count} table${count !== 1 ? 's' : ''} disponible${count !== 1 ? 's' : ''}`;
}

function generateTabsUI() {
    if (Object.keys(tablesSchema).length === 0) {
        navTabs.innerHTML = `
            <div style="padding: 12px 16px; color: var(--color-fg-muted); font-style: italic;">
                Aucune table éditable trouvée
            </div>
        `;
        return;
    }

    let tabsHTML = '';
    Object.keys(tablesSchema).forEach((tableId, index) => {
        const table = tablesSchema[tableId];
        tabsHTML += `
            <button class="nav-tab ${index === 0 ? 'active' : ''}" data-table="${tableId}">
                ${table.name}
            </button>
        `;
    });

    navTabs.innerHTML = tabsHTML;

    navTabs.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tableId = tab.dataset.table;
            switchTab(tableId);
        });
    });
}

function hideInitialState() {
    initialState.style.display = 'none';
    dynamicContent.style.display = 'block';
}

async function switchTab(tableId) {
    if (!tablesSchema[tableId] || currentTable === tableId) return;

    navTabs.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.table === tableId);
    });

    currentTable = tableId;
    
    await generateTableContent(tableId);
    
    await loadTableData(tableId);
}

async function generateTableContent(tableId) {
    const table = tablesSchema[tableId];
    const fields = table.fields;
    const editableFields = Object.keys(fields).filter(fieldId => !fields[fieldId].isFormula);
    const isReadOnly = editableFields.length === 0;

    const contentHTML = `
        <div class="tab-content active" id="tab-${tableId}">
            <div class="table-info">
                <div class="table-stats">
                    <span><strong>Colonnes:</strong> ${Object.keys(fields).length}</span>
                    <span><strong>Colonnes éditables:</strong> ${editableFields.length}</span>
                    <span id="recordCount-${tableId}"><strong>Lignes:</strong> Chargement...</span>
                </div>
                ${isReadOnly ? '<p style="margin: 8px 0 0 0; color: var(--color-warning); font-style: italic;">Table en lecture seule - Contient uniquement des colonnes de formules</p>' : ''}
            </div>

            <div class="actions">
                ${!isReadOnly ? `
                    <button id="add-${tableId}" class="btn btn-primary">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
                        </svg>
                        Ajouter un enregistrement
                    </button>
                ` : `
                    <div class="status-message warning" style="display: block;">
                        Cette table ne contient que des colonnes de formules et est en lecture seule.
                    </div>
                `}
                <button id="refresh-${tableId}" class="btn btn-secondary">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                    </svg>
                    Actualiser
                </button>
            </div>

            <div id="data-${tableId}">
                <div class="empty-state">
                    <div class="loading"></div>
                    <h3>Chargement des données</h3>
                    <p>Récupération des enregistrements...</p>
                </div>
            </div>
        </div>
    `;

    const existingContent = document.getElementById(`tab-${tableId}`);
    if (existingContent) {
        existingContent.remove();
    }

    dynamicContent.innerHTML = contentHTML;

    if (!isReadOnly) {
        document.getElementById(`add-${tableId}`).addEventListener('click', () => openModal(tableId));
    }
    
    document.getElementById(`refresh-${tableId}`).addEventListener('click', () => loadTableData(tableId));
}

function generateFormFields(tableId, editableFieldsOnly) {
    let fieldsHTML = '';
    const table = tablesSchema[tableId];
    const fields = table.fields;
    
    const fieldsToShow = editableFieldsOnly || Object.keys(fields).filter(fieldId => !fields[fieldId].isFormula);
    
    fieldsToShow.forEach(fieldId => {
        const field = fields[fieldId];
        const fieldType = field.type;
        const label = field.label;
        
        fieldsHTML += `
            <div class="form-group">
                <label for="${tableId}-${fieldId}">
                    ${label}
                    <span class="field-type">${fieldType}${field.isFormula ? ' (Formule)' : ''}</span>
                </label>
                ${generateFieldInput(tableId, fieldId, fieldType)}
            </div>
        `;
    });
    
    return fieldsHTML;
}

function generateFieldInput(tableId, fieldId, fieldType) {
    const inputId = `${tableId}-${fieldId}`;
    
    switch (fieldType) {
        case 'Bool':
            return `
                <label class="toggle-switch">
                    <input type="checkbox" id="${inputId}">
                    <span class="slider"></span>
                </label>
            `;
        case 'Int':
        case 'Numeric':
            return `<input type="number" id="${inputId}" step="${fieldType === 'Int' ? '1' : 'any'}">`;
        case 'Date':
            return `<input type="date" id="${inputId}">`;
        case 'DateTime':
            return `<input type="datetime-local" id="${inputId}">`;
        default:
            if (fieldType.startsWith('Ref:')) {
                const referencedTable = fieldType.substring(4); 
                return `
                    <select id="${inputId}" data-ref-table="${referencedTable}">
                        <option value="">-- Sélectionner --</option>
                        <option value="loading">Chargement...</option>
                    </select>
                `;
            } else if (fieldType.startsWith('RefList:')) {
                const referencedTable = fieldType.substring(8); 
                return `
                    <select id="${inputId}" data-ref-table="${referencedTable}" multiple>
                        <option value="loading">Chargement...</option>
                    </select>
                `;
            }
            else if (fieldId.toLowerCase().includes('email')) {
                return `<input type="email" id="${inputId}">`;
            } else if (fieldId.toLowerCase().includes('url')) {
                return `<input type="url" id="${inputId}">`;
            } else if (fieldId.toLowerCase().includes('comment') || fieldId.toLowerCase().includes('description') || fieldId.toLowerCase().includes('adresse')) {
                return `<textarea id="${inputId}"></textarea>`;
            } else {
                return `<input type="text" id="${inputId}">`;
            }
    }
}

async function loadReferenceData(tableId, editableFields) {
    const table = tablesSchema[tableId];
    
    for (const fieldId of editableFields) {
        const field = table.fields[fieldId];
        const fieldType = field.type;
        
        if (fieldType.startsWith('Ref:') || fieldType.startsWith('RefList:')) {
            const isRefList = fieldType.startsWith('RefList:');
            const referencedTable = isRefList ? fieldType.substring(8) : fieldType.substring(4);
            
            try {
                const refData = await grist.docApi.fetchTable(referencedTable);
                const select = document.getElementById(`${tableId}-${fieldId}`);
                
                if (!select) continue;
                
                select.innerHTML = isRefList ? '' : '<option value="">-- Sélectionner --</option>';
                
                if (refData && refData.id && refData.id.length > 0) {
                    for (let i = 0; i < refData.id.length; i++) {
                        const option = document.createElement('option');
                        option.value = refData.id[i];
                        
                        let displayValue = refData.id[i];
                        
                        const possibleDisplayFields = ['name', 'nom', 'title', 'titre', 'label', 'description'];
                        let foundDisplay = false;
                        
                        for (const displayField of possibleDisplayFields) {
                            if (refData[displayField] && refData[displayField][i]) {
                                displayValue = refData[displayField][i];
                                foundDisplay = true;
                                break;
                            }
                        }
                        
                        if (!foundDisplay) {
                            const firstDataField = Object.keys(refData).find(key => 
                                key !== 'id' && 
                                key !== 'manualSort' && 
                                !key.startsWith('gristHelper') &&
                                refData[key] && 
                                refData[key][i] !== undefined &&
                                refData[key][i] !== null
                            );
                            
                            if (firstDataField && refData[firstDataField][i]) {
                                displayValue = refData[firstDataField][i];
                            }
                        }
                        
                        option.textContent = `${displayValue} (ID: ${refData.id[i]})`;
                        select.appendChild(option);
                    }
                }
            } catch (error) {
                console.error(`Error loading reference data for ${referencedTable}:`, error);
                const select = document.getElementById(`${tableId}-${fieldId}`);
                if (select) {
                    select.innerHTML = '<option value="">Erreur de chargement</option>';
                }
            }
        }
    }
}

async function loadTableData(tableId) {
    try {
        const response = await grist.docApi.fetchTable(tableId);
        console.log(`Data for ${tableId}:`, response);
        
        let records = [];
        if (response && response.id && response.id.length > 0) {
            for (let i = 0; i < response.id.length; i++) {
                const record = { id: response.id[i] };
                
                Object.keys(response).forEach(key => {
                    if (key !== 'id' && response[key] && response[key][i] !== undefined) {
                        record[key] = response[key][i];
                    }
                });
                
                records.push(record);
            }
        }
        
        currentData[tableId] = records;
        renderTableData(tableId);
        
        const countElement = document.getElementById(`recordCount-${tableId}`);
        if (countElement) {
            countElement.innerHTML = `<strong>Lignes:</strong> ${records.length}`;
        }
        
    } catch (error) {
        console.error(`Error loading data for ${tableId}:`, error);
        showError(`Erreur lors du chargement des données de ${tableId}: ${error.message}`);
        
        const dataContainer = document.getElementById(`data-${tableId}`);
        if (dataContainer) {
            dataContainer.innerHTML = `
                <div class="empty-state">
                    <h3>Erreur de chargement</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }
}

function renderTableData(tableId) {
    const container = document.getElementById(`data-${tableId}`);
    const data = currentData[tableId] || [];
    const table = tablesSchema[tableId];

    if (!data || data.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg viewBox="0 0 16 16" fill="currentColor" style="width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.5;">
                    <path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z"/>
                    <path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
                </svg>
                <h3>Aucune donnée</h3>
                <p>Cette table ne contient aucun enregistrement</p>
            </div>
        `;
        return;
    }

    const fields = Object.keys(table.fields);
    const editableFields = fields.filter(fieldId => !table.fields[fieldId].isFormula);
    const hasEditableFields = editableFields.length > 0;
    
    let html = `
        <div style="overflow-x: auto;">
            <table class="data-table">
                <thead>
                    <tr>
                        ${fields.map(field => {
                            const fieldInfo = table.fields[field];
                            return `<th>${fieldInfo.label} <span class="field-type">${fieldInfo.type}${fieldInfo.isFormula ? ' (F)' : ''}</span></th>`;
                        }).join('')}
                        ${hasEditableFields ? '<th style="width: 80px;">Actions</th>' : ''}
                    </tr>
                </thead>
                <tbody>
    `;

    data.forEach(record => {
        html += `<tr data-record-id="${record.id}">`;
        
        fields.forEach(field => {
            let value = record[field];
            const fieldType = table.fields[field].type;
            
            if (fieldType === 'Bool') {
                value = value ? '✓' : '✗';
            } else if (fieldType === 'Date' && value) {
                value = new Date(value * 1000).toLocaleDateString('fr-FR');
            } else if (fieldType === 'DateTime' && value) {
                value = new Date(value * 1000).toLocaleString('fr-FR');
            } else if (fieldType.startsWith('Ref:') && value) {
                value = `Ref ID: ${value}`;
            } else if (fieldType.startsWith('RefList:') && Array.isArray(value)) {
                value = `Refs: [${value.join(', ')}]`;
            } else if (value === null || value === undefined) {
                value = '';
            } else if (typeof value === 'string' && value.length > 50) {
                value = `<span class="cell-value truncated" title="${escapeHtml(value)}">${escapeHtml(value.substring(0, 50))}...</span>`;
            } else {
                value = escapeHtml(String(value));
            }
            
            html += `<td>${value}</td>`;
        });
        
        if (hasEditableFields) {
            html += `
                <td>
                    <div style="display: flex; gap: 4px;">
                        <button class="btn btn-secondary" onclick="editRecord('${tableId}', ${record.id})" style="padding: 6px; font-size: 12px;" title="Modifier" aria-label="Modifier l'enregistrement">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708L14.5 5.207l-8 8A.5.5 0 0 1 6.146 13.5L6 13.293V10.5a.5.5 0 0 1 .146-.354l8-8zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5z"/>
                                <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642-2.057 6.45 6.45 0 0 0-1.37 1.02l-.17-.17a1.5 1.5 0 0 1 2.12-2.121z"/>
                            </svg>
                        </button>
                        <button class="btn btn-danger" onclick="deleteRecord('${tableId}', ${record.id})" style="padding: 6px; font-size: 12px;" title="Supprimer" aria-label="Supprimer l'enregistrement">
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>`;
        } else {
            html += '</tr>';
        }
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

function openModal(tableId, record = null) {
    const table = tablesSchema[tableId];
    const editableFields = Object.keys(table.fields).filter(fieldId => !table.fields[fieldId].isFormula);
    
    modalTitle.textContent = record ? `Modifier - ${table.name}` : `Ajouter - ${table.name}`;
    
    modalForm.innerHTML = generateFormFields(tableId, editableFields);
    
    editingRecord = record ? { tableId, recordId: record.id, record } : { tableId, recordId: null, record: null };
    
    loadReferenceData(tableId, editableFields);
    
    if (record) {
        setTimeout(() => populateModalForm(tableId, record), 200);
    } else {
        clearModalForm(tableId);
    }
    
    modalOverlay.classList.add('show');
    
    const firstInput = modalForm.querySelector('input:not([type="checkbox"]), textarea, select');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 300);
    }
}

function closeModal() {
    modalOverlay.classList.remove('show');
    editingRecord = null;
    modalForm.innerHTML = '';
}

function populateModalForm(tableId, record) {
    const table = tablesSchema[tableId];
    
    Object.keys(table.fields).forEach(fieldId => {
        if (table.fields[fieldId].isFormula) return; 
        
        const input = document.getElementById(`${tableId}-${fieldId}`);
        if (!input) return;
        
        const value = record[fieldId];
        const fieldType = table.fields[fieldId].type;
        
        if (fieldType === 'Bool') {
            input.checked = !!value;
        } else if (fieldType === 'Date' && value) {
            input.value = new Date(value * 1000).toISOString().split('T')[0];
        } else if (fieldType === 'DateTime' && value) {
            input.value = new Date(value * 1000).toISOString().slice(0, 16);
        } else if (fieldType.startsWith('Ref:') || fieldType.startsWith('RefList:')) {
            if (fieldType.startsWith('RefList:') && Array.isArray(value)) {
                for (const option of input.options) {
                    option.selected = value.includes(parseInt(option.value));
                }
            } else if (fieldType.startsWith('Ref:') && value) {
                input.value = value;
            }
        } else {
            input.value = value || '';
        }
    });
}

function clearModalForm(tableId) {
    const table = tablesSchema[tableId];
    
    Object.keys(table.fields).forEach(fieldId => {
        if (table.fields[fieldId].isFormula) return; 
        
        const input = document.getElementById(`${tableId}-${fieldId}`);
        if (!input) return;
        
        const fieldType = table.fields[fieldId].type;
        
        if (fieldType === 'Bool') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
}

function getModalFormData(tableId) {
    const table = tablesSchema[tableId];
    const formData = {};
    
    Object.keys(table.fields).forEach(fieldId => {
        if (table.fields[fieldId].isFormula) return; 
        
        const input = document.getElementById(`${tableId}-${fieldId}`);
        if (!input) return;
        
        const fieldType = table.fields[fieldId].type;
        let value = null;
        
        if (fieldType === 'Bool') {
            value = input.checked;
        } else if (fieldType === 'Int' && input.value) {
            value = parseInt(input.value, 10);
            if (isNaN(value)) value = null;
        } else if (fieldType === 'Numeric' && input.value) {
            value = parseFloat(input.value);
            if (isNaN(value)) value = null;
        } else if (fieldType === 'Date' && input.value) {
            value = Math.floor(new Date(input.value).getTime() / 1000);
        } else if (fieldType === 'DateTime' && input.value) {
            value = Math.floor(new Date(input.value).getTime() / 1000);
        } else if (fieldType.startsWith('Ref:')) {
            if (input.value && input.value !== '') {
                value = parseInt(input.value, 10);
                if (isNaN(value)) value = null;
            }
        } else if (fieldType.startsWith('RefList:')) {
            const selectedValues = Array.from(input.selectedOptions).map(opt => parseInt(opt.value, 10));
            if (selectedValues.length > 0 && !selectedValues.some(isNaN)) {
                value = selectedValues;
            }
        } else if (input.value && input.value.trim()) {
            value = input.value.trim();
        }
        
        if (value !== null) {
            formData[fieldId] = value;
        }
    });
    
    return formData;
}

async function saveModalRecord() {
    if (!editingRecord) return;
    
    const tableId = editingRecord.tableId;
    const formData = getModalFormData(tableId);
    
    try {
        modalSave.disabled = true;
        modalSave.innerHTML = '<div class="loading"></div> Sauvegarde...';
        
        if (editingRecord.recordId) {
            await grist.docApi.applyUserActions([
                ['UpdateRecord', tableId, editingRecord.recordId, formData]
            ]);
            showMessage('Enregistrement modifié avec succès');
        } else {
            await grist.docApi.applyUserActions([
                ['AddRecord', tableId, null, formData]
            ]);
            showMessage('Enregistrement ajouté avec succès');
        }

        closeModal();
        await loadTableData(tableId);
    } catch (error) {
        console.error('Error saving record:', error);
        showError(`Erreur lors de la sauvegarde: ${error.message}`);
    } finally {
        modalSave.disabled = false;
        modalSave.innerHTML = 'Sauvegarder';
    }
}

window.editRecord = function(tableId, recordId) {
    const data = currentData[tableId];
    const record = data?.find(r => r.id === recordId);
    
    if (!record) {
        showError('Enregistrement non trouvé');
        return;
    }

    openModal(tableId, record);
};

window.deleteRecord = async function(tableId, recordId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) {
        return;
    }

    try {
        await grist.docApi.applyUserActions([
            ['RemoveRecord', tableId, recordId]
        ]);
        showMessage('Enregistrement supprimé avec succès');
        await loadTableData(tableId);
    } catch (error) {
        console.error('Error deleting record:', error);
        showError(`Erreur lors de la suppression: ${error.message}`);
    }
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

refreshSchemaBtn.addEventListener('click', () => {
    loadTablesSchema();
});

modalSave.addEventListener('click', saveModalRecord);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('show')) {
        closeModal();
    }
});

loadTablesSchema();

window.closeModal = closeModal;