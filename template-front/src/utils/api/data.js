// Static data for attachments
export const attachmentData = [
    { id: 1, name: 'Bond', emailTemplate: 'Bond', description: 'This is the first template', signatureRequired: true, fields: ['date', 'empName', 'designation'] },
    { id: 2, name: 'Certificate', emailTemplate: 'Certificate', description: 'This is the second template', signatureRequired: false, fields: ['name', 'sport'] },
];

export const templateData = [
    { id: 1, name: 'Bond', emailTemplate: 'Bond', description: 'This is the first template', signatureRequired: true, fields: ['date', 'empName', 'designation'] },
    { id: 2, name: 'Certificate', emailTemplate: 'Certificate', description: 'This is the second template', signatureRequired: false, fields: ['name', 'sport'] },
];

// Static data for email templates
export const emailTemplatesData = [
    { id: 1, templateName: 'Email', subject:'This is Email Template', credential: 'HR' },
    { id: 2, templateName: 'Bond', subject:'This is Bond Template', credential: 'Manager' },
    { id: 3, templateName: 'Certificate', subject:'This is Certificate Template', credential: 'HR' },
    { id: 4, templateName: 'Email Signature', subject:'This is Signature Template', credential: 'Manager' },
];

// Static data for credentials
export const credentialsData = [
    { id: 1, name: 'HR', provider: 'Mailtrap', host: 'smtp.mailtrap.io', port: '587', username: 'user@example.com', password: 'password123' },
    { id: 2, name: 'Manager', provider: 'Gmail', host: 'smtp.gmail.com', port: '465', username: 'user@gmail.com', password: 'password456' },
];
