class Timeline {
    private readonly mainController: IoTController;
    private ruleClient: RuleClient;
    private stateClient: StateClient;
    private deviceClient: DeviceClient;
   // private configClient: ConfigClient;
    private conflictsClient: ConflictClient;
    private readonly futureClient: FutureClient;

    private readonly deviceAdapters: {};
    private rulesAdapter: RulesTimeline;

    private hasCustomTime: boolean;

    private showingOnlyContext: boolean;
    private redrawing: boolean;

    constructor(mainController: IoTController, ruleClient: RuleClient, stateClient: StateClient, deviceClient: DeviceClient, conflictsClient: ConflictClient, futureClient: FutureClient) {
        this.mainController = mainController;
        this.ruleClient = ruleClient;
        this.stateClient = stateClient;
        this.deviceClient = deviceClient;
        //this.configClient = configClient;
        this.conflictsClient = conflictsClient;
        this.futureClient = futureClient;
        this.hasCustomTime = false;
        this.showingOnlyContext = true;
        this.deviceAdapters = {};
        this.rulesAdapter = null;
        this.redrawing = false;

        this.refreshSetup();

        $(".timeline_device_main_attribute .timeline_label").click(function () {
            $(this).closest(".timeline_device").find(".timeline_device_attributes").toggle();
        });
    }

    public refreshSetup() {
        $(".timeline_wrapper").empty();

        // First load the devices
        this.deviceClient.loadDevices(this);

        // The callback will start to load the rules
    }

    /**
     * Second, initialise the rules
     * Callback function for when the ruleClient is finished loading
     * @param devices
     */
    public initializeRules(rules) {
        this.rulesAdapter = new RulesTimeline(this.mainController, this, rules, this.futureClient);
        this.mainController.refreshContext();
    }

