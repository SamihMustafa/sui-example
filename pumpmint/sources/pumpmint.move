    /// Module: pumpmint
    module pumpmint::pumpmint {

        use std::option;
        use sui::object::{UID, new};
        use sui::coin::{Self, TreasuryCap};
        use sui::transfer;
        use sui::tx_context::{Self, TxContext};
        use sui::event;

    struct PUMPMINT has drop {}

    struct PUMPMINT_TREASURY has key, store {
        id: UID,
        max_supply: u64,
        pumpmint_treasury_cap: TreasuryCap<PUMPMINT>
    }

    struct MINT_EVENT has copy, drop {
        amount: u64,
        current_supply: u64,
        minter: address
    }
    // 100k supply
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
        let pumpmint_treasury = PUMPMINT_TREASURY {
                id: new(ctx),
                max_supply: MAX_SUPPLY,
                pumpmint_treasury_cap: treasury
                };
            transfer::public_freeze_object(metadata);
            transfer::public_share_object(pumpmint_treasury);
        }

    /// Mints new PUMPMINT tokens and transfers them to the recipient
    ///
    /// # Parameters
    /// - `treasury_cap`: The treasury capability to mint tokens
    /// - `amount`: The amount of tokens to mint
    /// - `ctx`: The transaction context
        public entry fun mint(
            treasury_cap: &mut PUMPMINT_TREASURY, 
            amount: u64,  
            ctx: &mut TxContext
            ) {
                let currentMax = current_supply(treasury_cap) + amount;
                assert!(currentMax <= MAX_SUPPLY, EMAXSUPPLYREACHED);
                let sender = tx_context::sender(ctx);
                event::emit(MINT_EVENT{
                    amount: amount,
                    current_supply: currentMax,
                    minter: sender
                });
                coin::mint_and_transfer(&mut treasury_cap.pumpmint_treasury_cap, amount, sender, ctx);
                 
        }

        /// Returns the current supply of PUMPMINT tokens
        ///
        /// # Parameters
        /// - `treasury_cap`: The treasury capability to query the supply
        public fun current_supply(treasurycap: &PUMPMINT_TREASURY): u64 {
            coin::total_supply<PUMPMINT>(&treasurycap.pumpmint_treasury_cap)
        }

        #[test_only]
        public fun init_for_testing(ctx: &mut TxContext) {
            init(PUMPMINT {}, ctx);
        }


    }
