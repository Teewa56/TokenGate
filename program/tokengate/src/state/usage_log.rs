use anchor_lang::prelude::*;

#[account]
pub struct UsageLog {
    pub api_id: Pubkey,
    pub user: Pubkey,
    pub total_calls: u64,
    pub total_cost: u64,
    pub bump: u8,
}

impl UsageLog {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 8 + 1;
}