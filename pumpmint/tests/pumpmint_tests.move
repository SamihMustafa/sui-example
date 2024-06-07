#[test_only]
module pumpmint::pumpmint_tests {
    // uncomment this line to import the module
    use pumpmint::pumpmint::{Self, PUMPMINT};
    use sui::coin::{Self, TreasuryCap};
    use sui::tx_context::{Self};
    use sui::test_scenario::{Self as test};
    use sui::test_utils::{Self as assert};

    struct S_PUMPMINT has drop {}

   // The `init` is not run in tests, and normally a test_only function is
    // provided so that the module can be initialized in tests. Having it public
    // is important for tests located in other modules.
    #[test]
    public fun test_empty_supply() {
        let addr1 = @0xA;
        // Begins a multi-transaction scenario with addr1 as the sender
        let ctx = &mut tx_context::dummy();
        let scenario = test::begin(addr1);
        {
            // `test_scenario::ctx` returns the `TxContext`
            pumpmint::init_for_testing(ctx); 
        };

        test::next_tx(&mut scenario, addr1);
        {   
            let treasurycap = test::take_shared<TreasuryCap<PUMPMINT>>(&scenario);
            assert::assert_eq(pumpmint::current_supply(&mut treasurycap), 0);
            test::return_shared<TreasuryCap<PUMPMINT>>(treasurycap);
        };

        test::end(scenario);  
    }

    #[test]
    public fun test_minted_supply() {
         let addr1 = @0xA;
        // Begins a multi-transaction scenario with addr1 as the sender
        let ctx = &mut tx_context::dummy();
        let scenario = test::begin(addr1);
        {
            // `test_scenario::ctx` returns the `TxContext`
            pumpmint::init_for_testing(ctx); 
        };

         test::next_tx(&mut scenario, addr1);
        {   
            let treasurycap = test::take_shared<TreasuryCap<PUMPMINT>>(&scenario);
            pumpmint::mint(&mut treasurycap, 10, addr1, ctx);
            assert::assert_eq(pumpmint::current_supply(&mut treasurycap), 10);
            test::return_shared<TreasuryCap<PUMPMINT>>(treasurycap);
        };

        test::end(scenario);  
    }

     #[test]
    public fun test_multiple_mint() {
         let addr1 = @0xA;
         let addr2 = @0xCafe;
        // Begins a multi-transaction scenario with addr1 as the sender
        let ctx = &mut tx_context::dummy();
        let scenario = test::begin(addr1);
        {
            // `test_scenario::ctx` returns the `TxContext`
            pumpmint::init_for_testing(ctx); 
        };

         test::next_tx(&mut scenario, addr1);
        {   
            let treasurycap = test::take_shared<TreasuryCap<PUMPMINT>>(&scenario);
            pumpmint::mint(&mut treasurycap, 10, addr1, ctx);
            assert::assert_eq(pumpmint::current_supply(&mut treasurycap), 10);
            test::return_shared<TreasuryCap<PUMPMINT>>(treasurycap);
        };

        test::next_tx(&mut scenario, addr2);
        {   
            let treasurycap = test::take_shared<TreasuryCap<PUMPMINT>>(&scenario);
            pumpmint::mint(&mut treasurycap, 50, addr2, ctx);
            assert::assert_eq(pumpmint::current_supply(&mut treasurycap), 60);
            test::return_shared<TreasuryCap<PUMPMINT>>(treasurycap);
        };
    
        test::end(scenario);  
    }


    #[test]
    #[expected_failure(abort_code = pumpmint::pumpmint::EMAXSUPPLYREACHED)]
    public fun test_max_mint_failed() {
        let addr1 = @0xA;
        // Begins a multi-transaction scenario with addr1 as the sender
        let ctx = &mut tx_context::dummy();
        let scenario = test::begin(addr1);
        {
            // `test_scenario::ctx` returns the `TxContext`
            pumpmint::init_for_testing(ctx); 
        };

        test::next_tx(&mut scenario, addr1);
        {   
            let treasurycap = test::take_shared<TreasuryCap<PUMPMINT>>(&scenario);
            pumpmint::mint(&mut treasurycap, 1_000_000_000_001, addr1, ctx);
            assert::assert_eq(pumpmint::current_supply(&mut treasurycap), 0);
            test::return_shared<TreasuryCap<PUMPMINT>>(treasurycap);
        };

        test::end(scenario);  
    }

}