    /**
     * First, initialise the devices
     * Callback function for when the deviceClient is finished loading
     * @param devices
     */
    public initializeDevices(devices) {
        let deviceNames = [];

        for(let deviceName in devices) {
            deviceNames.push(deviceName);
        }

        deviceNames.sort();

        for (let deviceName of deviceNames) {
            let device = devices[deviceName];

            if(!device["available"]) continue;

            if(deviceName.indexOf("light.") == 0) {
                this.deviceAdapters[deviceName] = new HueTimeline(this.mainController, deviceName, device["friendly_name"], this);
            } else if(deviceName.indexOf("lock.") == 0) {
                this.deviceAdapters[deviceName] = new GenericDeviceTimeline(this.mainController, deviceName, device["friendly_name"], "lock.png", this);
            } else if(deviceName.indexOf("sirene.") == 0) {
                this.deviceAdapters[deviceName] = new GenericDeviceTimeline(this.mainController, deviceName, device["friendly_name"], "sirene.png", this);
            } else if(deviceName.indexOf("sun.") == 0) {
                this.deviceAdapters[deviceName] = new SunTimeline(this.mainController, deviceName, this);
            } else if(deviceName.indexOf("switch.outlet") == 0) {
                this.deviceAdapters[deviceName] = new OutletTimeline(this.mainController, deviceName, device["friendly_name"], this);
            } else if(deviceName.indexOf("screen.") == 0) {
                this.deviceAdapters[deviceName] = new GenericDeviceTimeline(this.mainController, deviceName, device["friendly_name"], "screen.png", this);
            } else if(deviceName.indexOf("weather.dark_sky") == 0) {
                this.deviceAdapters[deviceName] = new WeatherTimeline(this.mainController, deviceName, this);
            } else if(deviceName.indexOf("calendar.") == 0) {
                this.deviceAdapters[deviceName] = new CalendarTimeline(this.mainController, deviceName, device["friendly_name"], this);
            } else if(deviceName.indexOf("agoralaan_diepenbeek") != -1) {
                this.deviceAdapters[deviceName] = new BusStopTimeline(this.mainController, deviceName, device["friendly_name"], this);
            } else if(deviceName.indexOf("sensor.moon") != -1) {
                this.deviceAdapters[deviceName] = new MoonTimeline(this.mainController, deviceName, device["friendly_name"], this);
            } else if(deviceName.indexOf("sensor.people_home_counter") != -1) {
                this.deviceAdapters[deviceName] = new PersonCounterTimeline(this.mainController, deviceName, device["friendly_name"], this);
            } else if(deviceName.indexOf("routine.") != -1) {
                this.deviceAdapters[deviceName] = new GenericDeviceTimeline(this.mainController, deviceName, device["friendly_name"], "routine.png", this);
            } else if(deviceName.indexOf("binary_sensor.") != -1) {
                if(deviceName.indexOf("_contact") != -1) {
                    this.deviceAdapters[deviceName] = new ContactTimeline(this.mainController, deviceName, device["friendly_name"], this);
                } else if(deviceName.indexOf("_acceleration") != -1) {
                    this.deviceAdapters[deviceName] = new AccelerationTimeline(this.mainController, deviceName, device["friendly_name"], this);
                } else if(deviceName.indexOf("sensor_motion") != -1) {
                    this.deviceAdapters[deviceName] = new MotionTimeline(this.mainController, deviceName, device["friendly_name"], this);
                } else if(deviceName.indexOf(".remote_ui") != -1) {
                    // Ignore
                } else {
                    console.log("TODO: show timeline for " + deviceName);
                }
            } else if(deviceName.indexOf("battery") != -1) {
                this.deviceAdapters[deviceName] = new BatteryTimeline(this.mainController, deviceName, device["friendly_name"], this);
            } else if(deviceName.indexOf("smoke") != -1) {
                this.deviceAdapters[deviceName] = new GenericDeviceTimeline(this.mainController, deviceName, device["friendly_name"], "smoke.png", this);
            } else if(deviceName.indexOf("thermostat.") != -1) {
                    this.deviceAdapters[deviceName] = new GenericDeviceTimeline(this.mainController, deviceName, device["friendly_name"], "thermostat.png", this);
                //    this.deviceAdapters[deviceName] = new ThermostatTimeline(deviceName, device["friendly_name"], this);
            } else if(deviceName.indexOf("_temperature") != -1) {
                this.deviceAdapters[deviceName] = new TemperatureTimeline(this.mainController, deviceName, device["friendly_name"], this);
            } else if(deviceName.indexOf("wind_speed") != -1) {
                this.deviceAdapters[deviceName] = new WindTimeline(this.mainController, deviceName, device["friendly_name"], this);
            } else if(deviceName.indexOf("_coordinate") != -1) {
                // Decreases performance a lot
                this.deviceAdapters[deviceName] = new CoordinateTimeline(this.mainController, deviceName, device["friendly_name"], this);
            } else if(deviceName.indexOf("device_tracker.") != -1) {
                this.deviceAdapters[deviceName] = new DeviceTrackerTimeline(this.mainController, deviceName, device["friendly_name"], this);
            } else if(deviceName.indexOf("heater.") != -1) {
                this.deviceAdapters[deviceName] = new HeaterTimeline(this.mainController, deviceName, device["friendly_name"], this);
            } else if(deviceName.indexOf("cooler.") != -1) {
                this.deviceAdapters[deviceName] = new AircoTimeline(this.mainController, deviceName, device["friendly_name"], this);
            } else if(deviceName.indexOf(".roomba") != -1) {
                this.deviceAdapters[deviceName] = new GenericDeviceTimeline(this.mainController, deviceName, device["friendly_name"],"roomba.png", this);
            } else if(deviceName.indexOf("blinds.") != -1) {
                this.deviceAdapters[deviceName] = new GenericDeviceTimeline(this.mainController, deviceName, device["friendly_name"], "blinds.png", this);
            } else if(deviceName.indexOf("person.") != -1) {
                this.deviceAdapters[deviceName] = new PersonTimeline(this.mainController, deviceName, device["friendly_name"], this);
            } else {
                console.log("TODO: show timeline for " + deviceName);
            }

            if(this.deviceAdapters[deviceName] == null) {
                this.deviceAdapters[deviceName].setRedundancyBad(device["redundancy_bad"]);
                this.deviceAdapters[deviceName].setChangeCoolDown(device["change_cooldown"]);
            }
        }

        // Then we can load the rules
        this.ruleClient.loadRules(this);
    }

    public reAlign(range) {
        if(typeof range.event === "undefined") return; // This is caused by myself

        $.each(this.deviceAdapters, function(identifier: string, adapter: DeviceTimeline) {
            adapter.reAlign(range);
        });

        this.rulesAdapter.reAlign(range);
    }

