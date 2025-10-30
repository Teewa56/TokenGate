use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};
use crate::state::*;

#[derive(Accounts)]
pub struct PurchaseAccess<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub registry: Account<'info, ApiRegistry>,

    #[account(
        init,
        payer = buyer,
        space = AccessKey::LEN,
        seeds = [b"access_key", registry.key().as_ref(), buyer.key().as_ref()],
        bump
    )]
    pub access_key: Account<'info, AccessKey>,

    /// CHECK: Receives payment
    #[account(mut)]
    pub owner_wallet: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<PurchaseAccess>,
    api_id: Pubkey,
) -> Result<()> {
    require!(!ctx.accounts.registry.paused, CustomError::ApiPaused);

    let amount = ctx.accounts.registry.price_per_call;

    // Transfer payment
    if amount > 0 {
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.buyer.to_account_info(),
                    to: ctx.accounts.owner_wallet.to_account_info(),
                },
            ),
            amount,
        )?;
    }

    // Create access key
    let access_key = &mut ctx.accounts.access_key;
    access_key.api_id = api_id;
    access_key.owner = ctx.accounts.buyer.key();
    access_key.calls_remaining = ctx.accounts.registry.rate_limit * 60;
    access_key.active = true;
    access_key.bump = ctx.bumps.access_key;

    // Update registry earnings
    ctx.accounts.registry.total_earnings += amount;

    Ok(())
}