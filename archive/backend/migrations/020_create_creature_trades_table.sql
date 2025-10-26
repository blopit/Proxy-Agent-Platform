-- Migration 020: Create creature_trades table
-- Records of creature trades between users

CREATE TABLE IF NOT EXISTS creature_trades (
    trade_id TEXT PRIMARY KEY,

    -- Participants
    sender_user_id TEXT NOT NULL,
    receiver_user_id TEXT NOT NULL,

    -- Creatures involved
    sender_creature_id TEXT NOT NULL REFERENCES user_creatures(creature_id),
    receiver_creature_id TEXT REFERENCES user_creatures(creature_id),  -- NULL for gifts

    -- Trade status
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN (
        'PENDING', 'ACCEPTED', 'REJECTED', 'CANCELLED', 'COMPLETED'
    )),

    -- Optional message
    message TEXT,

    -- Timestamps
    offered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP  -- Auto-cancel after 7 days
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trades_sender ON creature_trades(sender_user_id, status);
CREATE INDEX IF NOT EXISTS idx_trades_receiver ON creature_trades(receiver_user_id, status);
CREATE INDEX IF NOT EXISTS idx_trades_status ON creature_trades(status, expires_at);
CREATE INDEX IF NOT EXISTS idx_trades_offered ON creature_trades(offered_at DESC);