    public setWindow(range) {
        $.each(this.deviceAdapters, function(identifier: string, adapter: DeviceTimeline) {
            adapter.setWindow(range);
        });

        this.rulesAdapter.setWindow(range);
    }

    public updateDevices(devices) {
        for (let device of devices) {
            if(device["id"] in this.deviceAdapters) {
                this.deviceAdapters[device["id"]].setAvailable(device["available"]);
            }
        }
    }

    public redraw(deviceChangesMap: any, executions, conflicts, feedforward: boolean, selectedActionExecution: any) {
        if(this.redrawing) return;

        this.redrawing = true;

        this.redrawStates(deviceChangesMap, feedforward);
        this.redrawRules(executions, feedforward);
        this.highlightConflictingStates(conflicts);


        if(selectedActionExecution != null) {
            this.mainController.selectActionExecution(selectedActionExecution["action_execution_id"]);
        } else {
            this.mainController.clearSelection(false);
        }

        this.redrawing = false;
    }

    private redrawStates(deviceChangesMap, feedforward: boolean) {
        for(let deviceName in deviceChangesMap) {
            if (typeof this.deviceAdapters[deviceName] !== "undefined") {
                this.deviceAdapters[deviceName].redrawVisualisation(deviceChangesMap[deviceName], feedforward);
            }
        }
    }

    private redrawRules(executionEvents, feedforward: boolean) {
        this.rulesAdapter.redrawVisualisation(executionEvents, feedforward);
    }

    /** Add exclemation marks to all conflicted states */
    private highlightConflictingStates(conflicts: any) {
        $(".state_item_wrapper.conflict").removeClass("conflict");

        for(let conflict of conflicts) {
            for(let conflictingState of conflict["conflicting_states"]) {
                $("#" + conflictingState["context"]["id"]).closest(".state_item_wrapper").addClass("conflict");
            }
        }
    }

    drawCustomTime(date) {
        this.clearCustomTime();

        $.each(this.deviceAdapters, function(identifier: string, adapter: DeviceTimeline) {
            adapter.drawCustomTime(date);
        });

        this.rulesAdapter.drawCustomTime(date);
        this.hasCustomTime = true;
    }

    setAllRulesVisible(visible: boolean) {
        // Can eventueel nog iets anders doen
    }

    setAllDevicesVisible(visible: boolean) {
        $.each(this.deviceAdapters, function(identifier: string, adapter: DeviceTimeline) {
            adapter.setVisible(visible);
        });
    }

    selectExecution(executionID: string) {
        $("#" + executionID).addClass("selected");
    }

    clearSelection(nextSelectionExpected: boolean) {
        $("span.highlighted_state").removeClass("highlighted_state");
        $(".state_item_wrapper .trigger img").attr("src", "img/warning.png").attr("title", "This state will be involved in conflict");
        $(".state_item_wrapper").removeClass("trigger action condition conflict_related").attr("title", "");
        $(".vis-point").removeClass("vis-selected");
        $(".event_item").removeClass("selected");
        $(".action_execution").removeClass("highlighted conflict_related");
       // $("#back_button").addClass("hidden");

        if(!nextSelectionExpected) {
            this.setAllDevicesVisible(true);
            this.setAllRulesVisible(true);
        }

        this.clearCustomTime();
        this.rulesAdapter.clearConflict();
    }

    clearCustomTime() {
        $.each(this.deviceAdapters, function(identifier: string, adapter: DeviceTimeline) {
            adapter.clearCustomTime();
            adapter.clearHighlights();
        });

        this.rulesAdapter.clearCustomTime();
    }

    getMainController(): IoTController {
        return this.mainController;
    }

    /**
     * Create a new merged lists of states and executions that keep track of differences
     * @param originalStates
     * @param alternativeStates
     * @param originalExecutions
     * @param alternativeExecutions
     */
    showFeedforward(originalFutureStates: any, alternativeFutureStates: any, originalExecutions: any[], alternativeExecutions: any[], originalConflicts: any[], alternativeConflicts: any[], selectedActionExecution: any) {
        let mergedFutureStates = this.mergeStates(originalFutureStates, alternativeFutureStates, originalExecutions, alternativeExecutions, alternativeConflicts);
        let mergedStates = this.stateClient.combineStateHistoryAndFuture(mergedFutureStates);
        let mergedExecutions = this.mergeAllExecutions(originalExecutions, alternativeExecutions);
        let mergedConflicts = this.mergeConflicts(originalConflicts, alternativeConflicts);

        this.redraw(mergedStates, mergedExecutions, mergedConflicts, true, selectedActionExecution);
    }

