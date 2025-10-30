use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct LogUsage<'info> {
    pub registry: Account<'info, ApiRegistry>,

    #[account(mut)]
    pub access_key: Account<'info, AccessKey>,

    #[account(
        init_if_needed,
        payer = access_key_owner,
        space = UsageLog::LEN,
        seeds = [b"usage_log", registry.key().as_ref(), access_key.owner.as_ref()],
        bump
    )]
    pub usage_log: Account<'info, UsageLog>,

    #[account(mut)]
    pub access_key_owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<LogUsage>,
    calls: u32,
) -> Result<()> {
    require!(ctx.accounts.access_key.active, CustomError::KeyInactive);

    // Deduct calls
    if ctx.accounts.access_key.calls_remaining >= calls {
        ctx.accounts.access_key.calls_remaining -= calls;
    } else {
        ctx.accounts.access_key.calls_remaining = 0;
    }

    // Calculate cost
    let cost = ctx.accounts.registry.price_per_call.checked_mul(calls as u64)
        .ok_or(CustomError::Overflow)?;

    // Update registry
    ctx.accounts.registry.total_calls = ctx.accounts.registry.total_calls
        .checked_add(calls as u64)
        .ok_or(CustomError::Overflow)?;
    ctx.accounts.registry.total_earnings = ctx.accounts.registry.total_earnings
        .checked_add(cost)
        .ok_or(CustomError::Overflow)?;

    // Update usage log
    let usage_log = &mut ctx.accounts.usage_log;
    usage_log.api_id = ctx.accounts.access_key.api_id;
    usage_log.user = ctx.accounts.access_key.owner;
    usage_log.total_calls = usage_log.total_calls
        .checked_add(calls as u64)
        .ok_or(CustomError::Overflow)?;
    usage_log.total_cost = usage_log.total_cost
        .checked_add(cost)
        .ok_or(CustomError::Overflow)?;

    Ok(())
}