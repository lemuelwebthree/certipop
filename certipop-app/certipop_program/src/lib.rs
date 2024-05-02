pub mod instruction;
pub mod state;

use borsh::BorshSerialize;
use crate::instruction::CertipopInstruction;
use crate::state::AccountState;
use crate::state::CertipopError;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    borsh0_10::try_from_slice_unchecked,
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program::invoke_signed,
    program_error::ProgramError,
    program_pack::IsInitialized,
    pubkey::Pubkey,
    system_instruction,
    sysvar::{rent::Rent, Sysvar},
};
use std::convert::TryInto;

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let instruction = CertipopInstruction::unpack(instruction_data)?;
    match instruction {
        CertipopInstruction::AddCertipop {
            transaction_reference,
            rating,
            transaction_signature,
        } => add_certipop(
            program_id,
            accounts,
            transaction_reference,
            rating,
            transaction_signature,
        ),
        CertipopInstruction::UpdateCertipop {
            transaction_reference,
            rating,
            transaction_signature,
        } => update_certipop(
            program_id,
            accounts,
            transaction_reference,
            rating,
            transaction_signature,
        ),
    }
}

pub fn add_certipop(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    transaction_reference: String,
    rating: u8,
    transaction_signature: String,
) -> ProgramResult {
    msg!("Adding  certipop...");
    msg!("transaction_reference: {}", transaction_reference);
    msg!("Rating: {}", rating);
    msg!("transaction_signature: {}", transaction_signature);

    let account_info_iter = &mut accounts.iter();

    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;
    let system_program = next_account_info(account_info_iter)?;

    if !initializer.is_signer {
        msg!("Missing required signature");
        return Err(ProgramError::MissingRequiredSignature);
    }

    let (pda, bump_seed) = Pubkey::find_program_address(
        &[
            initializer.key.as_ref(),
            transaction_reference.as_bytes().as_ref(),
        ],
        program_id,
    );
    if pda != *pda_account.key {
        msg!("Invalid seeds for PDA");
        return Err(ProgramError::InvalidArgument);
    }

    if rating > 10 || rating < 1 {
        return Err(CertipopError::InvalidRating.into());
    }

    let account_len: usize = 1000;

    let rent = Rent::get()?;
    let rent_lamports = rent.minimum_balance(account_len);

    invoke_signed(
        &system_instruction::create_account(
            initializer.key,
            pda_account.key,
            rent_lamports,
            account_len.try_into().unwrap(),
            program_id,
        ),
        &[
            initializer.clone(),
            pda_account.clone(),
            system_program.clone(),
        ],
        &[&[
            initializer.key.as_ref(),
            transaction_reference.as_bytes().as_ref(),
            &[bump_seed],
        ]],
    )?;

    msg!("PDA created: {}", pda);

    msg!("unpacking state account");
    let mut account_data =
        try_from_slice_unchecked::<AccountState>(&pda_account.data.borrow()).unwrap();
    msg!("borrowed account data");

    msg!("checking if  account is already initialized");
    if account_data.is_initialized() {
        msg!("Account already initialized");
        return Err(ProgramError::AccountAlreadyInitialized);
    }

    account_data.transaction_reference = transaction_reference;
    account_data.rating = rating;
    account_data.transaction_signature = transaction_signature;
    account_data.is_initialized = true;

    msg!("serializing account");
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
    msg!("state account serialized");

    Ok(())
}

pub fn update_certipop(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    _transaction_reference: String,
    rating: u8,
    transaction_signature: String,
) -> ProgramResult {
    msg!("Updating  certipop...");

    let account_info_iter = &mut accounts.iter();

    let initializer = next_account_info(account_info_iter)?;
    let pda_account = next_account_info(account_info_iter)?;

    if pda_account.owner != program_id {
        return Err(ProgramError::IllegalOwner);
    }

    if !initializer.is_signer {
        msg!("Missing required signature");
        return Err(ProgramError::MissingRequiredSignature);
    }

    msg!("unpacking state account");
    let mut account_data =
        try_from_slice_unchecked::<AccountState>(&pda_account.data.borrow()).unwrap();
    msg!(
        "transaction_reference: {}",
        account_data.transaction_reference
    );

    let (pda, _bump_seed) = Pubkey::find_program_address(
        &[
            initializer.key.as_ref(),
            account_data.transaction_reference.as_bytes().as_ref(),
        ],
        program_id,
    );
    if pda != *pda_account.key {
        msg!("Invalid seeds for PDA");
        return Err(CertipopError::InvalidPDA.into());
    }

    msg!("checking if  account is initialized");
    if !account_data.is_initialized() {
        msg!("Account is not initialized");
        return Err(CertipopError::UninitializedAccount.into());
    }

    if rating > 10 || rating < 1 {
        return Err(CertipopError::InvalidRating.into());
    }

    msg!("Certipop before update:");
    msg!(
        "transaction_reference: {}",
        account_data.transaction_reference
    );
    msg!("Rating: {}", account_data.rating);
    msg!(
        "transaction_signature: {}",
        account_data.transaction_signature
    );

    account_data.rating = rating;
    account_data.transaction_signature = transaction_signature;

    msg!("Certipop after update:");
    msg!(
        "transaction_reference: {}",
        account_data.transaction_reference
    );
    msg!("Rating: {}", account_data.rating);
    msg!(
        "transaction_signature: {}",
        account_data.transaction_signature
    );

    msg!("serializing account");
    account_data.serialize(&mut &mut pda_account.data.borrow_mut()[..])?;
    msg!("state account serialized");

    Ok(())
}