    /**
     * Check which rule executions will be new, which ones will be deprecated
     * @param originalExecutions
     * @param alternativeExecutions
     */
    mergeAllExecutions(originalExecutions: any[], alternativeExecutions: any[]) {
        let mergedExecutions = [];

        for(let originalExecution of originalExecutions) {
            let matchingAlternativeExecution = null;
            let alternativeCounter;

            for(alternativeCounter = 0; alternativeCounter < alternativeExecutions.length; alternativeCounter++) {
                let alternativeExecution = alternativeExecutions[alternativeCounter];

                if(new Date(originalExecution["datetime"]).getTime() == new Date(alternativeExecution["datetime"]).getTime() && originalExecution["rule_id"] == alternativeExecution["rule_id"] && originalExecution["trigger_entity"] == alternativeExecution["trigger_entity"]) {
                    matchingAlternativeExecution = alternativeExecution;
                    break;
                }
            }

            mergedExecutions.push(this.mergeRuleExecutions(originalExecution, matchingAlternativeExecution));

            // Remove from list
            if(matchingAlternativeExecution != null) {
                alternativeExecutions.splice(alternativeCounter, 1); // remove from alternative states
            }
        }

        // Add all alternativeExecutions
        for(let alternativeExecution of alternativeExecutions) {
            mergedExecutions.push(this.mergeRuleExecutions(null, alternativeExecution));
        }

        return mergedExecutions;
    }

    private mergeConflicts(originalConflicts: any[], alternativeConflicts: any[]) {
        let mergedConflicts = [];

        //console.log(originalConflicts);
        //console.log(alternativeConflicts);

        return alternativeConflicts;
    }

    /**
     * IF original = null -> new
     * IF alternative = null -> deprecated
     * both not null -> check the differences (becomes effective, no longer effective, the same)
     * Altijd dezelfde rule
     * @param originalRuleExecution
     * @param alternativeRuleExecution
     */
    mergeRuleExecutions(originalRuleExecution, alternativeRuleExecution) {
        // IF original = null -> new
        if(originalRuleExecution == null) {
            for(let actionExecution of alternativeRuleExecution["action_executions"]) {
                actionExecution["future"] = "new";
            }

            return alternativeRuleExecution;
        }

        // IF alternative = null -> deprecated
        if(alternativeRuleExecution == null) {
            for (let actionExecution of originalRuleExecution["action_executions"]) {
                actionExecution["future"] = "deprecated";
            }

            return originalRuleExecution;
        }

        // Both not null -> check the differences (becomes effective, no longer effective, the same)
        for(let actionExecutionCounter = 0; actionExecutionCounter < originalRuleExecution["action_executions"].length; actionExecutionCounter++) {
            let originalActionExecution = originalRuleExecution["action_executions"][actionExecutionCounter];
            let alternativeActionExecution = alternativeRuleExecution["action_executions"][actionExecutionCounter];

            if(originalActionExecution["snoozed"] && alternativeActionExecution["snoozed"]) {
                originalActionExecution["future"] = "unchanged";
            } else if(alternativeActionExecution["snoozed"]) {
                originalActionExecution["future"] = "becomes_snoozed";
            } else {
                // Will (still not / no longer) be snoozed
                if((originalActionExecution["snoozed"] || originalActionExecution["has_effects"]) && (!alternativeActionExecution["snoozed"] && !alternativeActionExecution["has_effects"])) {
                    originalActionExecution["future"] = "becomes_ineffective";
                } else if(originalActionExecution["has_effects"] == alternativeActionExecution["has_effects"]) {
                    originalActionExecution["future"] = "unchanged";
                } else {
                    originalActionExecution["future"] = "becomes_effective";
                }
            }
        }

        return originalRuleExecution;
    }

