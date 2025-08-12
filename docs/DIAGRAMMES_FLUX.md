# Diagrammes des flux de données - DetectionCancer

Cette documentation présente les diagrammes détaillés des flux de données, des processus d'authentification, de prédiction, de l'architecture de déploiement et des interactions utilisateur pour l'application DetectionCancer.

---

## 1. Flux de données global entre Frontend/Backend/IA

```mermaid
graph TB
    subgraph "Couche Présentation"
        A[Interface Utilisateur React]
        B[Composants Upload]
        C[Dashboard Patient]
        D[Timeline Examens]
    end

    subgraph "Couche API (Django REST)"
        E[Authentification JWT]
        F[Endpoints Patient]
        G[Endpoint Prédiction IA]
        H[Gestion Fichiers]
        I[Middleware Sécurité]
    end

    subgraph "Couche Données"
        J[Base SQLite]
        K[Stockage Fichiers]
    end

    subgraph "Couche Intelligence Artificielle"
        L[Modèle Keras CNN]
        M[Préprocessing Images]
        N[Post-processing Résultats]
    end

    A --> E
    B --> H
    C --> F
    D --> F

    E --> J
    F --> J
    G --> M
    H --> K

    M --> L
    L --> N
    N --> G

    G -.->|"Score + Métadonnées"| A
    F -.->|"Données Patient"| C
    F -.->|"Historique Examens"| D
    H -.->|"Confirmation Upload"| B
    E -.->|"Token JWT"| A
```

---

## 2. Diagramme de séquence - Processus d'authentification

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface React
    participant API as Django API
    participant AUTH as Système Auth
    participant DB as Base de données
    participant JWT as Service JWT

    U->>UI: Saisie identifiants
    UI->>API: POST /auth/login/
    API->>AUTH: Vérification identifiants
    AUTH->>DB: Requête utilisateur
    DB-->>AUTH: Données utilisateur

    alt Authentification réussie
        AUTH-->>JWT: Génération token
        JWT-->>API: Token JWT
        API-->>UI: {token, user_info, permissions}
        UI-->>U: Redirection vers dashboard

        Note over UI: Token stocké localement
        Note over UI: Headers Authorization ajoutés

    else Authentification échouée
        AUTH-->>API: Erreur authentification
        API-->>UI: {error: "Identifiants invalides"}
        UI-->>U: Message d'erreur
    end

    Note over U,JWT: Token valide 24h par défaut
```

---

## 3. Diagramme de séquence - Processus de prédiction IA

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant UI as Interface Upload
    participant API as Django API
    participant VAL as Validation Fichier
    participant PREP as Preprocessor
    participant IA as Modèle Keras
    participant DB as Base de données
    participant NOTIF as Notifications

    U->>UI: Sélection image médicale
    UI->>UI: Validation format client

    alt Format accepté
        UI->>API: POST /detection/predict/ + image
        API->>VAL: Validation sécurité fichier

        alt Fichier valide
            VAL->>PREP: Image bytes
            PREP->>PREP: Redimensionnement 50x50
            PREP->>PREP: Normalisation RGB
            PREP->>IA: Tableau numpy preprocessé

            IA->>IA: Prédiction CNN
            IA-->>PREP: Score probabilité [0-1]
            PREP-->>API: Score + métadonnées

            API->>DB: Sauvegarde résultat examen
            DB-->>API: ID examen créé

            API-->>UI: {score, result, confidence, exam_id}
            UI-->>U: Affichage score + visualisation

            opt Notification si score élevé
                API->>NOTIF: Alerte score > 0.8
                NOTIF-->>U: Notification urgence
            end

        else Fichier invalide
            VAL-->>API: Erreur validation
            API-->>UI: {error: "Format non supporté"}
            UI-->>U: Message d'erreur
        end

    else Format rejeté
        UI-->>U: Message format incorrect
    end

    Note over IA: Modèle CNN binaire
    Note over PREP: Images 50x50 RGB
    Note over API: Log toutes les prédictions
```

---

## 4. Architecture de déploiement Docker

