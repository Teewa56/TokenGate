use anchor_lang::prelude::*;

#[account]
pub struct AccessKey {
    pub api_id: Pubkey,
    pub owner: Pubkey,
    pub calls_remaining: u32,
    pub active: bool,
    pub bump: u8,
}

impl AccessKey {
    pub const LEN: usize = 8 + 32 + 32 + 4 + 1 + 1;
}