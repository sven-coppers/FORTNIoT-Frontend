declare var vis;


$(document).ready(function() {
    new IoTController();
});

class IoTController {
    timeline: Timeline;
    eventsClient: EventsClient;
    stateClient: StateClient;
    ruleClient: RuleClient;
    deviceClient: DeviceClient;
    //configClient: ConfigClient;
    conflictClient: ConflictClient;
    futureClient: FutureClient;

    private selectedTime: Date;
    private selectedTriggerEntity: string;
    private selectedActionID: string;
    private feedforwardStillRelevant: boolean;
    private scenarios: string [];

    public API_URL: string;

    private remote: boolean;
    private anchorDate: Date;
    private predicting: boolean;

    public devices: any = {};

    constructor() {
        this.feedforwardStillRelevant = false;
        this.selectedTriggerEntity = null;
        this.selectedActionID = null;
        this.selectedTime = null;

        this.initDemonstrator();
        this.updateDemonstrator();
        this.initClients();
        this.timeline = new Timeline(this, this.ruleClient, this.stateClient, this.deviceClient, this.conflictClient,this.futureClient);

        let oThis = this;

        $("#reload").click(function() {
            oThis.refreshContext();
            return false;
        });

        $(".copy").click(function () {
            let identifier = $(this).closest(".device").find(".code").attr("id");
            //$(this).closest(".device").find(".code").text().sel;
            let textBox = (<HTMLInputElement>document.getElementById(identifier));
            /* Select the text field */
            textBox.select();

            /* Copy the text inside the text field */
            document.execCommand("copy");
        });

        if(!this.isRemote()) {
            let source = new EventSource("http://localhost:8080/intelligibleIoT/api/states/stream");
            source.onmessage = function(event) {
                if(event.data == "Scenario Changed") {
                    oThis.timeline.refreshSetup();
                } else {
                    oThis.refreshContext();
                }
            };
        }

        $("#rules_checkbox").click(function() {
            oThis.timeline.setAllRulesVisible($(this).is(":checked"));
          //  $(".timeline_device.rule").slideToggle();
        });

        $("#devices_checkbox").click(function() {
            oThis.timeline.setAllDevicesVisible($(this).is(":checked"));
        });

        $("#back_button").click(function() {
            oThis.clearSelection(false);
            $(this).addClass("hidden");
        });

        $("#events_without_changes").click(function() {
            $(".event_item.without_changes").toggleClass("hidden", !$(this).is(":checked"));
        });
    }

    initClients() {
       // this.eventsClient = new EventsClient(this);
        this.stateClient = new StateClient(this);
        this.ruleClient = new RuleClient(this);
        this.deviceClient = new DeviceClient(this);
      //  this.configClient = new ConfigClient(this);
        this.conflictClient = new ConflictClient(this);
        this.futureClient = new FutureClient(this);

        $(".timeline_device_attributes").toggle();
    }

    // Small refresh: states, rule executions, conflicts
    refreshContext() {
        $("#reload").addClass("disabled");
        $(".history").empty();
        $(".future").empty();
        this.stateClient.loadStateHistory(); // The callback will start the next request
        //this.configClient.refresh(); // The callback will start the next request
    }

    public reAlign(range) {
        this.timeline.reAlign(range);
    }

    public setWindow(newRange: { start: Date; end: Date }) {
        this.timeline.setWindow(newRange);
    }

    configLoaded() {

    }

    pastStatesLoaded() {
        this.futureClient.refresh();
    }

    futureLoaded(future: any) {
        let allStates = this.stateClient.combineStateHistoryAndFuture(future.states);

        if(this.timeline != null) {
            this.timeline.loadingCompleted();
            this.timeline.redraw(allStates, future.executions, future.conflicts, false, this.getSelectedActionExecution());
        }
    }

    showFeedforward(alternativeFutureStates, alternativeFutureExecutions) {
        let originalStates = this.stateClient.combineStateHistoryAndFuture(this.futureClient.getFuture().states);
        let originalExecutions = this.futureClient.getFuture().executions();
        let originalConflicts = this.conflictClient.getConflicts();

        let alternativeStates = [];
        alternativeStates = alternativeStates.concat(this.stateClient.getStatesHistory());
        alternativeStates = alternativeStates.concat(alternativeFutureStates);

        let alternativeExecutions = [];
        alternativeExecutions = alternativeExecutions.concat(this.ruleClient.getExecutionsHistory());
        alternativeExecutions = alternativeExecutions.concat(alternativeFutureExecutions);

        let alternativeConflicts = [];
        // TODO find alternative conflicts

        this.timeline.showFeedforward(originalStates, alternativeStates, originalExecutions, alternativeExecutions, originalConflicts, alternativeConflicts, null);
    }

    updateDevices(data) {
        this.timeline.updateDevices(data);
    }

