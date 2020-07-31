class Timeline {
    private mainController: IoTController;
    private ruleClient: RuleClient;
    private stateClient: StateClient;
    private deviceClient: DeviceClient;
    private configClient: ConfigClient;

    private deviceAdapters: {};
    private ruleAdapters: {};
    private axisTimeline: AxisTimeline;

    private hasCustomTime: boolean;

    private selectedExecutionID: string;
    private showingOnlyContext: boolean;
    private redrawing: boolean;

    constructor(mainController: IoTController, ruleClient: RuleClient, stateClient: StateClient, deviceClient: DeviceClient, configClient: ConfigClient) {
        this.mainController = mainController;
        this.ruleClient = ruleClient;
        this.stateClient = stateClient;
        this.deviceClient = deviceClient;
        this.configClient = configClient;
        this.hasCustomTime = false;
        this.selectedExecutionID = null;
        this.showingOnlyContext = true;
        this.ruleAdapters = {};
        this.deviceAdapters = {};

        this.deviceClient.loadDevices(this);
        this.redrawing = false;

        $(".timeline_device_main_attribute .timeline_label").click(function () {
            $(this).closest(".timeline_device").find(".timeline_device_attributes").toggle();
        });
    }

    /**
     * Second, initialise the rules
     * Callback function for when the ruleClient is finished loading
     * @param devices
     */
    public initializeRules(rules) {
        // User rules
        for (let ruleID in rules) {
            if(ruleID.indexOf("system_rule") == -1) {
                this.ruleAdapters[ruleID] = new RuleTimeline(ruleID, rules[ruleID]["description"], this, rules[ruleID]["actions"]);
            }
        }

        // System rules
        for (let ruleID in rules) {
            if(ruleID.indexOf("system_rule") != -1) {
                this.ruleAdapters[ruleID] = new ImplicitRuleTimeline(ruleID, rules[ruleID]["description"], this);
            }
        }

        // Finally render the axis and load actual data
        this.axisTimeline = new AxisTimeline(this);
        this.mainController.refresh();
    }

    /**
     * First, initialise the devices
     * Callback function for when the deviceClient is finished loading
     * @param devices
     */
    public initializeDevices(devices) {
        // Sort alphabetically
        devices.sort(function(a, b): number {
            return a["friendly_name"].localeCompare(b["friendly_name"]);
        });

        for (let device of devices) {
            if(device["id"].indexOf("light.") == 0) {
                this.deviceAdapters[device["id"]] = new HueTimeline(device["id"], device["friendly_name"], this);
            } else if(device["id"].indexOf("lock.") == 0) {
                this.deviceAdapters[device["id"]] = new GenericDeviceTimeline(device["id"], device["friendly_name"], "lock.png", this);
            } else if(device["id"].indexOf("sirene.") == 0) {
                this.deviceAdapters[device["id"]] = new GenericDeviceTimeline(device["id"], device["friendly_name"], "sirene.png", this);
            } else if(device["id"].indexOf("sun.") == 0) {
                this.deviceAdapters[device["id"]] = new SunTimeline(device["id"], this);
            } else if(device["id"].indexOf("switch.outlet") == 0) {
                this.deviceAdapters[device["id"]] = new OutletTimeline(device["id"], device["friendly_name"], this);
            } else if(device["id"].indexOf("screen.") == 0) {
                this.deviceAdapters[device["id"]] = new GenericDeviceTimeline(device["id"], device["friendly_name"], "screen.png", this);
            } else if(device["id"].indexOf("weather.dark_sky") == 0) {
                this.deviceAdapters[device["id"]] = new WeatherTimeline(device["id"], this);
            } else if(device["id"].indexOf("calendar.") == 0) {
                this.deviceAdapters[device["id"]] = new CalendarTimeline(device["id"], device["friendly_name"], this);
            } else if(device["id"].indexOf("agoralaan_diepenbeek") != -1) {
                this.deviceAdapters[device["id"]] = new BusStopTimeline(device["id"], device["friendly_name"], this);
            } else if(device["id"].indexOf("sensor.moon") != -1) {
                this.deviceAdapters[device["id"]] = new MoonTimeline(device["id"], device["friendly_name"], this);
            } else if(device["id"].indexOf("sensor.people_home_counter") != -1) {
                this.deviceAdapters[device["id"]] = new PersonCounterTimeline(device["id"], device["friendly_name"], this);
            } else if(device["id"].indexOf("routine.") != -1) {
                this.deviceAdapters[device["id"]] = new GenericDeviceTimeline(device["id"], device["friendly_name"], "routine.png", this);
            } else if(device["id"].indexOf("binary_sensor.") != -1) {
                if(device["id"].indexOf("_contact") != -1) {
                    this.deviceAdapters[device["id"]] = new ContactTimeline(device["id"], device["friendly_name"], this);
                } else if(device["id"].indexOf("_acceleration") != -1) {
                    this.deviceAdapters[device["id"]] = new AccelerationTimeline(device["id"], device["friendly_name"], this);
                } else if(device["id"].indexOf("sensor_motion") != -1) {
                    this.deviceAdapters[device["id"]] = new MotionTimeline(device["id"], device["friendly_name"], this);
                } else if(device["id"].indexOf(".remote_ui") != -1) {
                    // Ignore
                } else {
                    console.log("TODO: show timeline for " + device["id"]);
                }
            } else if(device["id"].indexOf("battery") != -1) {
                this.deviceAdapters[device["id"]] = new BatteryTimeline(device["id"], device["friendly_name"], this);
            } else if(device["id"].indexOf("smoke") != -1) {
                this.deviceAdapters[device["id"]] = new GenericDeviceTimeline(device["id"], device["friendly_name"], "smoke.png", this);
            } else if(device["id"].indexOf("thermostat.") != -1) {
                    this.deviceAdapters[device["id"]] = new GenericDeviceTimeline(device["id"], device["friendly_name"], "thermostat.png", this);
                //    this.deviceAdapters[device["id"]] = new ThermostatTimeline(device["id"], device["friendly_name"], this);
            } else if(device["id"].indexOf("_temperature") != -1) {
                this.deviceAdapters[device["id"]] = new TemperatureTimeline(device["id"], device["friendly_name"], this);
            } else if(device["id"].indexOf("wind_speed") != -1) {
                this.deviceAdapters[device["id"]] = new WindTimeline(device["id"], device["friendly_name"], this);
            } else if(device["id"].indexOf("_coordinate") != -1) {
                // Decreases performance a lot
                this.deviceAdapters[device["id"]] = new CoordinateTimeline(device["id"], device["friendly_name"], this);
            } else if(device["id"].indexOf("device_tracker.") != -1) {
                this.deviceAdapters[device["id"]] = new DeviceTrackerTimeline(device["id"], device["friendly_name"], this);
            } else if(device["id"].indexOf("heater.") != -1) {
                this.deviceAdapters[device["id"]] = new HeaterTimeline(device["id"], device["friendly_name"], this);
            } else if(device["id"].indexOf("cooler.") != -1) {
                this.deviceAdapters[device["id"]] = new AircoTimeline(device["id"], device["friendly_name"], this);
            } else if(device["id"].indexOf(".roomba") != -1) {
                this.deviceAdapters[device["id"]] = new GenericDeviceTimeline(device["id"], device["friendly_name"],"roomba.png", this);
            } else if(device["id"].indexOf("blinds.") != -1) {
                this.deviceAdapters[device["id"]] = new GenericDeviceTimeline(device["id"], device["friendly_name"], "blinds.png", this);
            } else if(device["id"].indexOf("person.") != -1) {
                this.deviceAdapters[device["id"]] = new PersonTimeline(device["id"], device["friendly_name"], this);
            } else {
                console.log("TODO: show timeline for " + device["id"]);
            }
        }

        // Then we can load the rules
        this.ruleClient.loadRules(this);
    }

    public reAlign(range, deviceName) {
        if(typeof range.event === "undefined") return; // This is caused by myself

        $.each(this.deviceAdapters, function(identifier: string, adapter: DeviceTimeline) {
            adapter.reAlign(range);
        });

        $.each(this.ruleAdapters, function(identifier: string, adapter: DeviceTimeline) {
            adapter.reAlign(range);
        });

        this.axisTimeline.reAlign(range);
    }

    public updateDevices(devices) {
        for (let device of devices) {
            if(device["id"] in this.deviceAdapters) {
                this.deviceAdapters[device["id"]].setAvailable(device["available"]);
            }
        }
    }

    public updateRules(rules) {
        for (let ruleID in rules) {
            if(ruleID in this.ruleAdapters) {
                this.ruleAdapters[ruleID].setAvailable(rules[ruleID]["available"]);
            }
        }
    }

    public redraw(states, executions, feedforward: boolean) {
        if(this.redrawing) return;

        this.redrawing = true;

        this.redrawStates(states, feedforward);
        this.redrawRules(executions);

        if(this.selectedExecutionID != null && !feedforward) {
            this.highlightExecution(this.selectedExecutionID);
        }

        this.redrawing = false;
    }

    private redrawStates(timeData, feedforward: boolean) {
        let deviceChangesMap = this.groupChangesByDevice(timeData);

        for(let deviceName in deviceChangesMap) {
            if (typeof this.deviceAdapters[deviceName] !== "undefined") {
                this.deviceAdapters[deviceName].redrawVisualisation(deviceChangesMap[deviceName], feedforward);
            }
        }
    }

    private redrawRules(executionEvents) {
        let deviceChangesMap = this.groupChangesByRule(executionEvents);

        for(let deviceName in deviceChangesMap) {
            if (typeof this.ruleAdapters[deviceName] !== "undefined") {
                this.ruleAdapters[deviceName].redrawVisualisation(deviceChangesMap[deviceName]);
            }
        }
    }

    groupChangesByRule(changes) {
        let groups = {};

        for(let ruleID in this.ruleAdapters) {
            groups[ruleID] = [];
        }

        for(let i = 0; i < changes.length; i++) {
            if((changes[i]["entity_id"] in groups)) {
                groups[changes[i]["entity_id"]].push(changes[i]);
            }
        }

        return groups;
    }

    groupChangesByDevice(changes) {
        let groups = {};

        for(let deviceID in this.deviceAdapters) {
            groups[deviceID] = [];
        }

        for(let i = 0; i < changes.length; i++) {
            if((changes[i]["entity_id"] in groups)) {
                groups[changes[i]["entity_id"]].push(changes[i]);
            }
        }

        return groups;
    }

    drawCustomTime(date) {
        this.clearCustomTime();

        $.each(this.deviceAdapters, function(identifier: string, adapter: DeviceTimeline) {
            adapter.drawCustomTime(date);
        });

        $.each(this.ruleAdapters, function(identifier: string, adapter: RuleTimeline) {
            adapter.drawCustomTime(date);
        });

        this.axisTimeline.drawCustomTime(date);

        this.hasCustomTime = true;
    }

    executionClicked(executionID: string) {
        this.clearSelection(true);

        if(executionID != null) {
            this.highlightExecution(executionID);
        }
    }

    highlightExecution(executionID: string) {
        let execution = this.ruleClient.getExecutionByID(executionID);

        if(execution != null) {
            this.hideAll();
            this.drawCustomTime(execution["datetime"]);
            this.selectExecution(executionID);
            this.selectedExecutionID = executionID;
            $("#back_button").removeClass("hidden");

            console.log("\t\tTriggered by:");
            this.highlightTriggers(this.ruleClient.getTriggerContextIDsByExecution(execution));

            console.log("\t\tCaused the actions");
            this.highlightActions(this.ruleClient.getActionContextIDsByExecution(execution));
        }
    }

    highlightActions(actionContextIDs: string[]) {
        for(let actionContextID of actionContextIDs) {
            console.log("\t\t - State " + actionContextID);
            this.selectAction(actionContextID);
        }
    }

    highlightTriggers(triggerContextIDs: string[]) {
        for(let triggerContextID of triggerContextIDs) {
            console.log("\t\t - State " + triggerContextID);
            this.selectTrigger(triggerContextID);
        }
    }

    stateHighlighted(stateContextID: string) {
        this.clearSelection(true);

        let causedByExecutions: string[] = this.ruleClient.getExecutionByAction(stateContextID);
        let resultedInExecutions: string[] = this.ruleClient.getExecutionsByTrigger(stateContextID);

        console.log("\nState " + stateContextID);

        if(causedByExecutions.length > 0) {
            console.log("\tCaused by: " + causedByExecutions[0]);
            this.highlightExecution(causedByExecutions[0]);

            if(causedByExecutions.length > 1) {
                console.error("States kunnen toch maar 1 oorzaak hebben???");
                for(let executionID of causedByExecutions) {
                    console.log("\t - Execution " + executionID);
                }
            }
        } else {
            console.log("\tCause unknown");
            this.clearSelection(false);
     /*       console.log("\tResulted in:");
            for(let executionID of resultedInExecutions) {
                console.log("\t - Execution " + executionID);
                this.highlightExecution(executionID);
            }*/
        }
    }

    anyActionsVisible(executionID: string ): boolean {
        let execution = this.ruleClient.getExecutionByID(executionID);

        if(execution == null) return false;

        let contextIDs: string[] = this.ruleClient.getActionContextIDsByExecution(execution);

        for(let contextID of contextIDs) {
            for(let adapterName in this.deviceAdapters) {
                if(this.deviceAdapters[adapterName].anyActionsVisible(contextID)) return true;
            }
        }

        return false;
    }

    hideAll() {
        // this.setAllRulesVisible(false);
      //  this.setAllDevicesVisible(false);
    }

    setAllRulesVisible(visible: boolean) {
        $.each(this.ruleAdapters, function(identifier: string, adapter: RuleTimeline) {
            adapter.setVisible(visible);
        });
    }

    setAllDevicesVisible(visible: boolean) {
        $.each(this.deviceAdapters, function(identifier: string, adapter: RuleTimeline) {
            adapter.setVisible(visible);
        });
    }

    selectExecution(executionID: string) {
        $.each(this.ruleAdapters, function(identifier: string, adapter: RuleTimeline) {
            adapter.selectExecution(executionID);
        });
    }

    selectTrigger(stateContext: string) {
        $.each(this.deviceAdapters, function(identifier: string, adapter: DeviceTimeline) {
            adapter.selectTrigger(stateContext);
        });
    }

    selectAction(stateContext: string) {
        $.each(this.deviceAdapters, function(identifier: string, adapter: DeviceTimeline) {
            adapter.selectAction(stateContext);
        });
    }

    clearSelection(nextSelectionExpected: boolean) {
        $(".state_item_wrapper").removeClass("trigger action");
        $(".vis-point").removeClass("vis-selected");
        $(".event_item").removeClass("selected");
       // $("#back_button").addClass("hidden");

        if(!nextSelectionExpected) {
            this.setAllDevicesVisible(true);
            this.setAllRulesVisible(true);
        }

        this.selectedExecutionID = null;
        this.clearCustomTime();
    }

    clearCustomTime() {
        if(this.hasCustomTime) {
            this.hasCustomTime = false;

            $.each(this.deviceAdapters, function(identifier: string, adapter: DeviceTimeline) {
                adapter.clearCustomTime();
                adapter.clearHighlights();
            });

            $.each(this.ruleAdapters, function(identifier: string, adapter: RuleTimeline) {
                adapter.clearCustomTime();
            });

            this.axisTimeline.clearCustomTime();
        }
    }

    getRuleClient(): RuleClient {
        return this.ruleClient;
    }

    getStateClient(): StateClient {
        return this.stateClient;
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
    showFeedforward(originalStates: any[], alternativeStates: any[], originalExecutions: any[], alternativeExecutions: any[]) {
        let mergedStates = this.mergeStates(originalStates, alternativeStates);
        let mergedExecutions = this.mergeExecutions(originalExecutions, alternativeExecutions);

        // Show stats:
        //console.log("ORIGINAL FUTURE: " + originalStates.length);
        // console.log("ALTERNATIVE FUTURE: " + alternativeStates.length);
        //this.showMergeStateStats(mergedStates);

        this.redraw(mergedStates, mergedExecutions, true);
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

    public getConfigClient(): ConfigClient {
        return this.configClient;
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
}