# 🔄 **Data Pipeline Documentation**

## **📊 Complete Data Flow Architecture**

### **🎯 High-Level Data Pipeline**

```mermaid
graph TD
    A[Candidate at Kiosk] --> B[Scan QR Code]
    B --> C[Fill Application Form]
    C --> D[Upload Resume/Record Voice]
    D --> E[Submit to Supabase]
    E --> F[Real-time Notification to Employer]
    F --> G[Employer Reviews Application]
    G --> H[Approve/Reject Decision]
    H --> I[Automated SMS Notification]
    I --> J[Status Updated in Real-time]
    
    style A fill:#e1f5fe
    style E fill:#f3e5f5
    style I fill:#e8f5e8
    style J fill:#fff3e0
```

---

## **🏗️ Detailed Technical Data Pipeline**

### **1. Data Ingestion Layer**

```mermaid
graph LR
    A[Voice Recording] --> D[Data Processing Layer]
    B[Resume Upload] --> D
    C[QR Code Data] --> D
    E[Form Input] --> D
    
    D --> F[Validation & Sanitization]
    F --> G[File Storage Processing]
    F --> H[Database Insert]
    
    G --> I[Supabase Storage]
    H --> J[PostgreSQL Database]
    
    style A fill:#ffebee
    style B fill:#e3f2fd
    style C fill:#f1f8e9
    style E fill:#fff8e1
```

### **2. Storage & Processing Pipeline**

```mermaid
graph TD
    A[Raw Application Data] --> B{Data Type?}
    
    B -->|Voice File| C[Voice Processing]
    B -->|Resume File| D[File Processing]
    B -->|Text Data| E[Text Processing]
    
    C --> F[Supabase Storage]
    C --> G[Transcription Service]
    
    D --> F
    D --> H[File Metadata Extraction]
    
    E --> I[Data Validation]
    E --> J[Database Insert]
    
    F --> K[Public URL Generation]
    G --> L[Text Analysis]
    H --> M[File Info Storage]
    I --> J
    
    J --> N[PostgreSQL Database]
    K --> N
    L --> N
    M --> N
    
    N --> O[Real-time Triggers]
    
    style A fill:#e8f5e8
    style N fill:#e1f5fe
    style O fill:#fff3e0
```

### **3. Real-time Data Flow**

```mermaid
sequenceDiagram
    participant K as Kiosk Interface
    participant S as Supabase API
    participant DB as PostgreSQL
    participant RT as Real-time Engine
    participant E as Employer Dashboard
    participant N as Notification Service
    participant T as Twilio API
    participant C as Candidate Phone
    
    K->>S: Submit Application
    S->>DB: Insert Application Record
    DB->>RT: Trigger Real-time Event
    RT->>E: Push Notification
    E->>S: Update Status (Approve/Reject)
    S->>DB: Update Application Status
    DB->>N: Trigger Notification
    N->>T: Send SMS/WhatsApp
    T->>C: Deliver Message
    DB->>RT: Status Change Event
    RT->>E: Update UI in Real-time
    RT->>K: Update Status (if checking)
```

---

## **💾 Database Data Pipeline**

### **4. Database Schema Flow**

```mermaid
erDiagram
    APPLICATIONS ||--o{ NOTIFICATIONS : triggers
    JOBS ||--o{ APPLICATIONS : receives
    COMPANIES ||--o{ JOBS : posts
    COMPANY_USERS ||--o{ COMPANIES : manages
    KIOSKS ||--o{ APPLICATIONS : submits_from
    
    APPLICATIONS {
        string id PK
        string job_id FK
        string applicant_name
        string applicant_phone
        string resume_url
        string voice_recording_url
        string voice_transcript
        enum status
        timestamp created_at
        timestamp updated_at
    }
    
    JOBS {
        string id PK
        string company_id FK
        string title
        string description
        enum status
        timestamp created_at
    }
    
    NOTIFICATIONS {
        string id PK
        string application_id FK
        enum notification_type
        enum status
        timestamp created_at
        timestamp sent_at
    }
```

---

## **🔄 Data Processing Workflows**

### **5. Application Submission Pipeline**

```mermaid
graph TD
    A[Start Application] --> B[Collect Personal Info]
    B --> C[Select Application Method]
    
    C --> D{Method Type?}
    D -->|Voice| E[Start Voice Recording]
    D -->|Upload| F[Select File]
    D -->|QR Scan| G[Scan QR Code]
    
    E --> H[Process Voice Data]
    F --> I[Process File Data]
    G --> J[Extract Job Information]
    
    H --> K[Voice Transcription]
    H --> L[Store Audio File]
    
    I --> M[File Validation]
    I --> N[Extract File Metadata]
    
    J --> O[Job Details Retrieval]
    
    K --> P[Create Application Record]
    L --> P
    M --> P
    N --> P
    O --> P
    
    P --> Q[Database Insert]
    Q --> R[Generate Success Response]
    Q --> S[Trigger Real-time Events]
    
    R --> T[Show Success to User]
    S --> U[Notify Employers]
    
    style A fill:#e8f5e8
    style Q fill:#e1f5fe
    style U fill:#fff3e0
```

### **6. Notification Processing Pipeline**

