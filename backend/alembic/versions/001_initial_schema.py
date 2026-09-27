"""001_initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-27 21:18:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Custom Enums
    user_role_enum = postgresql.ENUM('USER', 'HEALTH_CONSULTANT', 'ADMIN', name='user_role_enum')
    user_role_enum.create(op.get_bind(), checkfirst=True)

    biological_sex_enum = postgresql.ENUM('MALE', 'FEMALE', 'OTHER', name='biological_sex_enum')
    biological_sex_enum.create(op.get_bind(), checkfirst=True)

    record_type_enum = postgresql.ENUM('LIFESTYLE_BRFSS', 'CLINICAL_PIMA', name='record_type_enum')
    record_type_enum.create(op.get_bind(), checkfirst=True)

    disease_type_enum = postgresql.ENUM(
        'diabetes_binary', 'hypertension', 'cardiovascular', 'stroke', 'diabetes_clinical',
        name='disease_type_enum'
    )
    disease_type_enum.create(op.get_bind(), checkfirst=True)

    risk_level_enum = postgresql.ENUM('LOW', 'MEDIUM', 'HIGH', name='risk_level_enum')
    risk_level_enum.create(op.get_bind(), checkfirst=True)

    message_sender_role_enum = postgresql.ENUM('user', 'assistant', 'system', name='message_sender_role_enum')
    message_sender_role_enum.create(op.get_bind(), checkfirst=True)

    facility_specialty_enum = postgresql.ENUM(
        'ENDOCRINOLOGY', 'CARDIOLOGY', 'STROKE_NEUROLOGY', 'GENERAL_HOSPITAL',
        name='facility_specialty_enum'
    )
    facility_specialty_enum.create(op.get_bind(), checkfirst=True)

    facility_tier_enum = postgresql.ENUM('CENTRAL', 'PROVINCIAL', 'DISTRICT', 'PRIVATE', name='facility_tier_enum')
    facility_tier_enum.create(op.get_bind(), checkfirst=True)

    notification_type_enum = postgresql.ENUM(
        'SCREENING_REMINDER', 'HIGH_RISK_ALERT', 'LIFESTYLE_GOAL', 'DOCTOR_NOTE', 'SYSTEM_ANNOUNCEMENT',
        name='notification_type_enum'
    )
    notification_type_enum.create(op.get_bind(), checkfirst=True)

    notification_priority_enum = postgresql.ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT', name='notification_priority_enum')
    notification_priority_enum.create(op.get_bind(), checkfirst=True)

    token_type_enum = postgresql.ENUM('REFRESH_TOKEN', 'PASSWORD_RESET', 'EMAIL_VERIFICATION', name='token_type_enum')
    token_type_enum.create(op.get_bind(), checkfirst=True)

    # 2. Table: users
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.Enum('USER', 'HEALTH_CONSULTANT', 'ADMIN', name='user_role_enum'), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_users_email', 'users', ['email'], unique=True)

    # 3. Table: patient_profiles
    op.create_table(
        'patient_profiles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True),
        sa.Column('full_name', sa.String(length=150), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.Enum('MALE', 'FEMALE', 'OTHER', name='biological_sex_enum'), nullable=True),
        sa.Column('height_cm', sa.Float(), nullable=True),
        sa.Column('weight_kg', sa.Float(), nullable=True),
        sa.Column('medical_history', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'{}'::jsonb")),
        sa.Column('emergency_contact', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('height_cm >= 40.0 AND height_cm <= 250.0', name='chk_valid_height'),
        sa.CheckConstraint('weight_kg >= 15.0 AND weight_kg <= 300.0', name='chk_valid_weight'),
    )
    op.create_index('idx_profiles_user_id', 'patient_profiles', ['user_id'])

    # 4. Table: user_auth_tokens
    op.create_table(
        'user_auth_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('token_hash', sa.String(length=255), nullable=False),
        sa.Column('token_type', sa.Enum('REFRESH_TOKEN', 'PASSWORD_RESET', 'EMAIL_VERIFICATION', name='token_type_enum'), nullable=False),
        sa.Column('is_revoked', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('user_agent', sa.String(length=255), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_tokens_token_hash', 'user_auth_tokens', ['token_hash'], unique=True)
    op.create_index('idx_tokens_user_type_revoked', 'user_auth_tokens', ['user_id', 'token_type', 'is_revoked'])
    op.create_index('idx_tokens_expires', 'user_auth_tokens', ['expires_at'])

    # 5. Table: ml_models
    op.create_table(
        'ml_models',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('disease_type', sa.Enum('diabetes_binary', 'hypertension', 'cardiovascular', 'stroke', 'diabetes_clinical', name='disease_type_enum'), nullable=False),
        sa.Column('version', sa.String(length=50), nullable=False),
        sa.Column('model_name', sa.String(length=150), nullable=False),
        sa.Column('algorithm', sa.String(length=100), nullable=False),
        sa.Column('dataset_source', sa.String(length=200), nullable=False),
        sa.Column('optimal_threshold', sa.Float(), nullable=False),
        sa.Column('roc_auc', sa.Float(), nullable=False),
        sa.Column('recall', sa.Float(), nullable=False),
        sa.Column('f1_score', sa.Float(), nullable=False),
        sa.Column('precision_metric', sa.Float(), nullable=True),
        sa.Column('features_order', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('risk_levels_config', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('artifact_path', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('trained_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint('disease_type', 'version', name='uq_model_disease_version'),
    )
    op.create_index('idx_models_disease_active', 'ml_models', ['disease_type', 'is_active'])

    # 6. Table: health_records
    op.create_table(
        'health_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('record_type', sa.Enum('LIFESTYLE_BRFSS', 'CLINICAL_PIMA', name='record_type_enum'), nullable=False),
        sa.Column('input_data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_records_user_created', 'health_records', ['user_id', sa.text('created_at DESC')])
    op.create_index('idx_records_input_data_gin', 'health_records', ['input_data'], postgresql_using='gin')

    # 5. Table: screening_results
    op.create_table(
        'screening_results',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('health_record_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('health_records.id', ondelete='CASCADE'), nullable=False),
        sa.Column('disease_type', sa.Enum('diabetes_binary', 'hypertension', 'cardiovascular', 'stroke', 'diabetes_clinical', name='disease_type_enum'), nullable=False),
        sa.Column('model_version', sa.String(length=50), nullable=False),
        sa.Column('risk_score', sa.Float(), nullable=False),
        sa.Column('risk_percentage', sa.Float(), nullable=False),
        sa.Column('risk_level', sa.Enum('LOW', 'MEDIUM', 'HIGH', name='risk_level_enum'), nullable=False),
        sa.Column('optimal_threshold', sa.Float(), nullable=False),
        sa.Column('shap_summary', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('top_risk_factors', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('recommendations', postgresql.JSONB(astext_type=sa.Text()), nullable=False, server_default=sa.text("'[]'::jsonb")),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.CheckConstraint('risk_score >= 0.0 AND risk_score <= 1.0', name='chk_valid_risk_score'),
        sa.CheckConstraint('risk_percentage >= 0.0 AND risk_percentage <= 100.0', name='chk_valid_risk_percentage'),
        sa.CheckConstraint('optimal_threshold >= 0.0 AND optimal_threshold <= 1.0', name='chk_valid_optimal_threshold'),
    )
    op.create_index('idx_screening_record_id', 'screening_results', ['health_record_id'])
    op.create_index('idx_screening_disease_risk', 'screening_results', ['disease_type', 'risk_level'])
    op.create_index('idx_screening_created', 'screening_results', [sa.text('created_at DESC')])
    op.create_index('idx_screening_shap_summary_gin', 'screening_results', ['shap_summary'], postgresql_using='gin')
    op.create_index('idx_screening_top_risk_gin', 'screening_results', ['top_risk_factors'], postgresql_using='gin')

    # 7. Table: screening_reviews
    op.create_table(
        'screening_reviews',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('screening_result_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('screening_results.id', ondelete='CASCADE'), nullable=False),
        sa.Column('consultant_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('clinical_notes', sa.Text(), nullable=False),
        sa.Column('lifestyle_advice', sa.Text(), nullable=True),
        sa.Column('recommended_action', sa.String(length=100), nullable=False, server_default=sa.text("'FOLLOW_UP_3_MONTHS'")),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_reviews_screening_created', 'screening_reviews', ['screening_result_id', sa.text('created_at DESC')])
    op.create_index('idx_reviews_consultant_created', 'screening_reviews', ['consultant_id', sa.text('created_at DESC')])

    # 8. Table: what_if_simulations
    op.create_table(
        'what_if_simulations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('screening_result_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('screening_results.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('original_risk_score', sa.Float(), nullable=False),
        sa.Column('simulated_risk_score', sa.Float(), nullable=False),
        sa.Column('delta_risk', sa.Float(), nullable=False),
        sa.Column('modified_features', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_whatif_user_created', 'what_if_simulations', ['user_id', sa.text('created_at DESC')])
    op.create_index('idx_whatif_screening', 'what_if_simulations', ['screening_result_id'])

    # 9. Table: ai_chat_sessions
    op.create_table(
        'ai_chat_sessions',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('screening_result_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('screening_results.id', ondelete='SET NULL'), nullable=True),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('is_archived', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_chat_session_user_created', 'ai_chat_sessions', ['user_id', sa.text('created_at DESC')])
    op.create_index('idx_chat_session_screening', 'ai_chat_sessions', ['screening_result_id'])

    # 10. Table: ai_chat_messages
    op.create_table(
        'ai_chat_messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('session_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('ai_chat_sessions.id', ondelete='CASCADE'), nullable=False),
        sa.Column('sender_role', sa.Enum('user', 'assistant', 'system', name='message_sender_role_enum'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('is_emergency_flag', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('tokens_used', sa.Integer(), nullable=False, server_default=sa.text('0')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_chat_message_session_created', 'ai_chat_messages', ['session_id', sa.text('created_at ASC')])

    # 11. Table: medical_facilities
    op.create_table(
        'medical_facilities',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('specialty', sa.Enum('ENDOCRINOLOGY', 'CARDIOLOGY', 'STROKE_NEUROLOGY', 'GENERAL_HOSPITAL', name='facility_specialty_enum'), nullable=False),
        sa.Column('facility_tier', sa.Enum('CENTRAL', 'PROVINCIAL', 'DISTRICT', 'PRIVATE', name='facility_tier_enum'), nullable=False),
        sa.Column('address', sa.String(length=255), nullable=False),
        sa.Column('city', sa.String(length=100), nullable=False, server_default=sa.text("'Hà Nội'")),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('emergency_phone', sa.String(length=50), nullable=True),
        sa.Column('website', sa.String(length=255), nullable=True),
        sa.Column('opening_hours', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('true')),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_facility_coords', 'medical_facilities', ['latitude', 'longitude'])
    op.create_index('idx_facility_specialty_city', 'medical_facilities', ['specialty', 'city'])

    # 12. Table: system_audit_logs
    op.create_table(
        'system_audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='SET NULL'), nullable=True),
        sa.Column('action', sa.String(length=100), nullable=False),
        sa.Column('resource', sa.String(length=255), nullable=True),
        sa.Column('ip_address', sa.String(length=45), nullable=True),
        sa.Column('user_agent', sa.String(length=255), nullable=True),
        sa.Column('status_code', sa.Integer(), nullable=True),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_audit_action_created', 'system_audit_logs', ['action', sa.text('created_at DESC')])
    op.create_index('idx_audit_user_created', 'system_audit_logs', ['user_id', sa.text('created_at DESC')])

    # 13. Table: notifications
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('notification_type', sa.Enum('SCREENING_REMINDER', 'HIGH_RISK_ALERT', 'LIFESTYLE_GOAL', 'DOCTOR_NOTE', 'SYSTEM_ANNOUNCEMENT', name='notification_type_enum'), nullable=False),
        sa.Column('priority', sa.Enum('LOW', 'NORMAL', 'HIGH', 'URGENT', name='notification_priority_enum'), nullable=False),
        sa.Column('is_read', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('action_url', sa.String(length=255), nullable=True),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('metadata_payload', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('idx_notifications_user_read_created', 'notifications', ['user_id', 'is_read', sa.text('created_at DESC')])
    op.create_index('idx_notifications_type', 'notifications', ['notification_type'])


def downgrade() -> None:
    op.drop_table('notifications')
    op.drop_table('system_audit_logs')
    op.drop_table('medical_facilities')
    op.drop_table('ai_chat_messages')
    op.drop_table('ai_chat_sessions')
    op.drop_table('what_if_simulations')
    op.drop_table('screening_reviews')
    op.drop_table('screening_results')
    op.drop_table('health_records')
    op.drop_table('ml_models')
    op.drop_table('user_auth_tokens')
    op.drop_table('patient_profiles')
    op.drop_table('users')

    # Drop custom enums
    op.execute('DROP TYPE IF EXISTS token_type_enum')
    op.execute('DROP TYPE IF EXISTS notification_priority_enum')
    op.execute('DROP TYPE IF EXISTS notification_type_enum')
    op.execute('DROP TYPE IF EXISTS facility_tier_enum')
    op.execute('DROP TYPE IF EXISTS facility_specialty_enum')
    op.execute('DROP TYPE IF EXISTS message_sender_role_enum')
    op.execute('DROP TYPE IF EXISTS risk_level_enum')
    op.execute('DROP TYPE IF EXISTS disease_type_enum')
    op.execute('DROP TYPE IF EXISTS record_type_enum')
    op.execute('DROP TYPE IF EXISTS biological_sex_enum')
    op.execute('DROP TYPE IF EXISTS user_role_enum')
