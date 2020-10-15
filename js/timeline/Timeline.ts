class Timeline {
    private mainController: IoTController;
    private ruleClient: RuleClient;
    private stateClient: StateClient;
    private deviceClient: DeviceClient;
    private configClient: ConfigClient;
    private conflictsClient: ConflictClient;
    private futureClient: FutureClient;

    private deviceAdapters: {};
    private rulesAdapter: RulesTimeline;

    private hasCustomTime: boolean;

    private showingOnlyContext: boolean;
    private redrawing: boolean;

    constructor(mainController: IoTController, ruleClient: RuleClient, stateClient: StateClient, deviceClient: DeviceClient, configClient: ConfigClient, conflictsClient: ConflictClient, futureClient: FutureClient) {
        this.mainController = mainController;
        this.ruleClient = ruleClient;
        this.stateClient = stateClient;
        this.deviceClient = deviceClient;
        this.configClient = configClient;
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

    public redraw(states: any, executions, conflicts, feedforward: boolean, selectedActionExecution: any) {
        if(this.redrawing) return;

        this.redrawing = true;

        this.redrawStates(states, feedforward);
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

    hasEffects(actionExecution: any) : boolean {
        for(let resultingContext of actionExecution["resulting_contexts"]) {
            if($("#" + resultingContext["id"]).length > 0) return true;
        }

        return false;
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
        $(".state_item_wrapper").removeClass("trigger action condition conflict_related");
        $(".vis-point").removeClass("vis-selected");
        $(".event_item").removeClass("selected");
        $(".action_execution").removeClass("highlighted conflict_related");
        $(".state_item_wrapper").attr("title", "");
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
    showFeedforward(originalStates: any, alternativeStates: any, originalExecutions: any[], alternativeExecutions: any[], originalConflicts: any[], newConflicts: any[], selectedActionExecution: any) {
        let mergedStates = this.mergeStates(originalStates, alternativeStates);
        let mergedExecutions = this.mergeExecutions(originalExecutions, alternativeExecutions);
        // TODO: merge conflicts
        let mergedConflicts = [];

        // Show stats:
        //console.log("ORIGINAL FUTURE: " + originalStates.length);
        // console.log("ALTERNATIVE FUTURE: " + alternativeStates.length);
        //this.showMergeStateStats(mergedStates);

        this.redraw(mergedStates, mergedExecutions, mergedConflicts, true, selectedActionExecution);
    }

    mergeExecutions(originalExecutions: any[], alternativeExecutions: any[]) {
        let mergedExecutions = alternativeExecutions;

        return mergedExecutions;
    }

    mergeStates(originalStates: any[], alternativeStates: any[]): any {
        let mergedStates = [];
        let alternativeCounter = 0;

        // All objects from the originalStates should be in there: unchanged/changed/deprecated
        for(let originalCounter = 0; originalCounter < originalStates.length; ++originalCounter) {
            let originalString = JSON.stringify(originalStates[originalCounter]);
            let originalContext = originalStates[originalCounter]["context"]["id"];
            let originalDate = originalStates[originalCounter]["last_changed"];
            let originalState = originalStates[originalCounter]["state"];
            let found = false;

            //  console.log("Original " + originalCounter + " " + originalContext + " " + originalDate + " " + originalState);

            // ADD ELEMENTS UNTIL THE ALTERNATIVE STATES CATCH UP WITH THE ORIGINAL STATES
            for(; alternativeCounter < alternativeStates.length; alternativeCounter++) {
                let alternativeString = JSON.stringify(alternativeStates[alternativeCounter]);
                let alternativeContext = alternativeStates[alternativeCounter]["context"]["id"];
                let alternativeDate = alternativeStates[alternativeCounter]["last_changed"];
                let alternativeState = alternativeStates[alternativeCounter]["state"];

                if(alternativeDate > originalDate) break;

                // IF THE STATES ARE IDENTICAL
                if(originalString == alternativeString) {
                    //      console.log("\tAlternative " + alternativeCounter + " " + alternativeContext + " " + alternativeDate + " " + alternativeState + "[UNCHANGED]");
                    alternativeStates[alternativeCounter]["future"] = "UNCHANGED";
                    mergedStates.push(alternativeStates[alternativeCounter]);
                    found = true;
                    alternativeCounter++;
                    break;
                } else if(Date.parse(alternativeDate) == Date.parse(originalDate)) {
                    let originalWithoutContext = originalString.replace(originalContext, "");
                    let alternativeWithoutContext = alternativeString.replace(alternativeContext, "");

                    // Counter the fact that future contexts are randomly generated
                    if(originalWithoutContext == alternativeWithoutContext) {
                        alternativeStates[alternativeCounter]["future"] = "UNCHANGED";
                    } else {
                        alternativeStates[alternativeCounter]["future"] = "CHANGED";
                    }

                    //     console.log("\tAlternative " + alternativeCounter + " " + alternativeContext + " " + alternativeDate + " " + alternativeState + "[CHANGED]");
                    // IF THE STATES HAVE THE SAME TIMESTAMP, BUT DIFFERENT VALUES
                    mergedStates.push(alternativeStates[alternativeCounter]);
                    found = true;
                    alternativeCounter++;
                    break;
                } else {
                    //     console.log("\tAlternative " + alternativeCounter + " " + alternativeContext + " " + alternativeDate + " " + alternativeState + "[NEW]");
                    // THE ALTERNATIVE STATE DID NOT EXIST YET
                    alternativeStates[alternativeCounter]["future"] = "NEW";
                    mergedStates.push(alternativeStates[alternativeCounter]);
                }
            }

            // If the original state nog longer occurs in the alternative future
            if(!found) {
                originalStates[originalCounter]["future"] = "DEPRECATED";
                mergedStates.push(originalStates[originalCounter]);
                //   console.log("[DEPRECATED]");
            }
        }

        // Remaining items
        for(; alternativeCounter < alternativeStates.length; alternativeCounter++) {
            let alternativeContext = alternativeStates[alternativeCounter]["context"]["id"];
            let alternativeDate = alternativeStates[alternativeCounter]["last_changed"];
            let alternativeState = alternativeStates[alternativeCounter]["state"];

            // console.log("\tAlternative " + alternativeCounter + " " + alternativeContext + " " + alternativeDate + " " + alternativeState + "[NEW]");
            // THE ALTERNATIVE STATE DID NOT EXIST YET
            alternativeStates[alternativeCounter]["future"] = "NEW";
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

    showMergeStateStats(mergedStates) {
        let unchangedCounter = 0;
        let changedCounter = 0;
        let deprecatedCounter = 0;
        let newCounter = 0;

        for(let mergedState of mergedStates) {
            if(mergedState["future"] === "NEW") {
                newCounter++;
            } else if(mergedState["future"] === "DEPRECATED") {
                deprecatedCounter++;
            } else if(mergedState["future"] === "CHANGED") {
                changedCounter++;
            } else if(mergedState["future"] === "UNCHANGED") {
                unchangedCounter++;
            }
        }

        console.log("NEW: +" + newCounter);
        console.log("DEPRECATED: -" + deprecatedCounter);
        console.log("CHANGED: ~" + changedCounter);
        console.log("UNCHANGED: =" + unchangedCounter);
        console.log(mergedStates);
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
}