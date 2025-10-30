use anchor_lang::prelude::*;
use anchor_lang::system_program::{self, Transfer};
use crate::state::*;

#[derive(Accounts)]
pub struct WithdrawEarnings<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(mut)]
    pub registry: Account<'info, ApiRegistry>,

    /// CHECK: Receives payment
    #[account(mut)]
    pub owner_wallet: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<WithdrawEarnings>,
    amount: u64,
) -> Result<()> {
    require!(ctx.accounts.owner.key() == ctx.accounts.registry.owner, CustomError::NotAuthorized);
    require!(ctx.accounts.registry.total_earnings >= amount, CustomError::InsufficientBalance);
    require!(amount > 0, CustomError::InvalidAmount);

    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            Transfer {
                from: ctx.accounts.registry.to_account_info(),
                to: ctx.accounts.owner_wallet.to_account_info(),
            },
        ),
        amount,
    )?;

    ctx.accounts.registry.total_earnings -= amount;

    Ok(())
}