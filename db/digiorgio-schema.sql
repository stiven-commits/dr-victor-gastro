-- Schema generated from Digiorgio PostgreSQL database.
-- Review before running in production. Prefer running on an empty database or after a backup.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE SEQUENCE IF NOT EXISTS "appointments_id_seq";
CREATE SEQUENCE IF NOT EXISTS "audit_logs_id_seq";
CREATE SEQUENCE IF NOT EXISTS "balloon_inventory_logs_id_seq";
CREATE SEQUENCE IF NOT EXISTS "balloon_patient_followups_id_seq";
CREATE SEQUENCE IF NOT EXISTS "exam_items_id_seq";
CREATE SEQUENCE IF NOT EXISTS "injectable_inventory_logs_id_seq";
CREATE SEQUENCE IF NOT EXISTS "inventory_consumptions_id_seq";
CREATE SEQUENCE IF NOT EXISTS "lead_treatments_id_seq";
CREATE SEQUENCE IF NOT EXISTS "leads_id_seq";
CREATE SEQUENCE IF NOT EXISTS "payments_id_seq";
CREATE SEQUENCE IF NOT EXISTS "treatment_inventory_rules_id_seq";
CREATE SEQUENCE IF NOT EXISTS "treatments_id_seq";
CREATE SEQUENCE IF NOT EXISTS "vademecum_items_id_seq";