    actionExecutionChanged(actionExecutionID: string, actionID: string, newEnabled: boolean) {
        //  console.log(actionID + " - " + actionExecutionID + ": " + newEnabled);

        // Get trigger entity ID and execution time by using the actionExecutionID
        let ruleExecution = this.futureClient.getRuleExecutionByActionExecutionID(actionExecutionID);

        if(ruleExecution != null) {
            let actionExecution = this.futureClient.getActionExecutionByActionExecutionID(ruleExecution, actionExecutionID);

            if(newEnabled) {
                if(this.isRemote()) {
                    this.futureClient.loadAlternativeFuture(actionExecution["action_execution_id"], newEnabled);
                } else{
                    // Now enabled -> remove snooze
                    this.ruleClient.commitRemoveSnoozedAction(actionExecution["snoozed_by"]);
                }
            } else {
                if(this.isRemote()) {
                    this.futureClient.loadAlternativeFuture(actionExecution["action_execution_id"], newEnabled);
                } else{
                    // // Now snoozed -> add snooze
                    let snoozedAction = {};
                    snoozedAction["action_id"] = actionID;
                    snoozedAction["conflict_time_window"] = 20000;
                    snoozedAction["trigger_entity_id"] = ruleExecution["trigger_entity"];
                    snoozedAction["conflict_time"] = new Date(new Date(ruleExecution["datetime"]).getTime() - this.getAnchorDate().getTime());

                    this.ruleClient.commitNewSnoozedAction(snoozedAction);
                }
            }
        }
    }

    previewActionExecutionChange(actionExecutionID: string, newEnabled: boolean) {
        this.feedforwardStillRelevant = true;
        this.futureClient.simulateAlternativeFuture(actionExecutionID, newEnabled);
    }

    alternativeFutureSimulationReady(alternativeFuture) {
        if(!this.feedforwardStillRelevant) return;

        let originalFuture = this.futureClient.future;

        this.timeline.showFeedforward(originalFuture.states, alternativeFuture.states, originalFuture.executions, alternativeFuture.executions, originalFuture.conflicts, alternativeFuture.conflicts, this.getSelectedActionExecution());
    }

    cancelPreviewActionExecutionChange() {
      //  this.clearSelection(false);
        this.feedforwardStillRelevant = false;
        let future = this.futureClient.future;
        let allStates = this.stateClient.combineStateHistoryAndFuture(future.states);

        this.timeline.redraw(allStates, future.executions, future.conflicts, false, this.getSelectedActionExecution());

    }

    selectState(stateContextID: string) {
        let causedByActionExecution = this.futureClient.getActionExecutionByResultingContextID(stateContextID, null);

        if(causedByActionExecution == null) {
            console.log("No explanation available for this state");
            this.clearSelection(false);
        } else {
            this.selectActionExecution(causedByActionExecution["action_execution_id"]);
        }
    }

    selectActionExecution(actionExecutionID: string) {
        this.clearSelection(true);

        let ruleExecution = this.futureClient.getRuleExecutionByActionExecutionID(actionExecutionID);
        let actionExecution = this.futureClient.getActionExecutionByActionExecutionID(ruleExecution, actionExecutionID);

        if (actionExecution["resulting_contexts"].length > 0) {
            let relatedConflict = this.futureClient.getRelatedConflict(actionExecution["resulting_contexts"][0]["id"]);

            if (relatedConflict != null) {
                this.timeline.drawConflict(relatedConflict);
            }
        }

        this.timeline.highlightActionExecution(actionExecutionID);
        this.timeline.drawCustomTime(ruleExecution["datetime"]);
        this.timeline.highlightTrigger(ruleExecution["trigger_context"]["id"]);
        this.timeline.highlightConditions(this.futureClient.getTriggerContextIDsByExecution(ruleExecution));
        this.timeline.highlightActions(actionExecution["resulting_contexts"]);

        this.selectedTriggerEntity = ruleExecution["trigger_entity"];
        this.selectedActionID = actionExecution["action_id"];
        this.selectedTime = new Date(ruleExecution["datetime"]);
    }

    clearSelection(nextSelectionExpected: boolean) {
        this.selectedTriggerEntity = null;
        this.selectedActionID = null;
        this.selectedTime = null;

        this.timeline.clearSelection(nextSelectionExpected);
    }

    /**
     * Return the selected action exeuction, if any. Null otherwise
     */
    getSelectedActionExecution() {
        if(this.selectedTriggerEntity != null ) {
            return this.futureClient.findActionExecution(this.selectedTriggerEntity, this.selectedActionID, this.selectedTime);
        }

        return null;
    }

    /*getConfigClient() {
        return this.configClient;
    } */

    public getAnchorDate(): Date {
        return this.anchorDate;
    }

    public isPredicting(): boolean {
        return this.predicting;
    }

    public isRemote(): boolean {
        return this.remote;
    }

    private initDemonstrator() {
        //this.scenarios = ["training", "television", "temperature", "weather", "security", "conflicts"];
        this.scenarios = ["basic", "conflicts"];
        for(let scenario of this.scenarios) {
            $("#scenario").append("<option>" + scenario + "</option>");
        }

        let oThis = this;

        $("#predictions").click(function() {
            oThis.updateDemonstrator();
            oThis.refreshContext();
        });

        $("#remote").click(function() {
            oThis.updateDemonstrator();
            oThis.refreshContext();
        });

        $("#scenario").change(function() {
            oThis.updateDemonstrator();
            oThis.timeline.refreshSetup();
        });
    }

    private updateDemonstrator() {
        let selectedScenarioElement = $("#scenario").find(':selected');
        let selectedScenario =  selectedScenarioElement.length > 0 ? selectedScenarioElement.text() : "training";
        let detectedRemote = window.location.href.indexOf("research.edm.uhasselt.be") != -1;

        if(detectedRemote) {
            $("#remote").addClass("hidden");
            $("#remote_label").addClass("hidden");
        }

        this.remote = detectedRemote || $("#remote").is(":checked");
        this.predicting = $("#predictions").is(":checked");
        this.anchorDate = new Date();

        if(this.remote) {
            this.API_URL = "cache/" + selectedScenario + "/";
        } else {
            this.API_URL = "http://localhost:8080/intelligibleIoT/api/";
        }
    }
}