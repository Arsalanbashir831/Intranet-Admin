# Form Handling and Validation

<cite>
**Referenced Files in This Document**   
- [company-hub-form.tsx](file://src/components/company-hub/company-hub-form.tsx)
- [executive-member-form.tsx](file://src/components/executive-members/executive-member-form.tsx)
- [new-hire-plan-form.tsx](file://src/components/new-hire/new-hire-plan-form.tsx)
- [org-chart-form.tsx](file://src/components/org-chart/org-chart-form.tsx)
- [dropzone.tsx](file://src/components/ui/dropzone.tsx)
- [rich-text-editor.tsx](file://src/components/ui/rich-text-editor.tsx)
- [selectable-tags.tsx](file://src/components/ui/selectable-tags.tsx)
- [use-executive-members.ts](file://src/hooks/queries/use-executive-members.ts)
- [use-employees.ts](file://src/hooks/queries/use-employees.ts)
- [executive-members.ts](file://src/services/executive-members.ts)
- [employees.ts](file://src/services/employees.ts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Form Architecture Overview](#form-architecture-overview)
3. [Core Form Components](#core-form-components)
4. [Complex Form Structures](#complex-form-structures)
5. [File Upload Handling](#file-upload-handling)
6. [Rich Text Input Implementation](#rich-text-input-implementation)
7. [Reusable Form Fields](#reusable-form-fields)
8. [Form Lifecycle Management](#form-lifecycle-management)
9. [Validation and Error Handling](#validation-and-error-handling)
10. [Accessibility and User Experience](#accessibility-and-user-experience)
11. [Best Practices for Form Development](#best-practices-for-form-development)

## Introduction
This document provides comprehensive documentation for the form handling architecture in the Cartwright King Admin ERP system. The system utilizes React Hook Form principles with Zod validation patterns to manage complex form interactions across various administrative modules. The documentation covers the implementation of forms for company hub content, executive members, new hire plans, and organizational charts, detailing the integration between UI components, validation logic, and API interactions.

## Form Architecture Overview

```mermaid
graph TD
A[Form Component] --> B[State Management]
A --> C[Validation Logic]
A --> D[UI Components]
B --> E[React State]
B --> F[React Query Mutations]
C --> G[Zod Schemas]
C --> H[Custom Validation]
D --> I[Input Fields]
D --> J[File Upload]
D --> K[Rich Text Editor]
D --> L[Selectable Tags]
E --> M[Form Data]
F --> N[API Submission]
N --> O[Backend Services]
O --> P[Database]
```

**Diagram sources**
- [executive-member-form.tsx](file://src/components/executive-members/executive-member-form.tsx#L25-L266)
- [org-chart-form.tsx](file://src/components/org-chart/org-chart-form.tsx#L26-L253)

**Section sources**
- [executive-member-form.tsx](file://src/components/executive-members/executive-member-form.tsx#L25-L266)
- [org-chart-form.tsx](file://src/components/org-chart/org-chart-form.tsx#L26-L253)

## Core Form Components

The form architecture is built around reusable component patterns that maintain consistency across the application. Each form follows a similar structure with localized state management and standardized submission patterns.

### Form State Management
Forms utilize React's useState and useEffect hooks to manage local state, with initialization from props or API data. The state is synchronized with form inputs through controlled components, ensuring a single source of truth.

### Submission Handling
Form submission is handled through native HTML form submission with preventDefault, allowing integration with React Query mutations for API communication. Success and error states are managed through toast notifications.

**Section sources**
- [executive-member-form.tsx](file://src/components/executive-members/executive-member-form.tsx#L25-L266)
- [org-chart-form.tsx](file://src/components/org-chart/org-chart-form.tsx#L26-L253)

## Complex Form Structures

### Company Hub Form
The company hub form manages announcements and policies with multiple content types and access controls.

```mermaid
flowchart TD
Start([Company Hub Form]) --> TypeSelection["Select Type: Announcement/Policy"]
TypeSelection --> TitleInput["Enter Title"]
TitleInput --> AttachmentUpload["Upload Attachments"]
AttachmentUpload --> TagsInput["Add Hashtags/Tags"]
TagsInput --> DepartmentAccess["Set View Access Departments"]
DepartmentAccess --> PostedBy["Specify Posted By"]
PostedBy --> Description["Write Description"]
Description --> Submit["Submit Form"]
Submit --> Validation["Validate All Fields"]
Validation --> API["Submit to API"]
API --> Success["Show Success Toast"]
API --> Error["Show Error Toast"]
```

**Diagram sources**
- [company-hub-form.tsx](file://src/components/company-hub/company-hub-form.tsx#L18-L144)

**Section sources**
- [company-hub-form.tsx](file://src/components/company-hub/company-hub-form.tsx#L18-L144)

### Executive Member Form
The executive member form handles comprehensive profile information with file upload capabilities.

```mermaid
flowchart TD
Start([Executive Member Form]) --> PersonalInfo["Enter Personal Information"]
PersonalInfo --> ContactInfo["Enter Contact Details"]
ContactInfo --> RoleSelection["Select Role"]
RoleSelection --> ProfilePicture["Upload Profile Picture"]
ProfilePicture --> Education["Enter Education Details"]
Education --> Submit["Submit Form"]
Submit --> Validation["Validate All Fields"]
Validation --> API["Submit to API"]
API --> Success["Show Success Toast"]
API --> Error["Show Error Toast"]
```

**Diagram sources**
- [executive-member-form.tsx](file://src/components/executive-members/executive-member-form.tsx#L25-L266)

**Section sources**
- [executive-member-form.tsx](file://src/components/executive-members/executive-member-form.tsx#L25-L266)

## File Upload Handling

### Dropzone Component
The Dropzone component provides a consistent interface for file uploads across forms, supporting drag-and-drop and click-to-upload interactions.

```mermaid
sequenceDiagram
participant User
participant Dropzone
participant FileInput
participant Preview
User->>Dropzone : Drag files over area
Dropzone->>Dropzone : Highlight drop zone
User->>Dropzone : Drop files
Dropzone->>FileInput : Process files
FileInput->>Preview : Generate preview URLs
Preview->>Dropzone : Display image previews
Dropzone->>User : Show success state
User->>Dropzone : Click upload button
Dropzone->>FileInput : Trigger file input
FileInput->>User : Open file selector
User->>FileInput : Select files
FileInput->>Preview : Generate preview URLs
Preview->>Dropzone : Display image previews
```

**Diagram sources**
- [dropzone.tsx](file://src/components/ui/dropzone.tsx#L22-L256)

**Section sources**
- [dropzone.tsx](file://src/components/ui/dropzone.tsx#L22-L256)

### File Upload Lifecycle
The file upload process follows a standardized pattern across forms, with special handling for profile picture updates and removals.

```mermaid
flowchart TD
Start([File Upload]) --> Selection["User selects file(s)"]
Selection --> Processing["Process file selection"]
Processing --> PreviewGeneration["Generate preview URLs"]
PreviewGeneration --> StateUpdate["Update component state"]
StateUpdate --> APIIntegration["Integrate with form submission"]
APIIntegration --> ConditionalHandling["Conditional API handling"]
ConditionalHandling --> FilePresent{"File present?"}
FilePresent --> |Yes| FormData["Use FormData with file"]
FilePresent --> |No| JSONData["Use JSON payload"]
FormData --> API["Submit to API"]
JSONData --> API
API --> Success["Show success message"]
API --> Error["Show error message"]
```

**Diagram sources**
- [executive-members.ts](file://src/services/executive-members.ts#L56-L141)
- [employees.ts](file://src/services/employees.ts#L41-L113)

**Section sources**
- [executive-members.ts](file://src/services/executive-members.ts#L56-L141)
- [employees.ts](file://src/services/employees.ts#L41-L113)

## Rich Text Input Implementation

### Rich Text Editor
The RichTextEditor component provides a WYSIWYG interface for content creation with formatting options.

```mermaid
classDiagram
class RichTextEditor {
+content : string
+onChange : function
+placeholder : string
+minHeight : string
+maxHeight : string
+disabled : boolean
-editor : Editor
-fontSize : number
-textColor : string
-highlightColor : string
-imageUrl : string
+handleTextColorChange(color)
+handleHighlightColorChange(color)
+toggleHighlight()
+insertImage()
+updateFontSize(size)
}
class Editor {
+chain() : Chain
+commands : Commands
+isActive(type) : boolean
+getHTML() : string
+setContent(content) : void
}
class Chain {
+focus() : Chain
+toggleBold() : Chain
+toggleItalic() : Chain
+toggleUnderline() : Chain
+toggleStrike() : Chain
+setTextAlign(align) : Chain
+toggleBulletList() : Chain
+toggleOrderedList() : Chain
+setColor(color) : Chain
+setHighlight(options) : Chain
+unsetHighlight() : Chain
+setImage(options) : Chain
+setFontSize(size) : Chain
}
RichTextEditor --> Editor : "uses"
Editor --> Chain : "provides"
```

**Diagram sources**
- [rich-text-editor.tsx](file://src/components/ui/rich-text-editor.tsx#L49-L573)

**Section sources**
- [rich-text-editor.tsx](file://src/components/ui/rich-text-editor.tsx#L49-L573)

## Reusable Form Fields

### Selectable Tags Component
The SelectableTags component provides a consistent interface for multi-select functionality across forms.

```mermaid
flowchart TD
Start([Selectable Tags]) --> Search["User searches items"]
Search --> Filter["Filter available items"]
Filter --> Selection["Select from filtered list"]
Selection --> Display["Display selected items"]
Display --> Removal["Remove individual items"]
Removal --> Update["Update parent component"]
Update --> State["Maintain selected state"]
subgraph "Component Structure"
Trigger[TagsTrigger]
Content[TagsContent]
Input[TagsInput]
Value[TagsValue]
end
Trigger --> Content
Content --> Input
Content --> Value
```

**Diagram sources**
- [selectable-tags.tsx](file://src/components/ui/selectable-tags.tsx#L40-L184)

**Section sources**
- [selectable-tags.tsx](file://src/components/ui/selectable-tags.tsx#L40-L184)

## Form Lifecycle Management

### Form Initialization
Forms are initialized with optional initial data, which populates the form fields when editing existing records.

```mermaid
sequenceDiagram
participant Form
participant Props
participant State
Form->>Props : Receive initialData
Props->>Form : Check if initialData exists
alt Has initial data
Form->>State : Set state from initialData
State->>Form : Initialize form fields
else No initial data
Form->>State : Initialize with defaults
State->>Form : Set empty form fields
end
Form->>User : Display form
```

**Section sources**
- [company-hub-form.tsx](file://src/components/company-hub/company-hub-form.tsx#L18-L144)
- [executive-member-form.tsx](file://src/components/executive-members/executive-member-form.tsx#L25-L266)

### Form Submission
The form submission process follows a consistent pattern across all forms, with validation and API integration.

```mermaid
sequenceDiagram
participant User
participant Form
participant API
participant Toast
User->>Form : Fill form and submit
Form->>Form : Prevent default submission
Form->>Form : Collect form data
Form->>Form : Validate required fields
alt Valid data
Form->>API : Call mutation with payload
API->>API : Process request
alt Success
API-->>Form : Return success
Form->>Toast : Show success message
Form->>User : Redirect to list view
else Error
API-->>Form : Return error
Form->>Form : Parse error response
Form->>Toast : Show error messages
Form->>User : Remain on form
end
else Invalid data
Form->>Toast : Show validation error
Form->>User : Highlight missing fields
end
```

**Diagram sources**
- [executive-member-form.tsx](file://src/components/executive-members/executive-member-form.tsx#L25-L266)
- [org-chart-form.tsx](file://src/components/org-chart/org-chart-form.tsx#L26-L253)

**Section sources**
- [executive-member-form.tsx](file://src/components/executive-members/executive-member-form.tsx#L25-L266)
- [org-chart-form.tsx](file://src/components/org-chart/org-chart-form.tsx#L26-L253)

## Validation and Error Handling

### Client-Side Validation
Forms implement client-side validation through required attributes and manual checks before submission.

```mermaid
flowchart TD
Start([Form Submission]) --> RequiredCheck["Check required fields"]
RequiredCheck --> EmptyFields{"Empty required fields?"}
EmptyFields --> |Yes| ShowError["Show error toast"]
EmptyFields --> |No| PayloadConstruction["Construct payload"]
PayloadConstruction --> APIIntegration["Integrate with API"]
APIIntegration --> ServerValidation["Server validates data"]
ServerValidation --> Success{"Validation successful?"}
Success --> |Yes| SuccessFlow["Show success message"]
Success --> |No| ErrorParsing["Parse error response"]
ErrorParsing --> ErrorDisplay["Display field-specific errors"]
```

**Section sources**
- [executive-member-form.tsx](file://src/components/executive-members/executive-member-form.tsx#L25-L266)
- [org-chart-form.tsx](file://src/components/org-chart/org-chart-form.tsx#L26-L253)

### Error Response Handling
The system parses API error responses and displays them as toast notifications.

```mermaid
sequenceDiagram
participant API
participant Form
participant Toast
API->>Form : Return 4xx/5xx response
Form->>Form : Parse response data
Form->>Form : Extract error messages
loop For each error
Form->>Toast : Show individual error toast
end
alt No specific errors
Form->>Toast : Show generic error message
end
```

**Section sources**
- [executive-member-form.tsx](file://src/components/executive-members/executive-member-form.tsx#L25-L266)
- [org-chart-form.tsx](file://src/components/org-chart/org-chart-form.tsx#L26-L253)

## Accessibility and User Experience

### Loading States
Forms manage loading states through React Query mutations, disabling submission during processing.

```mermaid
flowchart TD
Start([User submits form]) --> DisableForm["Disable form inputs"]
DisableForm --> ShowLoading["Show loading state"]
ShowLoading --> API["Call API"]
API --> Processing["API processes request"]
Processing --> Complete["Request complete"]
Complete --> EnableForm["Re-enable form inputs"]
EnableForm --> DisplayResult["Show success/error"]
```

**Section sources**
- [executive-member-form.tsx](file://src/components/executive-members/executive-member-form.tsx#L25-L266)
- [org-chart-form.tsx](file://src/components/org-chart/org-chart-form.tsx#L26-L253)

### Feedback Mechanisms
The system provides immediate feedback through toast notifications for both success and error states.

```mermaid
flowchart TD
Success --> ToastSuccess["Show green success toast"]
Error --> ToastError["Show red error toast"]
ToastSuccess --> AutoDismiss["Auto-dismiss after delay"]
ToastError --> ManualDismiss["Require user acknowledgment"]
```

**Section sources**
- [executive-member-form.tsx](file://src/components/executive-members/executive-member-form.tsx#L25-L266)
- [org-chart-form.tsx](file://src/components/org-chart/org-chart-form.tsx#L26-L253)

## Best Practices for Form Development

### Creating New Forms
When creating new forms, follow the established patterns for consistency:

1. Use the same form structure with controlled components
2. Implement consistent error handling with toast notifications
3. Follow the same file upload patterns with Dropzone
4. Use RichTextEditor for multi-line content fields
5. Utilize SelectableTags for multi-select functionality

### Extending Validation Schemas
To extend validation schemas, consider the following approaches:

1. Add new fields to the form state and UI components
2. Update the payload construction to include new data
3. Ensure server-side validation supports the new fields
4. Update error handling to display messages for new fields
5. Test both client and server validation scenarios

**Section sources**
- [executive-member-form.tsx](file://src/components/executive-members/executive-member-form.tsx#L25-L266)
- [org-chart-form.tsx](file://src/components/org-chart/org-chart-form.tsx#L26-L253)
- [company-hub-form.tsx](file://src/components/company-hub/company-hub-form.tsx#L18-L144)