CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    date_of_birth DATE NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name VARCHAR(200) NOT NULL UNIQUE,
    stock_quantity INTEGER NOT NULL DEFAULT 0 CHECK (stock_quantity >= 0),
    unit_price DECIMAL(10, 2) NOT NULL CHECK (unit_price >= 0),
    description TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    patient_id UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
    medication_name VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN (
            'pending',
            'filled',
            'picked-up'
        )
    ),
    instructions TEXT,
    prescribed_by VARCHAR(100),
    total_amount DECIMAL(10, 2) CHECK (total_amount >= 0),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    patient_id UUID NOT NULL UNIQUE REFERENCES patients (id) ON DELETE CASCADE,
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    wallet_id UUID NOT NULL REFERENCES wallets (id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount >= 0),
    description VARCHAR(255) NOT NULL,
    reference_id UUID,
    balance_before DECIMAL(15, 2) NOT NULL CHECK (balance_before >= 0),
    balance_after DECIMAL(15, 2) NOT NULL CHECK (balance_after >= 0),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Create appointment_slots table
CREATE TABLE IF NOT EXISTS appointment_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    service_type VARCHAR(20) NOT NULL CHECK (
        service_type IN ('consultation', 'pickup')
    ),
    status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (
        status IN (
            'available',
            'booked',
            'cancelled',
            'completed'
        )
    ),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        CONSTRAINT unique_time_slot UNIQUE (date, start_time, end_time)
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    patient_id UUID NOT NULL REFERENCES patients (id) ON DELETE CASCADE,
    slot_id UUID NOT NULL REFERENCES appointment_slots (id) ON DELETE CASCADE,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'booked' CHECK (
        status IN (
            'booked',
            'cancelled',
            'completed'
        )
    ),
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_email ON patients (email);

CREATE INDEX IF NOT EXISTS idx_patients_name ON patients (name);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions (patient_id);

CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions (status);

CREATE INDEX IF NOT EXISTS idx_prescriptions_medication_name ON prescriptions (medication_name);

CREATE INDEX IF NOT EXISTS idx_medications_name ON medications (name);

CREATE INDEX IF NOT EXISTS idx_medications_stock_quantity ON medications (stock_quantity);

CREATE INDEX IF NOT EXISTS idx_wallets_patient_id ON wallets (patient_id);

CREATE INDEX IF NOT EXISTS idx_transactions_wallet_id ON transactions (wallet_id);

CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

CREATE INDEX IF NOT EXISTS idx_transactions_reference_id ON transactions (reference_id);

CREATE INDEX IF NOT EXISTS idx_appointment_slots_date ON appointment_slots (date);

CREATE INDEX IF NOT EXISTS idx_appointment_slots_status ON appointment_slots (status);

CREATE INDEX IF NOT EXISTS idx_appointment_slots_service_type ON appointment_slots (service_type);

CREATE INDEX IF NOT EXISTS idx_bookings_patient_id ON bookings (patient_id);

CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON bookings (slot_id);

CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings (status);

-- Insert sample data
INSERT INTO
    patients (
        name,
        email,
        phone,
        date_of_birth
    )
VALUES (
        'John Doe',
        'john.doe@email.com',
        '+1234567890',
        '1985-03-15'
    ),
    (
        'Jane Smith',
        'jane.smith@email.com',
        '+1234567891',
        '1990-07-22'
    ),
    (
        'Michael Johnson',
        'michael.j@email.com',
        '+1234567892',
        '1978-11-08'
    ),
    (
        'Sarah Wilson',
        'sarah.wilson@email.com',
        '+1234567893',
        '1992-05-12'
    );

INSERT INTO
    medications (
        name,
        stock_quantity,
        unit_price,
        description
    )
VALUES (
        'Paracetamol 500mg',
        100,
        5.50,
        'Pain relief and fever reducer'
    ),
    (
        'Ibuprofen 400mg',
        75,
        8.20,
        'Anti-inflammatory pain reliever'
    ),
    (
        'Amoxicillin 250mg',
        50,
        12.00,
        'Antibiotic for bacterial infections'
    ),
    (
        'Lisinopril 10mg',
        8,
        15.75,
        'ACE inhibitor for blood pressure'
    ),
    (
        'Metformin 500mg',
        60,
        9.30,
        'Diabetes medication'
    ),
    (
        'Aspirin 81mg',
        120,
        3.25,
        'Low-dose aspirin for heart health'
    );

INSERT INTO
    wallets (patient_id, balance)
SELECT id, 100.00
FROM patients;

-- -- Insert sample appointment slots
-- INSERT INTO
--     appointment_slots (
--         date,
--         start_time,
--         end_time,
--         service_type,
--         status
--     )
-- VALUES (
--         '2024-12-25',
--         '09:00:00',
--         '09:30:00',
--         'consultation',
--         'available'
--     ),
--     (
--         '2024-12-25',
--         '09:30:00',
--         '10:00:00',
--         'consultation',
--         'available'
--     ),
--     (
--         '2024-12-25',
--         '10:00:00',
--         '10:30:00',
--         'pickup',
--         'available'
--     ),
--     (
--         '2024-12-25',
--         '10:30:00',
--         '11:00:00',
--         'pickup',
--         'available'
--     ),
--     (
--         '2024-12-25',
--         '11:00:00',
--         '11:30:00',
--         'consultation',
--         'available'
--     ),
--     (
--         '2024-12-26',
--         '09:00:00',
--         '09:30:00',
--         'consultation',
--         'available'
--     ),
--     (
--         '2024-12-26',
--         '09:30:00',
--         '10:00:00',
--         'pickup',
--         'available'
--     ),
--     (
--         '2024-12-26',
--         '10:00:00',
--         '10:30:00',
--         'consultation',
--         'available'
--     );