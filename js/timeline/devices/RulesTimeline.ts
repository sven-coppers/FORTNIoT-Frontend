class RulesTimeline extends DeviceTimeline {
    rulesComponent: RulesComponent;

    constructor(containerTimeline: Timeline, rules: any, futureClient: FutureClient) {
        super(containerTimeline, "all_rules");
        this.rulesComponent = new RulesComponent(this, this.getMainAttributeContainer(), rules, futureClient);
        this.components = [];
        this.components.push(this.rulesComponent);
    }

    redrawConflict(conflict: any) {
        this.rulesComponent.highlightConflict(conflict);
    }

    highlightActionExecution(actionExecutionID: string) {
        this.rulesComponent.highlightActionExecution(actionExecutionID);
    }

    clearConflict() {
        this.rulesComponent.clearConflict();
    }
}