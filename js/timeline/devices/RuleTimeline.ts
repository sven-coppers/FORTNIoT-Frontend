class RuleTimeline extends DeviceTimeline {
    triggerDescription: string;
    fullDescription: string;

    constructor(deviceID: string, label: string, containerTimeline: Timeline, actions: any[]) {
        super(containerTimeline, deviceID);

        this.triggerDescription = "IF " + label;
        this.fullDescription = this.triggerDescription;

        for(let i = 0; i < actions.length; i++) {
            if(i == 0) {
                this.fullDescription += " THEN " + actions[i]["description"];
            } else if(i == actions[i].length - 1) {
                this.fullDescription += ", and " + actions[i]["description"];
            } else {
                this.fullDescription += ", " + actions[i]["description"];
            }
        }

        this.components = [];
      //  this.components.push(new TriggerComponent(this, this.getMainAttributeContainer(), this.triggerDescription, "user_rule.png"));

        for(let i = 0; i < actions.length; i++) {
     //       this.components.push(new ActionComponent(this, this.getOtherAttributesContainer(), null, actions[i], ));
        }



        // Disabled for experiment 1:

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