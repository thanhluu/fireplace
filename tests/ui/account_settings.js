var helpers = require('../helpers');

helpers.startCasper();

casper.test.begin('Test account settings', {
    test: function(test) {

        casper.waitForSelector('#splash-overlay.hide', function() {
            casper.click('.header-button.settings');
        });

        casper.waitForUrl(helpers.makeUrl('/settings'), function() {
            test.assertUrlMatch(/\/settings/);
            test.assertTitle('Account Settings | Firefox Marketplace');
            test.assertVisible('.account-settings .persona');
            test.assertSelectorHasText('.account-settings .persona', 'Sign In');
            test.assertSelectorHasText('.account-settings .persona', 'Register');
            test.assertNotVisible('.account-settings .logout');
            test.assertNotVisible('.account-settings button[type="submit"]');
            test.assertNotVisible('.account-settings input[name="email"]');
            test.assertNotVisible('.account-settings input[name="display_name"]');
            test.assertNotVisible('.account-settings input[name="enable_recommendations"]');
            helpers.fake_login();
        });

        casper.waitForSelector('.account-settings .logout', function() {
            test.assertUrlMatch(/\/settings/);
            test.assertTitle('Account Settings | Firefox Marketplace');
            test.assertVisible('.account-settings .logout');
            test.assertSelectorHasText('.account-settings .logout', 'Sign Out');
            test.assertNotVisible('.account-settings .persona');
            test.assertVisible('.account-settings button[type="submit"]');
            test.assertVisible('.account-settings input[name="email"]');
            test.assertVisible('.account-settings input[name="display_name"]');
            test.assertVisible('.account-settings input[name="enable_recommendations"]');
            casper.fill('.account-settings', {
                display_name: 'hello my name is rob hudson'
            });
            casper.click('#enable_recommendations');
            casper.click('.account-settings button[type="submit"]');

            // Test submitting with recommendations off removes the body class.
            test.assertEqual(
                casper.getFormValues('.account-settings').display_name,
                'hello my name is rob hudson'
            );
            test.assertEqual(
                casper.getFormValues('.account-settings').enable_recommendations,
                false
            );
        });

        casper.waitUntilVisible('#notification', function() {
            test.assertNotExists('body.show-recommendations');
        });

        casper.waitWhileVisible('#notification', function() {
            // Now test enabling recommendations.
            casper.click('#enable_recommendations');
            casper.click('.account-settings button[type="submit"]');
        }, function() {
            this.echo('[TIMEOUT] Waiting for #notification timed out.');
        }, 7500);

        casper.waitUntilVisible('#notification', function() {
            // Test submitting with recommendations on adds the body class.
            test.assertExists('body.show-recommendations');
            test.assertEqual(
                casper.getFormValues('.account-settings').enable_recommendations,
                true
            );

            casper.click('.logout');
        });

        casper.waitForSelector('.account-settings .only-logged-out', function() {
            test.assertUrlMatch(/\/settings/);
            test.assertVisible('.account-settings .persona');
            test.assertSelectorHasText('.account-settings .persona', 'Sign In');
            test.assertSelectorHasText('.account-settings .persona', 'Register');
            test.assertNotVisible('.account-settings .logout');
            test.assertNotVisible('.account-settings footer p:first-child button');
            test.assertNotExists('body.show-recommendations');
        });

        casper.run(function() {
            test.done();
        });
    }
});
