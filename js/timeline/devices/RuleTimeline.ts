class RuleTimeline extends DeviceTimeline {
    constructor(deviceID: string, label: string, containerTimeline: Timeline) {
        super(containerTimeline, deviceID);

        this.components = [];
        this.components.push(new EventComponent(this, this.getMainAttributeContainer(), label, "user_rule.png"));
        // Disabled for experiment 1: <input type="checkbox" class="rule_enabled" name="enabled" value=" ' + this.getHTMLPrefix() + '" id="' + this.getHTMLPrefix() + '_enabled">

        let oThis = this;

        $('#' + this.getHTMLPrefix() + '_enabled').change(function() {
            oThis.containerTimeline.getRuleClient().setRuleEnabled(deviceID,  $(this).is(":checked"));
        });

        /*$('#' + this.getHTMLPrefix() + '_enabled').change(function() {
            oThis.containerTimeline.getRuleClient().setRuleEnabled(deviceID,  $(this).is(":checked"));
        }); */

        $('#' + this.getHTMLPrefix() + '_enabled').hover(function() {
            let futureEnabled = !$(this).is(":checked");

            // START FEEDFORWARD
            oThis.containerTimeline.getStateClient().simulateFuture(deviceID, futureEnabled);
        }, function () {
            // REVERT THE OLD STATE
            oThis.containerTimeline.getMainController().refresh();
        });
    }
}