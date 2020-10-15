class RulesTimeline extends DeviceTimeline {
    rulesComponent: RulesComponent;

    constructor(mainController: IoTController, containerTimeline: Timeline, rules: any, futureClient: FutureClient) {
        super(containerTimeline, "all_rules");
        this.rulesComponent = new RulesComponent(mainController, this, this.getMainAttributeContainer(), rules, futureClient);
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