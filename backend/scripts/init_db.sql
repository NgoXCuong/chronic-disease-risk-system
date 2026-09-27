-- =========================================================================
-- DATABASE INITIALIZATION SCRIPT: CHRONIC DISEASE RISK SYSTEM
-- Target RDBMS: PostgreSQL 16
-- Standard: ANSI SQL / PostgreSQL 16 Extension
-- =========================================================================

-- 1. Enable Required Extensions for UUID and Cryptography
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create Custom ENUM Types
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('USER', 'HEALTH_CONSULTANT', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE biological_sex_enum AS ENUM ('MALE', 'FEMALE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE record_type_enum AS ENUM ('LIFESTYLE_BRFSS', 'CLINICAL_PIMA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE disease_type_enum AS ENUM (
        'diabetes_binary',
        'hypertension',
        'cardiovascular',
        'stroke',
        'diabetes_clinical'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE risk_level_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE message_sender_role_enum AS ENUM ('user', 'assistant', 'system');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE facility_specialty_enum AS ENUM (
        'ENDOCRINOLOGY',
        'CARDIOLOGY',
        'STROKE_NEUROLOGY',
        'GENERAL_HOSPITAL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE facility_tier_enum AS ENUM ('CENTRAL', 'PROVINCIAL', 'DISTRICT', 'PRIVATE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type_enum AS ENUM (
        'SCREENING_REMINDER',
        'HIGH_RISK_ALERT',
        'LIFESTYLE_GOAL',
        'DOCTOR_NOTE',
        'SYSTEM_ANNOUNCEMENT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_priority_enum AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE token_type_enum AS ENUM (
        'REFRESH_TOKEN',
        'PASSWORD_RESET',
        'EMAIL_VERIFICATION'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Create Tables

-- 3.1. Table: users
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    hashed_password VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'USER',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 3.2. Table: patient_profiles (1-to-1 with users)
CREATE TABLE IF NOT EXISTS patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150),
    date_of_birth DATE,
    gender biological_sex_enum,
    height_cm DOUBLE PRECISION,
    weight_kg DOUBLE PRECISION,
    medical_history JSONB NOT NULL DEFAULT '{}'::jsonb,
    emergency_contact JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_valid_height CHECK (height_cm IS NULL OR (height_cm >= 40.0 AND height_cm <= 250.0)),
    CONSTRAINT chk_valid_weight CHECK (weight_kg IS NULL OR (weight_kg >= 15.0 AND weight_kg <= 300.0))
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON patient_profiles(user_id);

-- 3.3. Table: user_auth_tokens (Refresh Token Rotation, Revocation, Password Reset)
CREATE TABLE IF NOT EXISTS user_auth_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    token_type token_type_enum NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    user_agent VARCHAR(255),
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tokens_user_type_revoked ON user_auth_tokens(user_id, token_type, is_revoked);
CREATE INDEX IF NOT EXISTS idx_tokens_expires ON user_auth_tokens(expires_at);

-- 3.4. Table: ml_models (MLOps Model Registry)
CREATE TABLE IF NOT EXISTS ml_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    disease_type disease_type_enum NOT NULL,
    version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    model_name VARCHAR(150) NOT NULL,
    algorithm VARCHAR(100) NOT NULL DEFAULT 'XGBoost + CalibratedClassifierCV (Isotonic)',
    dataset_source VARCHAR(200) NOT NULL DEFAULT 'CDC BRFSS 2015 (~253,680 records)',
    optimal_threshold DOUBLE PRECISION NOT NULL,
    roc_auc DOUBLE PRECISION NOT NULL,
    recall DOUBLE PRECISION NOT NULL,
    f1_score DOUBLE PRECISION NOT NULL,
    precision_metric DOUBLE PRECISION,
    features_order JSONB NOT NULL,
    risk_levels_config JSONB NOT NULL,
    artifact_path VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    trained_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_model_disease_version UNIQUE (disease_type, version)
);

CREATE INDEX IF NOT EXISTS idx_models_disease_active ON ml_models(disease_type, is_active);

-- 3.5. Table: health_records (1-to-N with users)
CREATE TABLE IF NOT EXISTS health_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    record_type record_type_enum NOT NULL,
    input_data JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_records_user_created ON health_records(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_records_input_data_gin ON health_records USING gin (input_data);

-- 3.6. Table: screening_results (1-to-N with health_records)
CREATE TABLE IF NOT EXISTS screening_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    health_record_id UUID NOT NULL REFERENCES health_records(id) ON DELETE CASCADE,
    disease_type disease_type_enum NOT NULL,
    model_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    risk_score DOUBLE PRECISION NOT NULL,
    risk_percentage DOUBLE PRECISION NOT NULL,
    risk_level risk_level_enum NOT NULL,
    optimal_threshold DOUBLE PRECISION NOT NULL,
    shap_summary JSONB NOT NULL,
    top_risk_factors JSONB NOT NULL,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_valid_risk_score CHECK (risk_score >= 0.0 AND risk_score <= 1.0),
    CONSTRAINT chk_valid_risk_percentage CHECK (risk_percentage >= 0.0 AND risk_percentage <= 100.0),
    CONSTRAINT chk_valid_optimal_threshold CHECK (optimal_threshold >= 0.0 AND optimal_threshold <= 1.0)
);

CREATE INDEX IF NOT EXISTS idx_screening_record_id ON screening_results(health_record_id);
CREATE INDEX IF NOT EXISTS idx_screening_disease_risk ON screening_results(disease_type, risk_level);
CREATE INDEX IF NOT EXISTS idx_screening_created ON screening_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_screening_shap_summary_gin ON screening_results USING gin (shap_summary);
CREATE INDEX IF NOT EXISTS idx_screening_top_risk_gin ON screening_results USING gin (top_risk_factors);

-- 3.7. Table: screening_reviews (Clinician & Consultant Reviews)
CREATE TABLE IF NOT EXISTS screening_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screening_result_id UUID NOT NULL REFERENCES screening_results(id) ON DELETE CASCADE,
    consultant_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clinical_notes TEXT NOT NULL,
    lifestyle_advice TEXT,
    recommended_action VARCHAR(100) NOT NULL DEFAULT 'FOLLOW_UP_3_MONTHS',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_screening_created ON screening_reviews(screening_result_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_consultant_created ON screening_reviews(consultant_id, created_at DESC);

-- 3.8. Table: what_if_simulations
CREATE TABLE IF NOT EXISTS what_if_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    screening_result_id UUID NOT NULL REFERENCES screening_results(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_risk_score DOUBLE PRECISION NOT NULL,
    simulated_risk_score DOUBLE PRECISION NOT NULL,
    delta_risk DOUBLE PRECISION NOT NULL,
    modified_features JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_whatif_user_created ON what_if_simulations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_whatif_screening ON what_if_simulations(screening_result_id);

-- 3.6. Table: ai_chat_sessions
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    screening_result_id UUID REFERENCES screening_results(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Tư vấn sức khỏe & kết quả sàng lọc',
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_session_user_created ON ai_chat_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_session_screening ON ai_chat_sessions(screening_result_id);

-- 3.7. Table: ai_chat_messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    sender_role message_sender_role_enum NOT NULL,
    content TEXT NOT NULL,
    is_emergency_flag BOOLEAN NOT NULL DEFAULT FALSE,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_message_session_created ON ai_chat_messages(session_id, created_at ASC);

-- 3.8. Table: medical_facilities
CREATE TABLE IF NOT EXISTS medical_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    specialty facility_specialty_enum NOT NULL,
    facility_tier facility_tier_enum NOT NULL DEFAULT 'PROVINCIAL',
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Hà Nội',
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    phone VARCHAR(50),
    emergency_phone VARCHAR(50),
    website VARCHAR(255),
    opening_hours VARCHAR(100) DEFAULT '07:30 - 17:00 (Thứ 2 - Thứ 6)',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_facility_coords ON medical_facilities(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_facility_specialty_city ON medical_facilities(specialty, city);

-- 3.9. Table: system_audit_logs
CREATE TABLE IF NOT EXISTS system_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    status_code INTEGER,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_action_created ON system_audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_user_created ON system_audit_logs(user_id, created_at DESC);

-- 3.10. Table: notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type notification_type_enum NOT NULL DEFAULT 'SCREENING_REMINDER',
    priority notification_priority_enum NOT NULL DEFAULT 'NORMAL',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(255),
    read_at TIMESTAMP WITH TIME ZONE,
    metadata_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);

-- 4. Initial Seed Data: Major Specialized Medical Facilities in Vietnam
INSERT INTO medical_facilities (name, specialty, facility_tier, address, city, latitude, longitude, phone, emergency_phone, website)
VALUES 
    (
        'Bệnh viện Bạch Mai - Viện Tim mạch & Khoa Nội tiết',
        'CARDIOLOGY',
        'CENTRAL',
        '78 Giải Phóng, Phương Mai, Đống Đa, Hà Nội',
        'Hà Nội',
        20.999863,
        105.840742,
        '024 3869 3731',
        '115',
        'http://bachmai.gov.vn'
    ),
    (
        'Bệnh viện Nội tiết Trung ương (Cơ sở Tứ Hiệp)',
        'ENDOCRINOLOGY',
        'CENTRAL',
        'Đường gom cầu Tứ Hiệp, Tứ Hiệp, Thanh Trì, Hà Nội',
        'Hà Nội',
        20.948281,
        105.862143,
        '024 3861 6009',
        '024 3861 6009',
        'http://benhviennoitiet.vn'
    ),
    (
        'Bệnh viện Tim Hà Nội (Cơ sở 1)',
        'CARDIOLOGY',
        'PROVINCIAL',
        '92 Trần Hưng Đạo, Cửa Nam, Hoàn Kiếm, Hà Nội',
        'Hà Nội',
        21.023472,
        105.845941,
        '024 3942 2430',
        '024 3942 0046',
        'http://benhvientimhanoi.vn'
    ),
    (
        'Bệnh viện Trung ương Quân đội 108 - Trung tâm Đột quỵ Não',
        'STROKE_NEUROLOGY',
        'CENTRAL',
        'Số 1 Trần Hưng Đạo, Bạch Đằng, Hai Bà Trưng, Hà Nội',
        'Hà Nội',
        21.018241,
        105.860153,
        '069 572 400',
        '069 555 283',
        'http://benhvien108.vn'
    ),
    (
        'Bệnh viện Chợ Rẫy - Khoa Nội tiết & Can thiệp Mạch máu',
        'GENERAL_HOSPITAL',
        'CENTRAL',
        '201B Nguyễn Chí Thanh, Phường 12, Quận 5, TP. Hồ Chí Minh',
        'TP. Hồ Chí Minh',
        10.757829,
        106.659556,
        '028 3855 4137',
        '028 3855 4138',
        'http://choray.vn'
    ),
    (
        'Bệnh viện Đại học Y Dược TP. Hồ Chí Minh',
        'ENDOCRINOLOGY',
        'CENTRAL',
        '215 Hồng Bàng, Phường 11, Quận 5, TP. Hồ Chí Minh',
        'TP. Hồ Chí Minh',
        10.755431,
        106.662842,
        '028 3855 4269',
        '028 3952 5355',
        'http://bvdaihoc.com.vn'
    )
ON CONFLICT DO NOTHING;

-- 5. Initial Seed Data: 5 Pre-Trained Machine Learning Models (Model Registry)
INSERT INTO ml_models (
    disease_type, version, model_name, algorithm, dataset_source,
    optimal_threshold, roc_auc, recall, f1_score, precision_metric,
    features_order, risk_levels_config, is_active
) VALUES
    (
        'diabetes_binary', '1.0.0', 'XGBoost Lifestyle Diabetes Risk Classifier',
        'XGBoost + CalibratedClassifierCV (Isotonic)', 'CDC BRFSS 2015 (~253,680 records)',
        0.1050, 0.8373, 0.8500, 0.4405, 0.3012,
        '["HighBP", "HighChol", "CholCheck", "BMI", "Smoker", "Stroke", "HeartDiseaseorAttack", "PhysActivity", "Fruits", "Veggies", "HvyAlcoholConsump", "AnyHealthcare", "NoDocbcCost", "GenHlth", "MentHlth", "PhysHlth", "DiffWalk", "Sex", "Age", "Education", "Income"]'::jsonb,
        '{"low": [0.0, 0.084], "medium": [0.084, 0.158], "high": [0.158, 1.0]}'::jsonb,
        TRUE
    ),
    (
        'hypertension', '1.0.0', 'XGBoost Chronic Hypertension Risk Classifier',
        'XGBoost + CalibratedClassifierCV (Isotonic)', 'CDC BRFSS 2015 (~253,680 records)',
        0.4813, 0.8044, 0.6970, 0.7420, 0.7930,
        '["HighChol", "CholCheck", "BMI", "Smoker", "CVD_Risk", "Stroke", "HeartDiseaseorAttack", "PhysActivity", "Fruits", "Veggies", "HvyAlcoholConsump", "AnyHealthcare", "NoDocbcCost", "GenHlth", "MentHlth", "PhysHlth", "DiffWalk", "Sex", "Age", "Education", "Income"]'::jsonb,
        '{"low": [0.0, 0.385], "medium": [0.385, 0.722], "high": [0.722, 1.0]}'::jsonb,
        TRUE
    ),
    (
        'cardiovascular', '1.0.0', 'XGBoost Cardiovascular Disease Risk Classifier',
        'XGBoost + CalibratedClassifierCV (Isotonic)', 'CDC BRFSS 2015 (~253,680 records)',
        0.0911, 0.8425, 0.8100, 0.3850, 0.2520,
        '["HighBP", "HighChol", "CholCheck", "BMI", "Smoker", "Stroke", "PhysActivity", "Fruits", "Veggies", "HvyAlcoholConsump", "AnyHealthcare", "NoDocbcCost", "GenHlth", "MentHlth", "PhysHlth", "DiffWalk", "Sex", "Age", "Education", "Income"]'::jsonb,
        '{"low": [0.0, 0.073], "medium": [0.073, 0.137], "high": [0.137, 1.0]}'::jsonb,
        TRUE
    ),
    (
        'stroke', '1.0.0', 'XGBoost Stroke / Cerebrovascular Event Classifier',
        'XGBoost + CalibratedClassifierCV (Isotonic)', 'CDC BRFSS 2015 (~253,680 records)',
        0.0367, 0.8167, 0.7980, 0.2210, 0.1310,
        '["HighBP", "HighChol", "CholCheck", "BMI", "Smoker", "HeartDiseaseorAttack", "PhysActivity", "Fruits", "Veggies", "HvyAlcoholConsump", "AnyHealthcare", "NoDocbcCost", "GenHlth", "MentHlth", "PhysHlth", "DiffWalk", "Sex", "Age", "Education", "Income"]'::jsonb,
        '{"low": [0.0, 0.029], "medium": [0.029, 0.055], "high": [0.055, 1.0]}'::jsonb,
        TRUE
    ),
    (
        'diabetes_clinical', '1.0.0', 'XGBoost Clinical Diabetes Classifier (Pima Indians)',
        'XGBoost + CalibratedClassifierCV (Isotonic)', 'NIDDK Pima Indians Diabetes (768 records)',
        0.2645, 0.8377, 0.7320, 0.6550, 0.5920,
        '["Pregnancies", "Glucose", "BloodPressure", "SkinThickness", "Insulin", "BMI", "DiabetesPedigreeFunction", "Age"]'::jsonb,
        '{"low": [0.0, 0.212], "medium": [0.212, 0.397], "high": [0.397, 1.0]}'::jsonb,
        TRUE
    )
ON CONFLICT (disease_type, version) DO NOTHING;
