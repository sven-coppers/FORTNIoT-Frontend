class RulesTimeline extends DeviceTimeline {
    constructor(containerTimeline: Timeline, rules: any) {
        super(containerTimeline, "all_rules");

        this.components = [];
        this.components.push(new RulesComponent(this, this.getMainAttributeContainer(), rules));
    }
}