```mermaid
graph TB
    subgraph "Infrastructure Docker"
        subgraph "Container Frontend"
            A[Nginx Server]
            B[React Build Static]
            C[Port 3000]
        end

        subgraph "Container Backend"
            D[Django Server]
            E[Gunicorn WSGI]
            F[Port 8000]
            G[Python 3.11]
        end

        subgraph "Container Database"
            H[SQLite Volume]
            I[Persistent Storage]
        end

        subgraph "Container AI/ML"
            J[TensorFlow/Keras]
            K[Modèles IA]
            L[NumPy/Pillow]
        end

        subgraph "Volumes Persistants"
            M[Volume Media Files]
            N[Volume Static Files]
            O[Volume Database]
            P[Volume ML Models]
        end
    end

    subgraph "Services Externes"
        Q[Load Balancer]
        R[SSL Termination]
        S[Domain Name]
        T[Render.com Platform]
    end

    A --> C
    B --> A
    D --> F
    E --> D
    G --> D

    H --> I
    J --> K
    L --> J

    M --> D
    N --> A
    O --> H
    P --> J

    Q --> A
    Q --> D
    R --> Q
    S --> R
    T --> Q

    C -.->|"API Calls"| F
    D -.->|"File Access"| M
    D -.->|"DB Queries"| H
    D -.->|"ML Predictions"| J
```

### Commandes Docker

```bash
# Construction des images
docker-compose build

# Lancement des services
docker-compose up -d

# Services disponibles :
# - frontend: React + Nginx (port 3000)
# - backend: Django + Gunicorn (port 8000)
# - db: SQLite avec volume persistant
```

---

## 5. Interactions utilisateur - Flowcharts

### 5.1 Flux principal d'utilisation

```mermaid
flowchart TD
    START([Utilisateur arrive sur l'app]) --> AUTH{Authentifié ?}
    AUTH -->|Non| LOGIN[Page de connexion]
    LOGIN --> CREDS[Saisie identifiants]
    CREDS --> VERIFY{Identifiants valides ?}
    VERIFY -->|Non| ERROR1[Message d'erreur]
    ERROR1 --> LOGIN
    VERIFY -->|Oui| DASHBOARD

    AUTH -->|Oui| DASHBOARD[Dashboard principal]
    DASHBOARD --> CHOICE{Action souhaitée}

    CHOICE -->|Nouvel examen| EXAM[Page Nouvel Examen]
    CHOICE -->|Consulter patient| PATIENT[Sélection patient]
    CHOICE -->|Timeline| TIMELINE[Visualisation timeline]
    CHOICE -->|Paramètres| SETTINGS[Configuration]

    EXAM --> TYPE{Type d'examen}
    TYPE -->|Mammographie| MAMMO[Upload mammographie]
    TYPE -->|Biopsie| BIOPSY[Upload biopsie]

    MAMMO --> UPLOAD1[Drag & Drop / Sélection]
    BIOPSY --> UPLOAD2[Drag & Drop / Sélection]

    UPLOAD1 --> VALIDATE1{Format valide ?}
    UPLOAD2 --> VALIDATE2{Format valide ?}

    VALIDATE1 -->|Non| ERROR2[Erreur format]
    VALIDATE2 -->|Non| ERROR3[Erreur format]
    ERROR2 --> MAMMO
    ERROR3 --> BIOPSY

    VALIDATE1 -->|Oui| PREDICT1[Analyse par IA]
    VALIDATE2 -->|Oui| PREDICT2[Analyse par IA]

    PREDICT1 --> RESULT1[Affichage score]
    PREDICT2 --> RESULT2[Affichage score]

    RESULT1 --> SAVE{Sauvegarder ?}
    RESULT2 --> SAVE

    SAVE -->|Oui| CONFIRM[Confirmation sauvegarde]
    SAVE -->|Non| DASHBOARD
    CONFIRM --> DASHBOARD

    PATIENT --> PLIST[Liste des patients]
    PLIST --> PSELECT[Sélection patient]
    PSELECT --> PDETAIL[Détails patient]
    PDETAIL --> TIMELINE

    TIMELINE --> FILTER{Filtres actifs ?}
    FILTER -->|Oui| FILTERED[Vue filtrée]
    FILTER -->|Non| FULL[Vue complète]
    FILTERED --> EXPORT{Exporter ?}
    FULL --> EXPORT

    EXPORT -->|Oui| PDF[Génération PDF]
    EXPORT -->|Non| DASHBOARD
    PDF --> DOWNLOAD[Téléchargement]
    DOWNLOAD --> DASHBOARD

    SETTINGS --> CONFIG[Modification paramètres]
    CONFIG --> DASHBOARD
```

### 5.2 Gestion des erreurs utilisateur

