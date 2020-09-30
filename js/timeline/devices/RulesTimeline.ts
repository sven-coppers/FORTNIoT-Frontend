class RulesTimeline extends DeviceTimeline {
    rulesComponent: RulesComponent;

    constructor(containerTimeline: Timeline, rules: any) {
        super(containerTimeline, "all_rules");
        this.rulesComponent = new RulesComponent(this, this.getMainAttributeContainer(), rules);
        this.components = [];
        this.components.push(this.rulesComponent);
    }

    redrawConflicts(conflicts: any) {
        this.rulesComponent.redrawConflictsBackgrounds(conflicts);
    }
}