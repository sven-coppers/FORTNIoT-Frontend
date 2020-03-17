class ImplicitRuleTimeline extends DeviceTimeline {
    constructor(deviceID: string, label: string, containerTimeline: Timeline) {
        super(containerTimeline, deviceID);

        this.components = [];
        this.components.push(new EventComponent(this, this.getMainAttributeContainer(), label, "system_rule.png"));
    }
}