```mermaid
flowchart TD
    ERROR([Erreur détectée]) --> TYPE{Type d'erreur}

    TYPE -->|Réseau| NET[Erreur réseau]
    TYPE -->|Authentification| AUTH[Token expiré]
    TYPE -->|Validation| VALID[Données invalides]
    TYPE -->|Serveur| SERVER[Erreur 500]
    TYPE -->|IA| AI[Erreur prédiction]

    NET --> RETRY{Retry automatique}
    RETRY -->|< 3 fois| WAIT[Attente 2s]
    WAIT --> REREQUEST[Nouvelle tentative]
    REREQUEST --> SUCCESS{Succès ?}
    SUCCESS -->|Oui| CONTINUE[Continuer]
    SUCCESS -->|Non| RETRY
    RETRY -->|≥ 3 fois| NETMSG[Message erreur réseau]

    AUTH --> REFRESH{Token refresh possible ?}
    REFRESH -->|Oui| NEWTOKEN[Nouveau token]
    NEWTOKEN --> CONTINUE
    REFRESH -->|Non| LOGOUT[Déconnexion forcée]
    LOGOUT --> LOGIN[Retour connexion]

    VALID --> HIGHLIGHT[Surlignage champs]
    HIGHLIGHT --> TOOLTIP[Message d'aide]
    TOOLTIP --> USERCORRECT[Correction utilisateur]
    USERCORRECT --> REVALIDATE[Nouvelle validation]
    REVALIDATE --> CONTINUE

    SERVER --> SERVERMSG[Message erreur serveur]
    SERVERMSG --> REPORT{Rapport automatique ?}
    REPORT -->|Oui| LOG[Log erreur]
    REPORT -->|Non| MANUAL[Action manuelle]
    LOG --> MANUAL
    MANUAL --> DASHBOARD[Retour dashboard]

    AI --> AIMSG[Erreur analyse IA]
    AIMSG --> FALLBACK{Mode dégradé ?}
    FALLBACK -->|Oui| MANUAL_ANALYSIS[Analyse manuelle]
    FALLBACK -->|Non| DASHBOARD
    MANUAL_ANALYSIS --> DASHBOARD

    NETMSG --> DASHBOARD
    CONTINUE --> END([Fin])
    DASHBOARD --> END
```

### 5.3 Workflow de validation des images

```mermaid
flowchart TD
    UPLOAD([Image uploadée]) --> SIZE{Taille < 10MB ?}
    SIZE -->|Non| SIZEERROR[Erreur: Fichier trop volumineux]
    SIZEERROR --> RETRY[Nouvel essai]

    SIZE -->|Oui| FORMAT{Format supporté ?}
    FORMAT -->|Non| FORMATERROR[Erreur: Format non supporté]
    FORMATERROR --> RETRY

    FORMAT -->|Oui| CONTENT{Contenu valide ?}
    CONTENT -->|Non| CONTENTERROR[Erreur: Contenu invalide]
    CONTENTERROR --> RETRY

    CONTENT -->|Oui| MEDICAL{Image médicale ?}
    MEDICAL -->|Incertain| WARNING[Avertissement qualité]
    WARNING --> CONFIRM{Continuer quand même ?}
    CONFIRM -->|Non| RETRY
    CONFIRM -->|Oui| PROCESS

    MEDICAL -->|Oui| PROCESS[Traitement IA]
    PROCESS --> QUALITY{Qualité suffisante ?}

    QUALITY -->|Non| QUALITYWARNING[Avertissement: Qualité faible]
    QUALITYWARNING --> SHOWRESULT[Résultat avec disclaimer]

    QUALITY -->|Oui| PREDICT[Prédiction normale]
    PREDICT --> CONFIDENCE{Confiance > 70% ?}

    CONFIDENCE -->|Non| LOWCONF[Résultat peu fiable]
    LOWCONF --> SHOWRESULT

    CONFIDENCE -->|Oui| HIGHCONF[Résultat fiable]
    HIGHCONF --> CRITICAL{Score > 80% ?}

    CRITICAL -->|Oui| ALERT[Alerte prioritaire]
    ALERT --> SHOWRESULT

    CRITICAL -->|Non| NORMAL[Résultat normal]
    NORMAL --> SHOWRESULT

    SHOWRESULT --> SAVE{Sauvegarder ?}
    SAVE -->|Oui| STORED[Examen sauvegardé]
    SAVE -->|Non| DISCARD[Résultat non sauvegardé]

    STORED --> END([Fin])
    DISCARD --> END
    RETRY --> UPLOAD

    style ALERT fill:#ff6b6b
    style HIGHCONF fill:#51cf66
    style LOWCONF fill:#ffd43b
    style SIZEERROR fill:#ff6b6b
    style FORMATERROR fill:#ff6b6b
    style CONTENTERROR fill:#ff6b6b
```

