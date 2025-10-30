use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
#[instruction(name: String, backend_url: String)]
pub struct RegisterApi<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        space = ApiRegistry::LEN,
        seeds = [b"api_registry", signer.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub registry: Account<'info, ApiRegistry>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<RegisterApi>,
    name: String,
    backend_url: String,
    rate_limit: u32,
    price_per_call: u64,
) -> Result<()> {
    require!(name.len() > 0 && name.len() <= 64, CustomError::InvalidName);
    require!(rate_limit > 0, CustomError::InvalidRateLimit);

    let registry = &mut ctx.accounts.registry;
    registry.owner = ctx.accounts.signer.key();
    registry.name = name;
    registry.backend_url = backend_url;
    registry.rate_limit = rate_limit;
    registry.price_per_call = price_per_call;
    registry.total_calls = 0;
    registry.total_earnings = 0;
    registry.paused = false;
    registry.bump = ctx.bumps.registry;

    Ok(())
}