use borsh::BorshDeserialize;
use solana_program::program_error::ProgramError;

pub enum CertipopInstruction{
    AddCertipop {
        transaction_reference: String,
        rating: u8,
        transaction_signature: String,
    },
    UpdateCertipop {
        transaction_reference: String,
        rating: u8,
        transaction_signature: String,
    },
}

#[derive(BorshDeserialize)]
struct CertipopPayload {
    transaction_reference: String,
    rating: u8,
    transaction_signature: String,
}

impl CertipopInstruction{
    pub fn unpack(input: &[u8]) -> Result<Self, ProgramError> {
        let (&variant, rest) = input
            .split_first()
            .ok_or(ProgramError::InvalidInstructionData)?;
        let payload = CertipopPayload::try_from_slice(rest).unwrap();
        Ok(match variant {
            0 => Self::AddCertipop {
                transaction_reference: payload.transaction_reference,
                rating: payload.rating,
                transaction_signature: payload.transaction_signature,
            },
            1 => Self::UpdateCertipop {
                transaction_reference: payload.transaction_reference,
                rating: payload.rating,
                transaction_signature: payload.transaction_signature,
            },
            _ => return Err(ProgramError::InvalidInstructionData),
        })
    }
}