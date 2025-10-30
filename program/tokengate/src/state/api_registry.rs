use anchor_lang::prelude::*;

#[account]
pub struct ApiRegistry {
    pub owner: Pubkey,
    pub name: String,
    pub backend_url: String,
    pub rate_limit: u32,
    pub price_per_call: u64,
    pub total_calls: u64,
    pub total_earnings: u64,
    pub paused: bool,
    pub bump: u8,
}

impl ApiRegistry {
    pub const LEN: usize = 8 + 32 + 64 + 256 + 4 + 8 + 8 + 8 + 1 + 1;
}