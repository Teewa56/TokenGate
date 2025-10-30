use anchor_lang::prelude::*;

mod instructions;
mod state;

use instructions::*;

declare_id!("HRhuJDBenXrraLRfEQpFxNKkMBDbBXmjfKguyFGsxrAL");

#[program]
pub mod tokengate {
    use super::*;

    pub fn register_api(
        ctx: Context<RegisterApi>,
        name: String,
        backend_url: String,
        rate_limit: u32,
        price_per_call: u64,
    ) -> Result<()> {
        instructions::register_api::handler(ctx, name, backend_url, rate_limit, price_per_call)
    }

    pub fn purchase_access(
        ctx: Context<PurchaseAccess>,
        api_id: Pubkey,
    ) -> Result<()> {
        instructions::purchase_access::handler(ctx, api_id)
    }

    pub fn log_usage(
        ctx: Context<LogUsage>,
        calls: u32,
    ) -> Result<()> {
        instructions::log_usage::handler(ctx, calls)
    }

    pub fn withdraw_earnings(
        ctx: Context<WithdrawEarnings>,
        amount: u64,
    ) -> Result<()> {
        instructions::withdraw_earnings::handler(ctx, amount)
    }

    pub fn revoke_access(
        ctx: Context<RevokeAccess>,
    ) -> Result<()> {
        instructions::revoke_access::handler(ctx)
    }

    pub fn pause_api(
        ctx: Context<PauseApi>,
    ) -> Result<()> {
        instructions::pause_api::handler(ctx)
    }

    pub fn unpause_api(
        ctx: Context<UnpauseApi>,
    ) -> Result<()> {
        instructions::unpause_api::handler(ctx)
    }
}