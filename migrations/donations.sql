-- Create donations table
CREATE TABLE donations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    donor_name VARCHAR(255),
    donor_email VARCHAR(255),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'IRR' CHECK (currency IN ('IRR', 'USD')),
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    payment_status VARCHAR(20) DEFAULT 'pending',
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(255),
    message TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX idx_donations_user_id ON donations(user_id);
CREATE INDEX idx_donations_payment_status ON donations(payment_status);
CREATE INDEX idx_donations_currency ON donations(currency);
CREATE INDEX idx_donations_created_at ON donations(created_at);
CREATE INDEX idx_donations_donor_email ON donations(donor_email);
CREATE INDEX idx_donations_transaction_id ON donations(transaction_id);

-- Add comments for documentation
COMMENT ON TABLE donations IS 'Stores donation records from users and anonymous donors';
COMMENT ON COLUMN donations.amount IS 'Donation amount in the specified currency';
COMMENT ON COLUMN donations.payment_status IS 'Status of the payment: pending, completed, failed, cancelled';
COMMENT ON COLUMN donations.is_anonymous IS 'Whether the donor wants to remain anonymous';
COMMENT ON COLUMN donations.message IS 'Optional message from the donor';