    /**
     * Find out the differences between the two stateMaps
     * @param originalStatesMap
     * @param alternativeStatesMap
     */
    mergeStates(originalStatesMap: any, alternativeStatesMap: any, originalExecutions: any[], alternativeExecutions: any[], alternativeConflicts: any[]): any {
        let mergedStates = {};

        for(let deviceID in originalStatesMap) {
           // if(deviceID != "light.living_spots") continue;

            let originalStates = originalStatesMap[deviceID];
            let alternativeStates = alternativeStatesMap[deviceID];
            let originalStatesCounter = 0;
            let alternativeStatesCounter = 0;
            mergedStates[deviceID] = [];

            while(originalStatesCounter < originalStates.length || alternativeStatesCounter < alternativeStates.length) {
                let originalStatesTick = [];
                let alternativeStatesTick = [];
                let tickTime;

                if(originalStatesCounter >= originalStates.length) {
                    tickTime = new Date(alternativeStates[alternativeStatesCounter]["last_changed"]);
                } else if(alternativeStatesCounter >= alternativeStates.length) {
                    tickTime = new Date(originalStates[originalStatesCounter]["last_changed"]);
                } else {
                    tickTime = new Date(Math.min(new Date(alternativeStates[alternativeStatesCounter]["last_changed"]).getTime(), new Date(originalStates[originalStatesCounter]["last_changed"]).getTime()));
                }

                // Push all original states that happen at this time
                while(originalStatesCounter < originalStates.length && tickTime.getTime() == new Date(originalStates[originalStatesCounter]["last_changed"]).getTime()) {
                    originalStatesTick.push(originalStates[originalStatesCounter]);
                    originalStatesCounter++;
                }

                // Push all original states that happen at this time
                while(alternativeStatesCounter < alternativeStates.length && tickTime.getTime() == new Date(alternativeStates[alternativeStatesCounter]["last_changed"]).getTime()) {
                    alternativeStatesTick.push(alternativeStates[alternativeStatesCounter]);
                    alternativeStatesCounter++;
                }

                mergedStates[deviceID] = mergedStates[deviceID].concat(this.mergeStatesTick(originalStatesTick, alternativeStatesTick, originalExecutions, alternativeExecutions, alternativeConflicts));
            }
        }

        return mergedStates;
    }

    /**
     * Merge all states that happen at the same tick.
     * Use the originalExecutions and alternativeExecutions to more accurately decide which states are new
     * @param originalStates
     * @param alternativeStates
     */
    mergeStatesTick(originalStates: any [], alternativeStates: any [], originalExecutions: any[], alternativeExecutions: any[], alternativeConflicts: any[]) {
        let mergedStates = [];

        for(let originalStatesCounter = 0; originalStatesCounter < originalStates.length; originalStatesCounter++) {
            let originalState = JSON.parse(JSON.stringify(originalStates[originalStatesCounter]));
            let originalRuleExecution = this.futureClient.getRuleExecutionByActionContextID(originalState["context"]["id"], originalExecutions);
            originalState["future"] = "unchanged";
            let found = false;

            // Try to check if there is state matching in the alternatives
            for(let alternativeCounter = 0; alternativeCounter < alternativeStates.length; alternativeCounter++) {
                let alternativeState = alternativeStates[alternativeCounter];
                let alternativeRuleExecution = this.futureClient.getRuleExecutionByActionContextID(alternativeState["context"]["id"], alternativeExecutions);

                if(this.isSameStatePrediction(originalState, alternativeState, originalRuleExecution, alternativeRuleExecution)) {
                    found = true;

                    // Change context id in conflict from alternativeState to originalState
                    this.updateAlternativeConflicts(originalState["context"]["id"], alternativeState["context"]["id"], alternativeConflicts);

                    if(!originalState["is_new"] && alternativeState["is_new"]) {
                        originalState["is_new"] = true;
                        originalState["future"] = "new";
                    }

                    alternativeStates.splice(alternativeCounter, 1); // remove from alternative states
                    break;
                }
            }

            if(!found) {
                originalState["future"] = "deprecated";
            }

            mergedStates.push(originalState);
        }

        // the remaining alternative states are new
        for(let alternativeCounter = 0; alternativeCounter < alternativeStates.length; alternativeCounter++) {
            alternativeStates[alternativeCounter]["future"] = "new";
            mergedStates.push(alternativeStates[alternativeCounter]);
        }

        return mergedStates;
    }