CREATE TABLE IF NOT EXISTS "app_users" (
  "id" uuid DEFAULT gen_random_uuid() NOT NULL,
  "username" text NOT NULL,
  "full_name" text,
  "role" text DEFAULT 'user'::text NOT NULL,
  "permissions" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "password_hash" text NOT NULL,
  "must_change_password" boolean DEFAULT true NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "appointments" (
  "id" bigint DEFAULT nextval('appointments_id_seq'::regclass) NOT NULL,
  "google_event_id" text,
  "patient_id" bigint,
  "patient_name" text,
  "title" text NOT NULL,
  "start_time" timestamp with time zone NOT NULL,
  "end_time" timestamp with time zone NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "audit_logs" (
  "id" bigint DEFAULT nextval('audit_logs_id_seq'::regclass) NOT NULL,
  "username" text,
  "action" text NOT NULL,
  "entity_name" text,
  "entity_id" text,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "balloon_inventory_logs" (
  "id" bigint DEFAULT nextval('balloon_inventory_logs_id_seq'::regclass) NOT NULL,
  "brand_id" text NOT NULL,
  "quantity" integer NOT NULL,
  "movement_type" text NOT NULL,
  "lead_id" bigint,
  "patient_name" text,
  "notes" text,
  "registered_by" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "balloon_patient_followups" (
  "id" bigint DEFAULT nextval('balloon_patient_followups_id_seq'::regclass) NOT NULL,
  "lead_id" bigint NOT NULL,
  "brand_id" text NOT NULL,
  "assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
  "planned_days" integer NOT NULL,
  "due_at" timestamp with time zone NOT NULL,
  "status" text DEFAULT 'active'::text NOT NULL,
  "retired_at" timestamp with time zone,
  "notes" text,
  "source_log_id" bigint,
  "created_by" text,
  "updated_by" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "exam_items" (
  "id" bigint DEFAULT nextval('exam_items_id_seq'::regclass) NOT NULL,
  "name" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "injectable_inventory_logs" (
  "id" bigint DEFAULT nextval('injectable_inventory_logs_id_seq'::regclass) NOT NULL,
  "injectable_id" text NOT NULL,
  "quantity" integer NOT NULL,
  "movement_type" text NOT NULL,
  "lead_id" bigint,
  "patient_name" text,
  "notes" text,
  "registered_by" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "inventory_consumptions" (
  "id" bigint DEFAULT nextval('inventory_consumptions_id_seq'::regclass) NOT NULL,
  "lead_id" bigint,
  "lead_treatment_id" bigint,
  "treatment_id" bigint,
  "treatment_name" text,
  "inventory_type" text NOT NULL,
  "inventory_item_id" text NOT NULL,
  "quantity" integer NOT NULL,
  "action" text NOT NULL,
  "patient_name" text,
  "notes" text,
  "balloon_log_id" bigint,
  "injectable_log_id" bigint,
  "created_by" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "lead_treatments" (
  "id" bigint DEFAULT nextval('lead_treatments_id_seq'::regclass) NOT NULL,
  "lead_id" bigint NOT NULL,
  "treatment_id" bigint,
  "treatment_name" text NOT NULL,
  "base_price" numeric(10,2) DEFAULT 0 NOT NULL,
  "agreed_price" numeric(10,2) DEFAULT 0 NOT NULL,
  "adjustment_usd" numeric(10,2) DEFAULT 0 NOT NULL,
  "payment_status" text DEFAULT 'Pendiente'::text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "leads" (
  "id" bigint DEFAULT nextval('leads_id_seq'::regclass) NOT NULL,
  "name" text NOT NULL,
  "phone" text NOT NULL,
  "email" text,
  "username" text,
  "treatment" text,
  "is_contacted" boolean DEFAULT false NOT NULL,
  "is_patient" boolean DEFAULT false NOT NULL,
  "cedula" text,
  "edad" integer,
  "sexo" text,
  "initial_weight" numeric(8,2),
  "final_weight" numeric(8,2),
  "height" numeric(6,2),
  "bmi" numeric(6,2),
  "medical_history" text,
  "state" text,
  "address" text,
  "smokes" text,
  "asthmatic" text,
  "allergic" text,
  "allergies_detail" text,
  "guardian_name" text,
  "guardian_cedula" text,
  "consent_log" text,
  "notes" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "weight_history" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "medical_reports" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "medical_recipes" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "updated_by" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  "medical_files" jsonb DEFAULT '[]'::jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS "payments" (
  "id" bigint DEFAULT nextval('payments_id_seq'::regclass) NOT NULL,
  "lead_treatment_id" bigint NOT NULL,
  "amount_usd" numeric(10,2) NOT NULL,
  "amount_bs" numeric(12,2),
  "payment_method" text NOT NULL,
  "reference_number" text,
  "exchange_rate_bcv" numeric(12,4),
  "payment_date" timestamp with time zone DEFAULT now() NOT NULL,
  "registered_by" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "treatment_inventory_rules" (
  "id" bigint DEFAULT nextval('treatment_inventory_rules_id_seq'::regclass) NOT NULL,
  "treatment_id" bigint NOT NULL,
  "inventory_type" text NOT NULL,
  "inventory_item_id" text NOT NULL,
  "quantity" integer DEFAULT 1 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "treatments" (
  "id" bigint DEFAULT nextval('treatments_id_seq'::regclass) NOT NULL,
  "name" text NOT NULL,
  "price" numeric(10,2) DEFAULT 0 NOT NULL,
  "requires_consent" boolean DEFAULT true NOT NULL,
  "requires_anesthesia" boolean DEFAULT false NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "vademecum_items" (
  "id" bigint DEFAULT nextval('vademecum_items_id_seq'::regclass) NOT NULL,
  "name" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE appointments DROP CONSTRAINT IF EXISTS "appointments_pkey";
ALTER TABLE appointments ADD CONSTRAINT "appointments_pkey" PRIMARY KEY (id);
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS "app_users_pkey";
ALTER TABLE app_users ADD CONSTRAINT "app_users_pkey" PRIMARY KEY (id);
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS "audit_logs_pkey";
ALTER TABLE audit_logs ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY (id);
ALTER TABLE balloon_inventory_logs DROP CONSTRAINT IF EXISTS "balloon_inventory_logs_pkey";
ALTER TABLE balloon_inventory_logs ADD CONSTRAINT "balloon_inventory_logs_pkey" PRIMARY KEY (id);
ALTER TABLE balloon_patient_followups DROP CONSTRAINT IF EXISTS "balloon_patient_followups_pkey";
ALTER TABLE balloon_patient_followups ADD CONSTRAINT "balloon_patient_followups_pkey" PRIMARY KEY (id);
ALTER TABLE exam_items DROP CONSTRAINT IF EXISTS "exam_items_pkey";
ALTER TABLE exam_items ADD CONSTRAINT "exam_items_pkey" PRIMARY KEY (id);
ALTER TABLE injectable_inventory_logs DROP CONSTRAINT IF EXISTS "injectable_inventory_logs_pkey";
ALTER TABLE injectable_inventory_logs ADD CONSTRAINT "injectable_inventory_logs_pkey" PRIMARY KEY (id);
ALTER TABLE inventory_consumptions DROP CONSTRAINT IF EXISTS "inventory_consumptions_pkey";
ALTER TABLE inventory_consumptions ADD CONSTRAINT "inventory_consumptions_pkey" PRIMARY KEY (id);
ALTER TABLE leads DROP CONSTRAINT IF EXISTS "leads_pkey";
ALTER TABLE leads ADD CONSTRAINT "leads_pkey" PRIMARY KEY (id);
ALTER TABLE lead_treatments DROP CONSTRAINT IF EXISTS "lead_treatments_pkey";
ALTER TABLE lead_treatments ADD CONSTRAINT "lead_treatments_pkey" PRIMARY KEY (id);
ALTER TABLE payments DROP CONSTRAINT IF EXISTS "payments_pkey";
ALTER TABLE payments ADD CONSTRAINT "payments_pkey" PRIMARY KEY (id);
ALTER TABLE treatment_inventory_rules DROP CONSTRAINT IF EXISTS "treatment_inventory_rules_pkey";
ALTER TABLE treatment_inventory_rules ADD CONSTRAINT "treatment_inventory_rules_pkey" PRIMARY KEY (id);
ALTER TABLE treatments DROP CONSTRAINT IF EXISTS "treatments_pkey";
ALTER TABLE treatments ADD CONSTRAINT "treatments_pkey" PRIMARY KEY (id);
ALTER TABLE vademecum_items DROP CONSTRAINT IF EXISTS "vademecum_items_pkey";
ALTER TABLE vademecum_items ADD CONSTRAINT "vademecum_items_pkey" PRIMARY KEY (id);
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS "appointments_google_event_id_key";
ALTER TABLE appointments ADD CONSTRAINT "appointments_google_event_id_key" UNIQUE (google_event_id);
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS "app_users_username_key";
ALTER TABLE app_users ADD CONSTRAINT "app_users_username_key" UNIQUE (username);
ALTER TABLE exam_items DROP CONSTRAINT IF EXISTS "exam_items_name_key";
ALTER TABLE exam_items ADD CONSTRAINT "exam_items_name_key" UNIQUE (name);
ALTER TABLE treatments DROP CONSTRAINT IF EXISTS "treatments_name_key";
ALTER TABLE treatments ADD CONSTRAINT "treatments_name_key" UNIQUE (name);
ALTER TABLE vademecum_items DROP CONSTRAINT IF EXISTS "vademecum_items_name_key";
ALTER TABLE vademecum_items ADD CONSTRAINT "vademecum_items_name_key" UNIQUE (name);
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS "app_users_role_check";
ALTER TABLE app_users ADD CONSTRAINT "app_users_role_check" CHECK ((role = ANY (ARRAY['admin'::text, 'user'::text])));
ALTER TABLE balloon_inventory_logs DROP CONSTRAINT IF EXISTS "balloon_inventory_logs_movement_type_check";
ALTER TABLE balloon_inventory_logs ADD CONSTRAINT "balloon_inventory_logs_movement_type_check" CHECK ((movement_type = ANY (ARRAY['entry'::text, 'exit'::text])));
ALTER TABLE balloon_inventory_logs DROP CONSTRAINT IF EXISTS "balloon_inventory_logs_quantity_check";
ALTER TABLE balloon_inventory_logs ADD CONSTRAINT "balloon_inventory_logs_quantity_check" CHECK ((quantity > 0));
ALTER TABLE balloon_patient_followups DROP CONSTRAINT IF EXISTS "balloon_patient_followups_planned_days_check";
ALTER TABLE balloon_patient_followups ADD CONSTRAINT "balloon_patient_followups_planned_days_check" CHECK ((planned_days > 0));
ALTER TABLE balloon_patient_followups DROP CONSTRAINT IF EXISTS "balloon_patient_followups_status_check";
ALTER TABLE balloon_patient_followups ADD CONSTRAINT "balloon_patient_followups_status_check" CHECK ((status = ANY (ARRAY['active'::text, 'retired'::text])));
ALTER TABLE injectable_inventory_logs DROP CONSTRAINT IF EXISTS "injectable_inventory_logs_movement_type_check";
ALTER TABLE injectable_inventory_logs ADD CONSTRAINT "injectable_inventory_logs_movement_type_check" CHECK ((movement_type = ANY (ARRAY['entry'::text, 'exit'::text])));
ALTER TABLE injectable_inventory_logs DROP CONSTRAINT IF EXISTS "injectable_inventory_logs_quantity_check";
ALTER TABLE injectable_inventory_logs ADD CONSTRAINT "injectable_inventory_logs_quantity_check" CHECK ((quantity > 0));
ALTER TABLE inventory_consumptions DROP CONSTRAINT IF EXISTS "inventory_consumptions_action_check";
ALTER TABLE inventory_consumptions ADD CONSTRAINT "inventory_consumptions_action_check" CHECK ((action = ANY (ARRAY['consume'::text, 'revert'::text])));
ALTER TABLE inventory_consumptions DROP CONSTRAINT IF EXISTS "inventory_consumptions_inventory_type_check";
ALTER TABLE inventory_consumptions ADD CONSTRAINT "inventory_consumptions_inventory_type_check" CHECK ((inventory_type = ANY (ARRAY['balloon'::text, 'injectable'::text])));
ALTER TABLE inventory_consumptions DROP CONSTRAINT IF EXISTS "inventory_consumptions_quantity_check";
ALTER TABLE inventory_consumptions ADD CONSTRAINT "inventory_consumptions_quantity_check" CHECK ((quantity > 0));
ALTER TABLE treatment_inventory_rules DROP CONSTRAINT IF EXISTS "treatment_inventory_rules_inventory_type_check";
ALTER TABLE treatment_inventory_rules ADD CONSTRAINT "treatment_inventory_rules_inventory_type_check" CHECK ((inventory_type = ANY (ARRAY['balloon'::text, 'injectable'::text])));
ALTER TABLE treatment_inventory_rules DROP CONSTRAINT IF EXISTS "treatment_inventory_rules_quantity_check";
ALTER TABLE treatment_inventory_rules ADD CONSTRAINT "treatment_inventory_rules_quantity_check" CHECK ((quantity > 0));
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS "appointments_patient_id_fkey";
ALTER TABLE appointments ADD CONSTRAINT "appointments_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES leads(id) ON DELETE SET NULL;
ALTER TABLE balloon_inventory_logs DROP CONSTRAINT IF EXISTS "balloon_inventory_logs_lead_id_fkey";
ALTER TABLE balloon_inventory_logs ADD CONSTRAINT "balloon_inventory_logs_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
ALTER TABLE balloon_patient_followups DROP CONSTRAINT IF EXISTS "balloon_patient_followups_lead_id_fkey";
ALTER TABLE balloon_patient_followups ADD CONSTRAINT "balloon_patient_followups_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
ALTER TABLE balloon_patient_followups DROP CONSTRAINT IF EXISTS "balloon_patient_followups_source_log_id_fkey";
ALTER TABLE balloon_patient_followups ADD CONSTRAINT "balloon_patient_followups_source_log_id_fkey" FOREIGN KEY (source_log_id) REFERENCES balloon_inventory_logs(id) ON DELETE SET NULL;
ALTER TABLE injectable_inventory_logs DROP CONSTRAINT IF EXISTS "injectable_inventory_logs_lead_id_fkey";
ALTER TABLE injectable_inventory_logs ADD CONSTRAINT "injectable_inventory_logs_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
ALTER TABLE inventory_consumptions DROP CONSTRAINT IF EXISTS "inventory_consumptions_balloon_log_id_fkey";
ALTER TABLE inventory_consumptions ADD CONSTRAINT "inventory_consumptions_balloon_log_id_fkey" FOREIGN KEY (balloon_log_id) REFERENCES balloon_inventory_logs(id) ON DELETE SET NULL;
ALTER TABLE inventory_consumptions DROP CONSTRAINT IF EXISTS "inventory_consumptions_injectable_log_id_fkey";
ALTER TABLE inventory_consumptions ADD CONSTRAINT "inventory_consumptions_injectable_log_id_fkey" FOREIGN KEY (injectable_log_id) REFERENCES injectable_inventory_logs(id) ON DELETE SET NULL;
ALTER TABLE inventory_consumptions DROP CONSTRAINT IF EXISTS "inventory_consumptions_lead_id_fkey";
ALTER TABLE inventory_consumptions ADD CONSTRAINT "inventory_consumptions_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL;
ALTER TABLE inventory_consumptions DROP CONSTRAINT IF EXISTS "inventory_consumptions_lead_treatment_id_fkey";
ALTER TABLE inventory_consumptions ADD CONSTRAINT "inventory_consumptions_lead_treatment_id_fkey" FOREIGN KEY (lead_treatment_id) REFERENCES lead_treatments(id) ON DELETE SET NULL;
ALTER TABLE inventory_consumptions DROP CONSTRAINT IF EXISTS "inventory_consumptions_treatment_id_fkey";
ALTER TABLE inventory_consumptions ADD CONSTRAINT "inventory_consumptions_treatment_id_fkey" FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE SET NULL;
ALTER TABLE lead_treatments DROP CONSTRAINT IF EXISTS "lead_treatments_lead_id_fkey";
ALTER TABLE lead_treatments ADD CONSTRAINT "lead_treatments_lead_id_fkey" FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
ALTER TABLE lead_treatments DROP CONSTRAINT IF EXISTS "lead_treatments_treatment_id_fkey";
ALTER TABLE lead_treatments ADD CONSTRAINT "lead_treatments_treatment_id_fkey" FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE SET NULL;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS "payments_lead_treatment_id_fkey";
ALTER TABLE payments ADD CONSTRAINT "payments_lead_treatment_id_fkey" FOREIGN KEY (lead_treatment_id) REFERENCES lead_treatments(id) ON DELETE CASCADE;
ALTER TABLE treatment_inventory_rules DROP CONSTRAINT IF EXISTS "treatment_inventory_rules_treatment_id_fkey";
ALTER TABLE treatment_inventory_rules ADD CONSTRAINT "treatment_inventory_rules_treatment_id_fkey" FOREIGN KEY (treatment_id) REFERENCES treatments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_appointments_start_time ON public.appointments USING btree (start_time);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_brand_created ON public.balloon_inventory_logs USING btree (brand_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_balloon_followups_lead ON public.balloon_patient_followups USING btree (lead_id, assigned_at DESC);
CREATE INDEX IF NOT EXISTS idx_balloon_followups_status_due ON public.balloon_patient_followups USING btree (status, due_at);
CREATE INDEX IF NOT EXISTS idx_exam_items_name ON public.exam_items USING btree (name);
CREATE INDEX IF NOT EXISTS idx_injectable_inventory_created ON public.injectable_inventory_logs USING btree (injectable_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_consumptions_inventory_item ON public.inventory_consumptions USING btree (inventory_type, inventory_item_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inventory_consumptions_lead_treatment ON public.inventory_consumptions USING btree (lead_treatment_id, created_at DESC);
CREATE UNIQUE INDEX uq_inventory_consumption_action ON public.inventory_consumptions USING btree (lead_treatment_id, inventory_type, inventory_item_id, action);
CREATE INDEX IF NOT EXISTS idx_lead_treatments_lead_id ON public.lead_treatments USING btree (lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_treatments_status ON public.lead_treatments USING btree (payment_status);
CREATE INDEX IF NOT EXISTS idx_leads_cedula ON public.leads USING btree (cedula);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads USING btree (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads USING btree (phone);
CREATE INDEX IF NOT EXISTS idx_payments_lead_treatment_id ON public.payments USING btree (lead_treatment_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON public.payments USING btree (payment_date DESC);
CREATE UNIQUE INDEX uq_treatment_inventory_rule ON public.treatment_inventory_rules USING btree (treatment_id, inventory_type, inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_vademecum_items_name ON public.vademecum_items USING btree (name);

DROP VIEW IF EXISTS "v_balloon_inventory_summary";
CREATE VIEW "v_balloon_inventory_summary" AS
SELECT brand_id,
    COALESCE(sum(
        CASE
            WHEN (movement_type = 'entry'::text) THEN quantity
            ELSE 0
        END), (0)::bigint) AS total_entries,
    COALESCE(sum(
        CASE
            WHEN (movement_type = 'exit'::text) THEN quantity
            ELSE 0
        END), (0)::bigint) AS total_exits,
    COALESCE(sum(
        CASE
            WHEN (movement_type = 'entry'::text) THEN quantity
            ELSE (- quantity)
        END), (0)::bigint) AS current_stock
   FROM balloon_inventory_logs
  GROUP BY brand_id;

DROP VIEW IF EXISTS "v_finances";
CREATE VIEW "v_finances" AS
SELECT lt.id AS lead_treatment_id,
    lt.lead_id,
    l.name AS patient_name,
    l.cedula,
    l.state,
    lt.treatment_id,
    lt.treatment_name,
    lt.base_price,
    lt.agreed_price,
    lt.adjustment_usd,
    COALESCE(sum(p.amount_usd), (0)::numeric) AS amount_paid,
    (lt.agreed_price - COALESCE(sum(p.amount_usd), (0)::numeric)) AS balance,
        CASE
            WHEN ((lt.agreed_price - COALESCE(sum(p.amount_usd), (0)::numeric)) <= (0)::numeric) THEN 'Pagado'::text
            WHEN (COALESCE(sum(p.amount_usd), (0)::numeric) > (0)::numeric) THEN 'Parcial'::text
            ELSE 'Pendiente'::text
        END AS payment_status,
    lt.created_at,
    jsonb_agg(jsonb_build_object('id', p.id, 'amount_usd', p.amount_usd, 'amount_bs', p.amount_bs, 'payment_method', p.payment_method, 'reference_number', p.reference_number, 'exchange_rate_bcv', p.exchange_rate_bcv, 'payment_date', p.payment_date, 'registered_by', p.registered_by) ORDER BY p.payment_date) FILTER (WHERE (p.id IS NOT NULL)) AS payments_history
   FROM ((lead_treatments lt
     JOIN leads l ON ((l.id = lt.lead_id)))
     LEFT JOIN payments p ON ((p.lead_treatment_id = lt.id)))
  GROUP BY lt.id, l.id;

DROP VIEW IF EXISTS "v_injectable_inventory_summary";
CREATE VIEW "v_injectable_inventory_summary" AS
SELECT injectable_id,
    COALESCE(sum(
        CASE
            WHEN (movement_type = 'entry'::text) THEN quantity
            ELSE 0
        END), (0)::bigint) AS total_entries,
    COALESCE(sum(
        CASE
            WHEN (movement_type = 'exit'::text) THEN quantity
            ELSE 0
        END), (0)::bigint) AS total_exits,
    COALESCE(sum(
        CASE
            WHEN (movement_type = 'entry'::text) THEN quantity
            ELSE (- quantity)
        END), (0)::bigint) AS current_stock
   FROM injectable_inventory_logs
  GROUP BY injectable_id;

DROP TRIGGER IF EXISTS "trg_set_updated_at_appointments" ON appointments;
CREATE TRIGGER trg_set_updated_at_appointments BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS "trg_set_updated_at_app_users" ON app_users;
CREATE TRIGGER trg_set_updated_at_app_users BEFORE UPDATE ON public.app_users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS "trg_set_updated_at_balloon_patient_followups" ON balloon_patient_followups;
CREATE TRIGGER trg_set_updated_at_balloon_patient_followups BEFORE UPDATE ON public.balloon_patient_followups FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS "trg_set_updated_at_exam_items" ON exam_items;
CREATE TRIGGER trg_set_updated_at_exam_items BEFORE UPDATE ON public.exam_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS "trg_set_updated_at_leads" ON leads;
CREATE TRIGGER trg_set_updated_at_leads BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS "trg_set_updated_at_lead_treatments" ON lead_treatments;
CREATE TRIGGER trg_set_updated_at_lead_treatments BEFORE UPDATE ON public.lead_treatments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS "trg_set_updated_at_treatments" ON treatments;
CREATE TRIGGER trg_set_updated_at_treatments BEFORE UPDATE ON public.treatments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS "trg_set_updated_at_vademecum_items" ON vademecum_items;
CREATE TRIGGER trg_set_updated_at_vademecum_items BEFORE UPDATE ON public.vademecum_items FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER SEQUENCE "appointments_id_seq" OWNED BY "appointments"."id";
ALTER SEQUENCE "audit_logs_id_seq" OWNED BY "audit_logs"."id";
ALTER SEQUENCE "balloon_inventory_logs_id_seq" OWNED BY "balloon_inventory_logs"."id";
ALTER SEQUENCE "balloon_patient_followups_id_seq" OWNED BY "balloon_patient_followups"."id";
ALTER SEQUENCE "exam_items_id_seq" OWNED BY "exam_items"."id";
ALTER SEQUENCE "injectable_inventory_logs_id_seq" OWNED BY "injectable_inventory_logs"."id";
ALTER SEQUENCE "inventory_consumptions_id_seq" OWNED BY "inventory_consumptions"."id";
ALTER SEQUENCE "lead_treatments_id_seq" OWNED BY "lead_treatments"."id";
ALTER SEQUENCE "leads_id_seq" OWNED BY "leads"."id";
ALTER SEQUENCE "payments_id_seq" OWNED BY "payments"."id";
ALTER SEQUENCE "treatment_inventory_rules_id_seq" OWNED BY "treatment_inventory_rules"."id";
ALTER SEQUENCE "treatments_id_seq" OWNED BY "treatments"."id";
ALTER SEQUENCE "vademecum_items_id_seq" OWNED BY "vademecum_items"."id";

COMMIT;
