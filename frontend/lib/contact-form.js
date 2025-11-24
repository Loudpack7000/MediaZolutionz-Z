// Contact Form JavaScript

const API_BASE = 'http://localhost:3000/api/v1';
let fieldDefinitions = [];

// Load field definitions on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadFieldDefinitions();
    renderCustomFields();
    setupFormHandler();
});

// Load field definitions
async function loadFieldDefinitions() {
    try {
        const response = await fetch(`${API_BASE}/contact-fields/`);
        if (!response.ok) throw new Error('Failed to load field definitions');
        
        fieldDefinitions = await response.json();
    } catch (error) {
        console.error('Error loading field definitions:', error);
    }
}

// Render custom fields grouped by section
function renderCustomFields() {
    const container = document.getElementById('customFieldsContainer');
    if (fieldDefinitions.length === 0) return;
    
    // Group fields by section
    const sections = {
        basic: [],
        contact_details: [],
        custom: [],
        industry_specific: []
    };
    
    fieldDefinitions.forEach(field => {
        if (sections[field.section]) {
            sections[field.section].push(field);
        } else {
            sections.custom.push(field);
        }
    });
    
    // Render sections
    Object.keys(sections).forEach(sectionKey => {
        const sectionFields = sections[sectionKey];
        if (sectionFields.length === 0) return;
        
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'form-section';
        
        const sectionTitle = formatSectionTitle(sectionKey);
        sectionDiv.innerHTML = `
            <h2 class="section-title">
                <i class="fas fa-${getSectionIcon(sectionKey)}"></i>
                ${sectionTitle}
            </h2>
            <div class="section-fields" data-section="${sectionKey}"></div>
        `;
        
        const fieldsContainer = sectionDiv.querySelector('.section-fields');
        
        sectionFields.forEach(field => {
            const fieldElement = createFieldElement(field);
            fieldsContainer.appendChild(fieldElement);
        });
        
        container.appendChild(sectionDiv);
    });
}

// Format section title
function formatSectionTitle(section) {
    const titles = {
        basic: 'Basic Information',
        contact_details: 'Contact Details',
        custom: 'Custom Fields',
        industry_specific: 'Industry Specific'
    };
    return titles[section] || section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Get section icon
function getSectionIcon(section) {
    const icons = {
        basic: 'user',
        contact_details: 'address-card',
        custom: 'cog',
        industry_specific: 'industry'
    };
    return icons[section] || 'tag';
}

// Create field element based on field type
function createFieldElement(field) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'form-group';
    groupDiv.dataset.fieldKey = field.field_key;
    
    const label = document.createElement('label');
    label.htmlFor = `field_${field.field_key}`;
    label.innerHTML = `${field.name}${field.is_required ? ' <span class="required">*</span>' : ''}`;
    
    let inputElement;
    
    switch (field.field_type) {
        case 'textarea':
            inputElement = document.createElement('textarea');
            inputElement.rows = 4;
            break;
        case 'dropdown':
            inputElement = document.createElement('select');
            if (field.options && Array.isArray(field.options)) {
                inputElement.innerHTML = '<option value="">Select...</option>' +
                    field.options.map(opt => `<option value="${escapeHtml(opt)}">${escapeHtml(opt)}</option>`).join('');
            }
            break;
        case 'multiselect':
            groupDiv.className += ' checkbox-group-container';
            const checkboxGroup = document.createElement('div');
            checkboxGroup.className = 'checkbox-group';
            if (field.options && Array.isArray(field.options)) {
                field.options.forEach(option => {
                    const checkboxItem = document.createElement('div');
                    checkboxItem.className = 'checkbox-item';
                    checkboxItem.innerHTML = `
                        <input type="checkbox" id="field_${field.field_key}_${option}" 
                               name="${field.field_key}[]" value="${escapeHtml(option)}">
                        <label for="field_${field.field_key}_${option}">${escapeHtml(option)}</label>
                    `;
                    checkboxGroup.appendChild(checkboxItem);
                });
            }
            groupDiv.appendChild(label);
            groupDiv.appendChild(checkboxGroup);
            if (field.help_text) {
                const helpText = document.createElement('small');
                helpText.className = 'form-hint';
                helpText.textContent = field.help_text;
                groupDiv.appendChild(helpText);
            }
            return groupDiv;
        case 'boolean':
            groupDiv.className += ' checkbox-container';
            const checkbox = document.createElement('div');
            checkbox.className = 'checkbox-item';
            checkbox.innerHTML = `
                <input type="checkbox" id="field_${field.field_key}" name="${field.field_key}">
                <label for="field_${field.field_key}">${field.name}${field.is_required ? ' <span class="required">*</span>' : ''}</label>
            `;
            groupDiv.appendChild(checkbox);
            if (field.help_text) {
                const helpText = document.createElement('small');
                helpText.className = 'form-hint';
                helpText.textContent = field.help_text;
                groupDiv.appendChild(helpText);
            }
            return groupDiv;
        default:
            inputElement = document.createElement('input');
            inputElement.type = getInputType(field.field_type);
    }
    
    inputElement.id = `field_${field.field_key}`;
    inputElement.name = field.field_key;
    if (field.placeholder) inputElement.placeholder = field.placeholder;
    if (field.is_required) inputElement.required = true;
    
    groupDiv.appendChild(label);
    groupDiv.appendChild(inputElement);
    
    if (field.help_text) {
        const helpText = document.createElement('small');
        helpText.className = 'form-hint';
        helpText.textContent = field.help_text;
        groupDiv.appendChild(helpText);
    }
    
    return groupDiv;
}

// Get input type based on field type
function getInputType(fieldType) {
    const typeMap = {
        text: 'text',
        number: 'number',
        date: 'date',
        datetime: 'datetime-local',
        email: 'email',
        phone: 'tel',
        url: 'url'
    };
    return typeMap[fieldType] || 'text';
}

// Setup form handler
function setupFormHandler() {
    document.getElementById('contactForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            first_name: document.getElementById('firstName').value,
            last_name: document.getElementById('lastName').value,
            email: document.getElementById('email').value || null,
            phone: document.getElementById('phone').value || null,
            company: document.getElementById('company').value || null,
            custom_fields: {}
        };
        
        // Collect custom fields
        fieldDefinitions.forEach(field => {
            const fieldKey = field.field_key;
            let value;
            
            if (field.field_type === 'multiselect') {
                const checkboxes = document.querySelectorAll(`input[name="${fieldKey}[]"]:checked`);
                value = Array.from(checkboxes).map(cb => cb.value);
                if (value.length > 0) {
                    formData.custom_fields[fieldKey] = value;
                }
            } else if (field.field_type === 'boolean') {
                const checkbox = document.getElementById(`field_${fieldKey}`);
                formData.custom_fields[fieldKey] = checkbox ? checkbox.checked : false;
            } else {
                const input = document.getElementById(`field_${fieldKey}`);
                if (input && input.value) {
                    formData.custom_fields[fieldKey] = input.value;
                }
            }
        });
        
        try {
            const response = await fetch(`${API_BASE}/contacts/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create contact');
            }
            
            alert('Contact created successfully!');
            window.location.href = '/boards';
        } catch (error) {
            console.error('Error creating contact:', error);
            alert('Error creating contact: ' + error.message);
        }
    });
}

// Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

