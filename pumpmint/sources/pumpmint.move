    /// Module: pumpmint
    module pumpmint::pumpmint {

        use std::option;
        use sui::coin::{Self, TreasuryCap};
        use sui::transfer;
        use sui::tx_context::{TxContext};

    struct PUMPMINT has drop {}

    const MAX_SUPPLY: u64 = 1_000_000_000_000;

    const EMAXSUPPLYREACHED: u64 = 0;

        fun init(witness: PUMPMINT, ctx: &mut TxContext) {
            let (treasury, metadata) = coin::create_currency(
                witness,
                6,                 // Decimals
                b"PM",             // Symbol
                b"PUMP MINT",      // Name
                b"",               // Description
                option::none(),    // URL
                ctx
            );
            transfer::public_freeze_object(metadata);
            transfer::public_share_object(treasury);
        }

    /// Mints new PUMPMINT tokens and transfers them to the recipient
    ///
    /// # Parameters
    /// - `treasury_cap`: The treasury capability to mint tokens
    /// - `amount`: The amount of tokens to mint
    /// - `recipient`: The address of the recipient
    /// - `ctx`: The transaction context
        public entry fun mint(
            treasury_cap: &mut TreasuryCap<PUMPMINT>, 
            amount: u64, 
            recipient: address, 
            ctx: &mut TxContext
            ) {
                let currentSupply = current_supply(treasury_cap);
                let currentMax = currentSupply + amount;
                assert!(currentMax <= MAX_SUPPLY, EMAXSUPPLYREACHED);
                coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
        }

    /// Returns the current supply of PUMPMINT tokens
    ///
    /// # Parameters
    /// - `treasury_cap`: The treasury capability to query the supply
        public fun current_supply(
            treasury_cap: &mut TreasuryCap<PUMPMINT>, 
        ): u64 {
            coin::total_supply<PUMPMINT>(treasury_cap)
        }

        /// Returns the maximum supply of PUMPMINT tokens
        public fun max_supply(): u64 {
            MAX_SUPPLY
        }


        #[test_only]
        public fun init_for_testing(ctx: &mut TxContext) {
            init(PUMPMINT {}, ctx);
        }


    }
