(function(exports) {
    "use strict";

// These are the forms that require an email.
exports.email_setup = function() {
    if ($('div.paypal-inline').length) {
        // Don't hide this if there was an error.
        if (!$('ul.errorlist').length) {
            $('#id_email').closest('p').addClass('js-hidden');
        };

        $('div.paypal-inline input[type=radio]').click(function(e) {
            if ($(this).val() === 'no') {
                $('#id_email').closest('p').hide();
            } else {
                $('#id_email').closest('p').show();
            }
        });
    }
    $('#paypal-change-address').click(function(e) {
        $('#paypal-change-address-form').show();
    });
    // If you've submitted the form and there was an error, show the form.
    if ($('ul.errorlist').length) {
        $('#paypal-change-address-form').show();
    };
};

// This is the setup payments form.
exports.payment_setup = function() {
    var update_forms = function(value) {
        var fields = [
            // Free
            [[], ['payments-support-type', 'payments-price-level',
                  'payments-upsell']],
            // Premium
            [['payments-support-type', 'payments-price-level',
              'payments-upsell'], []],
            // Premium with in-app
            [['payments-support-type', 'payments-price-level',
              'payments-upsell'], []],
            // Free with in-app
            [['payments-support-type'],
             ['payments-price-level', 'payments-upsell']],
        ];
        $.each(fields[value][0], function() { $('#' + this).show() })
        $.each(fields[value][1], function() { $('#' + this).hide() })
    }
    update_forms($('section.payments input[name=premium_type]:checked').val());
    $('section.payments input[name=premium_type]').click(function(e) {
        update_forms($(this).val());
    });
};

})(typeof exports === 'undefined' ? (this.dev_paypal = {}) : exports);

$(document).ready(function() {
    dev_paypal.email_setup();
    dev_paypal.payment_setup();
});