```mermaid
graph TD
    A[Status Change Trigger] --> B[Create Notification Record]
    B --> C[Notification Queue]
    
    C --> D[Notification Processor]
    D --> E{Notification Type?}
    
    E -->|SMS| F[Format SMS Message]
    E -->|WhatsApp| G[Format WhatsApp Message]
    E -->|Email| H[Format Email Message]
    
    F --> I[Twilio SMS API]
    G --> J[Twilio WhatsApp API]
    H --> K[Email Service]
    
    I --> L{Send Success?}
    J --> L
    K --> L
    
    L -->|Yes| M[Mark as Sent]
    L -->|No| N[Mark as Failed]
    
    M --> O[Update Database]
    N --> P[Retry Queue]
    
    P --> Q[Exponential Backoff]
    Q --> D
    
    style A fill:#ffebee
    style O fill:#e8f5e8
    style P fill:#fff3e0
```

---

## **📡 API Data Flow**

### **7. RESTful API Pipeline**

```mermaid
graph LR
    A[Client Request] --> B[API Gateway]
    B --> C[Authentication Layer]
    C --> D{Auth Valid?}
    
    D -->|No| E[401 Unauthorized]
    D -->|Yes| F[Route Handler]
    
    F --> G[Input Validation]
    G --> H{Valid Input?}
    
    H -->|No| I[400 Bad Request]
    H -->|Yes| J[Business Logic]
    
    J --> K[Database Operations]
    K --> L[Response Formatting]
    L --> M[Send Response]
    
    E --> M
    I --> M
    
    style A fill:#e3f2fd
    style K fill:#e1f5fe
    style M fill:#e8f5e8
```

### **8. File Upload Pipeline**

```mermaid
graph TD
    A[File Upload Request] --> B[File Validation]
    B --> C{Valid File?}
    
    C -->|No| D[Reject Upload]
    C -->|Yes| E[Generate Unique Filename]
    
    E --> F[Upload to Supabase Storage]
    F --> G{Upload Success?}
    
    G -->|No| H[Retry Upload]
    G -->|Yes| I[Generate Public URL]
    
    H --> J[Exponential Backoff]
    J --> F
    
    I --> K[Update Database Record]
    K --> L[Return URL to Client]
    
    D --> M[Error Response]
    
    style A fill:#fff8e1
    style F fill:#e1f5fe
    style K fill:#e8f5e8
```

---

## **⚡ Real-time Data Synchronization**

### **9. WebSocket Data Pipeline**

```mermaid
graph TD
    A[Database Change] --> B[Supabase Real-time Engine]
    B --> C[WebSocket Broadcast]
    
    C --> D[Connected Clients]
    D --> E[Employer Dashboards]
    D --> F[Admin Panels]
    D --> G[Kiosk Interfaces]
    
    E --> H[Update Application Lists]
    F --> I[Update Moderation Queues]
    G --> J[Update Status Displays]
    
    H --> K[Re-render Components]
    I --> K
    J --> K
    
    style A fill:#ffebee
    style B fill:#e1f5fe
    style K fill:#e8f5e8
```

---

## **🔍 Data Monitoring & Analytics**

### **10. Analytics Data Pipeline**

```mermaid
graph TD
    A[User Interactions] --> B[Event Tracking]
    B --> C[Data Aggregation]
    
    C --> D[Application Metrics]
    C --> E[Performance Metrics]
    C --> F[User Behavior Metrics]
    
    D --> G[Success Rate Analysis]
    E --> H[Response Time Analysis]
    F --> I[Usage Pattern Analysis]
    
    G --> J[Dashboard Display]
    H --> J
    I --> J
    
    J --> K[Business Intelligence]
    K --> L[Decision Making]
    
    style A fill:#f3e5f5
    style J fill:#e8f5e8
    style L fill:#fff3e0
```

---

## **📊 Data Models & Structures**

### **Application Data Structure**
```json
{
  "id": "uuid",
  "job_id": "uuid",
  "applicant_name": "string",
  "applicant_phone": "string", 
  "applicant_email": "string|null",
  "application_method": "kiosk_qr|kiosk_voice|online",
  "resume_url": "string|null",
  "voice_recording_url": "string|null",
  "voice_transcript": "string|null",
  "status": "submitted|under_review|approved|rejected",
  "ai_score": "number|null",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### **Notification Data Structure**
```json
{
  "id": "uuid",
  "application_id": "uuid",
  "notification_type": "application_received|status_update|interview_scheduled",
  "recipient_phone": "string",
  "message_content": "string",
  "status": "pending|sent|failed|delivered",
  "twilio_sid": "string|null",
  "sent_at": "timestamp|null",
  "delivered_at": "timestamp|null",
  "created_at": "timestamp"
}
```

---

## **🚀 Performance Optimization**

### **Data Pipeline Optimizations**
1. **Connection Pooling** - Efficient database connections
2. **Caching Strategy** - Redis for frequently accessed data
3. **Batch Processing** - Group notifications for efficiency
4. **Async Operations** - Non-blocking file uploads
5. **Database Indexing** - Optimized query performance
6. **CDN Integration** - Fast file delivery

### **Monitoring & Alerts**
- **Real-time Metrics** - Application performance
- **Error Tracking** - Failed operations
- **Usage Analytics** - User behavior patterns
- **System Health** - Resource utilization

This comprehensive data pipeline ensures **scalable**, **reliable**, and **real-time** processing of all job application workflows! 🎯