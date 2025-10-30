use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct RevokeAccess<'info> {
    pub owner: Signer<'info>,

    pub registry: Account<'info, ApiRegistry>,

    #[account(mut)]
    pub access_key: Account<'info, AccessKey>,
}

pub fn handler(
    ctx: Context<RevokeAccess>,
) -> Result<()> {
    require!(ctx.accounts.owner.key() == ctx.accounts.registry.owner, CustomError::NotAuthorized);
    require!(ctx.accounts.access_key.active, CustomError::AlreadyRevoked);

    ctx.accounts.access_key.active = false;

    Ok(())
}