---

## 6. Architecture détaillée des composants

```mermaid
graph TB
    subgraph "Frontend React Architecture"
        subgraph "Pages"
            A1[AuthPage.tsx]
            A2[NouvelExamen.tsx]
            A3[Dashboard.tsx]
            A4[PatientDetail.tsx]
        end

        subgraph "Components"
            B1[ImageUploader.tsx]
            B2[BiopsyUploader.tsx]
            B3[PatientTimeline.tsx]
            B4[ExamChart.tsx]
            B5[DicomViewer.tsx]
        end

        subgraph "Services"
            C1[api.ts]
            C2[auth.service.ts]
            C3[storage.service.ts]
        end

        subgraph "State Management"
            D1[AuthContext]
            D2[PatientContext]
            D3[ExamContext]
        end
    end

    subgraph "Backend Django Architecture"
        subgraph "Views"
            E1[auth_views.py]
            E2[patient_views.py]
            E3[views_predict.py]
            E4[transfer_views.py]
        end

        subgraph "Models"
            F1[User/UserProfile]
            F2[Patient]
            F3[ExamenMedical]
            F4[BiopsyReport]
        end

        subgraph "Serializers"
            G1[UserSerializer]
            G2[PatientSerializer]
            G3[ExamSerializer]
            G4[PredictionSerializer]
        end

        subgraph "AI Integration"
            H1[ml/predict.py]
            H2[ml/models/]
            H3[Preprocessing]
        end
    end

    A1 --> C2
    A2 --> B1
    A2 --> B2
    A3 --> B3
    A4 --> B4
    A4 --> B5

    B1 --> C1
    B2 --> C1
    B3 --> C1

    C1 --> E1
    C1 --> E2
    C1 --> E3
    C1 --> E4

    C2 --> D1
    D1 --> D2
    D2 --> D3

    E1 --> F1
    E2 --> F2
    E3 --> F3
    E4 --> F4

    E1 --> G1
    E2 --> G2
    E3 --> G3
    E3 --> G4

    E3 --> H1
    H1 --> H2
    H1 --> H3

    F1 -.-> G1
    F2 -.-> G2
    F3 -.-> G3
    F4 -.-> G3
```

---

## 7. Flux de données en temps réel

```mermaid
sequenceDiagram
    participant Browser as Navigateur
    participant React as React App
    participant API as Django API
    participant AI as Modèle IA
    participant DB as Base de données
    participant WS as WebSocket

    Note over Browser,WS: Connexion WebSocket pour updates temps réel

    Browser->>React: Upload image
    React->>API: POST /predict/
    API->>AI: Analyse image

    Note over API,DB: Traitement parallèle

    par Traitement IA
        AI->>AI: Preprocessing (2s)
        AI-->>API: Progress 30%
        API-->>WS: Broadcast progress
        WS-->>React: Progress update
        React-->>Browser: Barre progression

        AI->>AI: CNN Forward Pass (3s)
        AI-->>API: Progress 70%
        API-->>WS: Broadcast progress
        WS-->>React: Progress update
        React-->>Browser: Mise à jour barre

        AI->>AI: Post-processing (1s)
        AI-->>API: Résultat final
        API-->>WS: Broadcast completion
        WS-->>React: Résultat
        React-->>Browser: Affichage score
    and Sauvegarde parallèle
        API->>DB: Sauvegarde métadonnées
        DB-->>API: Confirmation
        API-->>WS: Broadcast saved
        WS-->>React: Confirmation sauvegarde
    end

    Note over Browser,WS: Déconnexion WebSocket après traitement
```

---

## Conclusion

Ces diagrammes illustrent la complexité et la robustesse de l'architecture DetectionCancer :

1. **Flux de données** : Architecture en couches avec séparation claire des responsabilités
2. **Authentification** : Sécurité JWT avec gestion des erreurs
3. **Prédiction IA** : Pipeline complet avec validation et préprocessing
4. **Déploiement Docker** : Infrastructure conteneurisée et scalable
5. **Interactions utilisateur** : UX fluide avec gestion d'erreurs complète

Cette documentation servira de référence pour :

- Le développement de nouvelles fonctionnalités
- La maintenance et le debugging
- L'onboarding de nouveaux développeurs
- L'optimisation des performances
