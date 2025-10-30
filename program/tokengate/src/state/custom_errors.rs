use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {
    #[msg("Invalid name length")]
    InvalidName,
    #[msg("Invalid rate limit")]
    InvalidRateLimit,
    #[msg("API is paused")]
    ApiPaused,
    #[msg("Access key is inactive")]
    KeyInactive,
    #[msg("Not authorized")]
    NotAuthorized,
    #[msg("Insufficient balance")]
    InsufficientBalance,
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Already revoked")]
    AlreadyRevoked,
    #[msg("Already paused")]
    AlreadyPaused,
    #[msg("Not paused")]
    NotPaused,
    #[msg("Overflow")]
    Overflow,
}