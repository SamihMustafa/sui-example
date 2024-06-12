#[test_only]
module pumpmint::pumpmint_tests {

    use pumpmint::pumpmint::{Self, PUMPMINT_TREASURY};
    use sui::tx_context::{Self};
    use sui::test_scenario::{Self as test, Scenario};
    use sui::test_utils::{Self as assert};

    #[test_only]
    public fun take_treasury(scenario: &Scenario): PUMPMINT_TREASURY {
        let treasury = test::take_shared<PUMPMINT_TREASURY>(scenario);
        treasury
    }

    #[test_only]
    public fun return_treasury(treasurycap: PUMPMINT_TREASURY) {
         test::return_shared<PUMPMINT_TREASURY>(treasurycap);
    }

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
            let treasurycap = take_treasury(&scenario);
            assert::assert_eq(pumpmint::current_supply(&treasurycap), 0);
            return_treasury(treasurycap);
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
            let treasurycap = take_treasury(&scenario);
            pumpmint::mint(&mut treasurycap, 10, ctx);
            assert::assert_eq(pumpmint::current_supply(&treasurycap), 10);
            return_treasury(treasurycap);
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
            let treasurycap = take_treasury(&scenario);
            pumpmint::mint(&mut treasurycap, 10, ctx);
            assert::assert_eq(pumpmint::current_supply(&treasurycap), 10);
            return_treasury(treasurycap);
        };

        test::next_tx(&mut scenario, addr2);
        {   
            let treasurycap = take_treasury(&scenario);
            pumpmint::mint(&mut treasurycap, 50, ctx);
            assert::assert_eq(pumpmint::current_supply(&treasurycap), 60);
            return_treasury(treasurycap);
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
            let treasurycap = take_treasury(&scenario);
            pumpmint::mint(&mut treasurycap, 1_000_000_000_001, ctx);
            assert::assert_eq(pumpmint::current_supply(&treasurycap), 0);
            return_treasury(treasurycap);
        };

        test::end(scenario);  
    }

}
