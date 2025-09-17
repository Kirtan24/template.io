// src/utils/routeConfig.js

import {
  Dashboard, Inbox, EmailTemplate, Credentials, NotFound, AddEmailTemplate, EditEmailTemplate,
  AddCredential, EditCredential, User, AddUser, UserPermissions, Company, ViewEmployee, ViewCompany, Template,
  AddTemplate, Profile, EditTemplate, Permission, Home, SendTemplate, PDFPreviewPage, Send, Requests,
  Settings, SignaturePadComponent, ExcelMapper, Plans, EditPlan
} from '../components/Pages';

export const routePermissions = {
  "/dashboard": [],
  "/settings": ["only_admin"],
  "/plans": ["only_admin"],
  "/edit-plan": ["only_admin"],
  "/profile": [],

  "/companies": ["view_companies"],
  "/company-employees": ["view_company_employee"],
  "/company-profile": ["view_company"],
  "/pending-request": ["only_admin"],

  "/user": ["view_users"],
  "/add-user": ["create_users"],

  "/permission": ["only_admin"],
  "/manage-permissions": ["manage_permissions"],

  "/inbox": ["view_inbox"],

  "/credentials": ["view_credentials"],
  "/credentials/add-credential": ["create_credentials"],
  "/credentials/edit-credential/:id": ["update_credentials"],

  "/email-template": ["view_emailtemplate"],
  "/add-email-template": ["create_emailtemplate"],
  "/edit-email-template": ["update_emailtemplate"],
  "/email-template/send/:id": ["send_emailtemplate"],

  "/template": ["view_templates"],
  "/excel-upload": [],
  "/add-template": ["create_templates"],
  "/edit-template": ["update_templates"],
  "/send-document-template": ["send_templates"],
  "/pdf-preview": ["send_templates"],
  "/send": ["send_templates"],
};

export const routeComponents = {
  "/dashboard": <Dashboard title="Dashboard" searchable={true} />,
  "/settings": <Settings title="Settings" searchable={true} />,
  "/plans": <Plans title="Plans" searchable={true} />,
  "/edit-plan": <EditPlan title="Edit Plan" searchable={false} />,
  "/profile": <Profile title="Profile" searchable={true} />,

  "/companies": <Company title="Companies" searchable={true} />,
  "/company-employees": <ViewEmployee title="Company Employees" searchable={false} />,
  "/company-profile": <ViewCompany title="Company Profile" searchable={false} />,
  "/pending-request": <Requests title="Pending Request" searchable={true} />,

  "/user": <User title="Employees" searchable={true} />,
  "/add-user": <AddUser title="Add Employee" searchable={false} />,

  "/permission": <Permission title="Admin Permission" searchable={true} />,
  "/manage-permissions": <UserPermissions title="Permissions" searchable={false} />,
  "/inbox": <Inbox title="Inbox" searchable={true} />,

  "/credentials": <Credentials title="Credentials" searchable={true} />,
  "/credentials/add-credential": <AddCredential title="Add Credential" searchable={true} />,
  "/credentials/edit-credential/:id": <EditCredential title="Edit Credential" searchable={false} />,

  "/email-template": <EmailTemplate title="Email Template" searchable={true} />,
  "/add-email-template": <AddEmailTemplate title="Add Email Template" searchable={true} />,
  "/edit-email-template": <EditEmailTemplate title="Edit Email Template" searchable={false} />,
  "/email-template/send/:id": <SendTemplate title="Send Email Template" searchable={false} />,

  "/template": <Template title="Template" searchable={true} />,
  "/excel-upload": <ExcelMapper title="Upload Excel" searchable={false} />,
  "/add-template": <AddTemplate title="Add Template" searchable={true} />,
  "/edit-template": <EditTemplate title="Edit Template" searchable={false} />,
  "/send-document-template": <SendTemplate title="Send Template" searchable={false} />,
  "/pdf-preview": <PDFPreviewPage title="PDF Preview Page" searchable={false} />,
  "/send": <Send title="Send Template" searchable={false} />,
};

// // Befor the searchbar 18 - April

// export const routeComponents = {
//   "/dashboard": <Dashboard title="Dashboard" />,
//   "/settings": <Settings title="Settings" />,
//   "/plans": <Plans title="Plans" />,
//   "/edit-plan": <EditPlan title="Edit Plan" />,
//   "/profile": <Profile title="Profile" />,

//   "/companies": <Company title="Companies" />,
//   "/company-employees": <ViewEmployee title="Company Employees" />,
//   "/company-profile": <ViewCompany title="Company Profile" />,
//   "/pending-request": <Requests title="Pending Request" />,

//   "/user": <User title="Employees" />,
//   "/add-user": <AddUser title="Add Employee" />,

//   "/permission": <Permission title="Admin Permission" />,
//   "/manage-permissions": <UserPermissions title="Permissions" />,
//   "/inbox": <Inbox title="Inbox" />,

//   "/credentials": <Credentials title="Credentials" />,
//   "/credentials/add-credential": <AddCredential title="Add Credential" />,
//   "/credentials/edit-credential/:id": <EditCredential title="Edit Credential" />,

//   "/email-template": <EmailTemplate title="Email Template" />,
//   "/add-email-template": <AddEmailTemplate title="Add Email Template" />,
//   "/edit-email-template": <EditEmailTemplate title="Edit Email Template" />,
//   "/email-template/send/:id": <SendTemplate title="Send Email Template" />,

//   "/template": <Template title="Template" />,
//   "/excel-upload": <ExcelMapper title="Upload Excel" />,
//   "/add-template": <AddTemplate title="Add Template" />,
//   "/edit-template": <EditTemplate title="Edit Template" />,
//   "/send-document-template": <SendTemplate title="Send Template" />,
//   "/pdf-preview": <PDFPreviewPage title="PDF Preview Page" />,
//   "/send": <Send title="Send Template" />,
// };
