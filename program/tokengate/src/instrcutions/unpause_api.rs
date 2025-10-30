use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct UnpauseApi<'info> {
    pub owner: Signer<'info>,

    #[account(mut)]
    pub registry: Account<'info, ApiRegistry>,
}

pub fn handler(
    ctx: Context<UnpauseApi>,
) -> Result<()> {
    require!(ctx.accounts.owner.key() == ctx.accounts.registry.owner, CustomError::NotAuthorized);
    require!(ctx.accounts.registry.paused, CustomError::NotPaused);

    ctx.accounts.registry.paused = false;

    Ok(())
}