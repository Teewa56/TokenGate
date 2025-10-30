use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct PauseApi<'info> {
    pub owner: Signer<'info>,

    #[account(mut)]
    pub registry: Account<'info, ApiRegistry>,
}

pub fn handler(
    ctx: Context<PauseApi>,
) -> Result<()> {
    require!(ctx.accounts.owner.key() == ctx.accounts.registry.owner, CustomError::NotAuthorized);
    require!(!ctx.accounts.registry.paused, CustomError::AlreadyPaused);

    ctx.accounts.registry.paused = true;

    Ok(())
}