# 2nd Level Login (Student) DFD

## Smart Learn - Academic Portal System

```mermaid
graph LR
    %% External Entities
    Student([Student])
    UsersDB[(Users Table)]

    %% Process
    Login((1.0 Student Login))

    %% Flows
    Student -->|Request Access Email + Password| Login
    Login -->|Confirm Access JWT Token + User Data| Student

    Login -->|Validate Credentials Check Role = Student Check Email Verified| UsersDB
    UsersDB -->|Response Access Student Record| Login

    %% Styling
    style Login fill:#d4edda,stroke:#28a745,stroke-width:2px,color:#000
    style Student fill:#e8d5f5,stroke:#7b2d8e,stroke-width:2px,color:#000
    style UsersDB fill:#fff3cd,stroke:#ffc107,stroke-width:2px,color:#000
```