    drawConflict(relatedConflict) {
        this.rulesAdapter.redrawConflict(relatedConflict);

        for (let conflictedState of relatedConflict["conflicting_states"]) {
            $("#" + conflictedState["context"]["id"]).closest(".state_item_wrapper").addClass("conflict_related");
        }
    }

    highlightActions(actionContexts: string[]) {
        for(let actionContext of actionContexts) {
            this.highlightAction(actionContext["id"]);
        }
    }

    highlightConditions(triggerContextIDs: string[]) {
        for(let triggerContextID of triggerContextIDs) {
            this.highlightCondition(triggerContextID);
        }
    }

    highlightTrigger(stateContextID: string) {
        $("#" + stateContextID).closest(".state_item_wrapper").addClass("trigger");
        $("#" + stateContextID).closest(".state_item_wrapper").find("img").attr("src", "img/trigger.png").attr("title", "This state will be the trigger");
    }

    highlightCondition(stateContextID: string) {
        $("#" + stateContextID).closest(".state_item_wrapper").addClass("condition");
        $("#" + stateContextID).closest(".state_item_wrapper").attr("title", "This state will be satisfy the condition");
    }

    highlightAction(stateContextID: string) {
        $("#" + stateContextID).addClass("highlighted_state");
        $("#" + stateContextID).closest(".state_item_wrapper").addClass("action");
        $("#" + stateContextID).closest(".state_item_wrapper").attr("title", "This state will be result from executing the rule");
    }

    highlightActionExecution(actionExecutionID: string) {
        $("#" + actionExecutionID).addClass("highlighted");
    }

    loadingCompleted() {
        $(".devices_column").removeClass("hidden");
        $("#connection_error").remove();
        $("#reload").removeClass("disabled");
        $(".timeline_wrapper").removeClass("hidden");
    }

    compareStateTimes(stateA, stateB) {
        let timestampA = new Date(stateA.last_changed).getTime();
        let timestampB = new Date(stateB.last_changed).getTime();

        if (timestampA < timestampB ){
            return -1;
        }
        if (timestampA > timestampB ){
            return 1;
        }
        return 0;
    }

    /**
     * Check if two states correspond to each other (but might be different)
     * @param originalState
     * @param alternativeState
     * @param originalRuleExecution
     * @param alternativeRuleExecution
     * @Pre the states happen at the sametime, on the same device
     * @pre the causes for the states have been lookedUp already (but might be null)
     */
    isSameStatePrediction(originalState: any, alternativeState: any, originalRuleExecution: any, alternativeRuleExecution : any) {
        if(originalState["context"]["id"] == alternativeState["context"]["id"]) {
            // Dezelfde contextID -> hetzelfde
            return true;
        } else {
            // Verschillende contextID
            if(originalRuleExecution == null && alternativeRuleExecution == null) {
                // Geen oorzaak bekend -> return IF dezelfde staat
                return originalState["state"] == alternativeState["state"];
            } else  {
                // Normaal zouden ze dan alletwee wel een cause moeten hebben.

                // Wel oorzaak bekend? -> return dezelfde oorzaak?
                return originalRuleExecution["trigger_entity"] == alternativeRuleExecution["trigger_entity"] && originalRuleExecution["rule_id"] == alternativeRuleExecution["rule_id"];
            }
        }
    }

    isSameActionPrediction(originalActionExecution: any, alternativeActionExecution: any, originalRuleExecution: any, alternativeRuleExecution : any) {
        return originalRuleExecution["trigger_entity"] == alternativeRuleExecution["trigger_entity"] && originalActionExecution["action_id"] == alternativeActionExecution["action_id"];
    }

    /**
     * Map alternative conflicts to the original states
     * @param originalContextID
     * @param alternativeContextID
     * @param alternativeConflicts
     * @private
     */
    private updateAlternativeConflicts(originalContextID: any, alternativeContextID: any, alternativeConflicts: any[]) {
        for(let alternativeConflict of alternativeConflicts) {
            for(let conflictingStateIndex in alternativeConflict["conflicting_states"]) {
                let conflictingState = alternativeConflict["conflicting_states"][conflictingStateIndex];

                if(conflictingState["context"]["id"] == alternativeContextID) {
                    conflictingState["context"]["id"] = originalContextID;
                }
            }
        }
    }
}