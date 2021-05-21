class FutureClient {
    mainController: IoTController;
    future: any;

    constructor(mainController: IoTController) {
        this.mainController = mainController;
        this.future = null;
    }

    public refresh() {
        this.loadFuture();
    }

    private loadFuture() {
        let oThis = this;
        $("#reload").addClass("disabled");

        let fileURL = "future"; // Default

        if(this.mainController.isRemote()) {
            if(this.mainController.isPredicting()) {
                fileURL = "future.json";
            } else {
                fileURL = "future_baseline.json";
            }
        }

        $.ajax({
            url:            this.mainController.API_URL + fileURL,
            type:           "GET",
        }).done(function (future) {
            oThis.checkRuleEffects(future);
            oThis.addAnchorTime(future);
            oThis.future = future;
            oThis.mainController.futureLoaded(future);
        });
    }

    private checkRuleEffects(future) {
        let states = future["states"];
        let ruleExecutions = future["executions"];

        // Init
        for(let ruleExecution of ruleExecutions) {
            for(let actionExecution of ruleExecution["action_executions"]) {
                actionExecution["has_effects"] = false;
            }
        }

        for(let entityID in states) {
            let entityStates = states[entityID];

            for(let entityState of entityStates) {
                if(entityState["is_new"]) {
                    // This state was an effect, look for its cause.
                    let actionExecution = this.getActionExecutionByResultingContextID(entityState["context"]["id"], ruleExecutions);

                    if(actionExecution != null) {
                        actionExecution["has_effects"] = true;
                    }
                }
            }
        }
    }

    public simulateAlternativeFuture(actionExecutionID: string, newEnabled: boolean) {
        let oThis = this;

        if(this.mainController.isRemote()) {
            let expectedFile = this.deduceFileName(actionExecutionID, newEnabled);

            //console.log(expectedFile);

            $.ajax({
                url:            this.mainController.API_URL + expectedFile,
                type:           "GET"
            }).done(function (alternativeFuture) {
                oThis.checkRuleEffects(alternativeFuture);
                oThis.addAnchorTime(alternativeFuture);
                oThis.mainController.alternativeFutureSimulationReady(alternativeFuture);
            });
        } else {
            let reEnabledActions = [];
            let snoozedActions = [];
            let ruleExecution = this.getRuleExecutionByActionExecutionID(actionExecutionID);

            if(ruleExecution != null) {
                let actionExecution = this.getActionExecutionByActionExecutionID(ruleExecution, actionExecutionID);

                if(newEnabled) {
                    // Now enabled -> remove snooze
                    reEnabledActions.push(actionExecution["snoozed_by"]);
                } else {
                    snoozedActions.push({
                        action_id: actionExecution["action_id"],
                        conflict_time_window: 20000,
                        trigger_entity_id: ruleExecution["trigger_entity"],
                        conflict_time: new Date(new Date(ruleExecution["datetime"]).getTime() - this.mainController.getAnchorDate().getTime())
                       // conflict_time: new Date(new Date(ruleExecution["datetime"]).getTime() - this.mainController.getAnchorDate().getTime())
                    });
                }
            }

            let simulationRequest = {
                extra_states: [],
                suppressed_state_contexts: [],
                snoozed_actions: snoozedActions,
                re_enabled_actions: reEnabledActions
            };

            $.ajax({
                url:            this.mainController.API_URL + "future/simulate",
                type:           "POST",
                data: JSON.stringify(simulationRequest),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
            }).done(function (alternativeFuture) {
                oThis.checkRuleEffects(alternativeFuture);
                oThis.addAnchorTime(alternativeFuture);
                oThis.mainController.alternativeFutureSimulationReady(alternativeFuture);
            });
        }
    }

    private deduceFileName(newActionExecutionID: string, newEnabled: boolean): string {
        let expectedFile = "future_";
        let start = true;

        for(let ruleExecution of this.future.executions) {
            for(let actionExecution of ruleExecution["action_executions"]) {
                let actionExecutionID = actionExecution["action_execution_id"];
                let snoozed = actionExecution["snoozed"];

                if(actionExecutionID == newActionExecutionID) {
                    snoozed = !newEnabled;
                }

                if(!start) {
                    expectedFile += ";"
                }

                expectedFile += actionExecutionID.replace("action_execution_id_", "") + (snoozed ? "t" : "f");
                start = false;
            }

        }

        return expectedFile + ".json";
    }

    public findState(deviceID: string, date: Date) {
        for(let haystackState of this.future.states) {
            if(haystackState.entity_id == deviceID && new Date(haystackState.last_updated).getTime() == date.getTime()) {
                return haystackState;
            }
        }

        return null;
    }

    /**
     * Find an action execution with similar characteristics
     * @param triggerEntity
     * @param actionID
     * @param date
     */
    findActionExecution(triggerEntity: string, actionID: string, date: Date) {
        for(let ruleExecution of this.future.executions) {
            if(ruleExecution.trigger_entity == triggerEntity && new Date(ruleExecution.datetime).getTime() == date.getTime()) {
                for(let actionExecution of ruleExecution["action_executions"]) {
                    if (actionExecution["action_id"] == actionID) {
                        return actionExecution;
                    }
                }
            }
        }

        return null;
    }

    getStateByContextID(stateContextID: string) {
        for(let haystackState of this.future.states) {
            if(haystackState.context.id == stateContextID) {
                return haystackState;
            }
        }

        return null;
    }

    /**
     * Get the execution that resulted in this state
     * @param actionContextID
     */
    public getRuleExecutionByActionContextID(actionContextID: string, executions: any []) {
        if(executions == null) {
            executions = this.future.executions;
        }

        for(let execution of executions) {
            for(let actionExecution of execution["action_executions"]) {
                for(let actionContext of actionExecution["resulting_contexts"]) {
                    if(actionContext["id"] === actionContextID) {
                        return execution;
                    }
                }
            }
        }

        return null;
    }

    /**
     * Get the ruleExecution that contains this actionExecution
     * @param actionExecutionID
     */
    public getRuleExecutionByActionExecutionID(actionExecutionID: string) {
        for(let execution of this.future.executions) {
            for(let actionExecution of execution["action_executions"]) {
                if(actionExecution["action_execution_id"] == actionExecutionID) {
                    return execution;
                }
            }
        }

        return null;
    }

    /**
     * Get the executions that were triggered by this state
     * @param triggerContextID
     */
    public getExecutionsByCondition(conditionContextID: string) {
        let result: string[] = [];

        for(let execution of this.future.executions) {
            for(let triggerContext of execution["condition_satisfying_contexts"]) {
                if(triggerContext["id"] === conditionContextID) {
                    result.push(execution["execution_id"]);
                }
            }
        }

        return result;
    }

    /**
     * Get the execution by providing its ID
     * @param execution
     */
    public getExecutionByID(executionID: string) {
        for(let execution of this.future.executions) {
            if(execution["execution_id"] === executionID) return execution;
        }

        return null;
    }

    /**
     * Get the states that triggered this execution
     * @param execution
     */
    public getTriggerContextIDsByExecution(execution: any) : string []  {
        let result: string[] = [];

        result.push(execution["trigger_context"]["id"]);

        return result;
    }

    /**
     * Get the states that were caused by this execution
     * @param execution
     */
    public getActionContextIDsByExecution(execution: any) : string [] {
        let result: string[] = [];

        for(let actionExecution of execution["action_executions"]) {
            for(let actionContext of actionExecution["resulting_contexts"]) {
                result.push(actionContext["id"]);
            }
        }

        return result;
    }

    getActionExecutionByActionExecutionID(ruleExecution: any, actionExecutionID: string) {
        for(let actionExecution of ruleExecution["action_executions"]) {
            if(actionExecution["action_execution_id"] == actionExecutionID) {
                return actionExecution;
            }
        }

        return null;
    }

    /**
     * Which future executions to look for (null -> default, actual value for alternative future)
     * @param conflictedStateContextID
     * @param futureExecutions
     */
    getActionExecutionByResultingContextID(conflictedStateContextID: any, futureExecutions: any) {
        if(futureExecutions == null) {
            futureExecutions = this.future.executions;
        }

        for(let ruleExecution of futureExecutions) {
            for(let actionExecution of ruleExecution["action_executions"]) {
                for (let resultingContext of actionExecution["resulting_contexts"]) {
                    if (resultingContext["id"] == conflictedStateContextID) {
                        return actionExecution;
                    }
                }
            }
        }

        return null;
    }

    getRelatedConflict(stateContextID: string)  {
        for(let conflictIndex in this.future.conflicts) {
            let conflict = this.future.conflicts[conflictIndex];

            for(let conflictingActionIndex in conflict["conflicting_states"]) {
                let conflictingActionState = conflict["conflicting_states"][conflictingActionIndex];

                if(conflictingActionState["context"]["id"] == stateContextID) {
                    return conflict;
                }
            }
        }

        return null;
    }

    getFuture() {
        return this.future;
    }

    private addAnchorTime(future) {
        for(let entity in future.states) {
            for(let entityState of future.states[entity]) {
                entityState["last_changed"] = new Date(new Date(entityState["last_changed"]).getTime() + this.mainController.getAnchorDate().getTime());
                entityState["last_updated"] = new Date(new Date(entityState["last_updated"]).getTime() + this.mainController.getAnchorDate().getTime());
            }
        }

        for(let ruleExecution of future.executions) {
            ruleExecution["datetime"] = new Date(new Date(ruleExecution["datetime"]).getTime() + this.mainController.getAnchorDate().getTime());

            for(let actionExecution of ruleExecution["action_executions"]) {
                actionExecution["datetime"] = new Date(new Date(actionExecution["datetime"]).getTime() + this.mainController.getAnchorDate().getTime());
            }
        }

        // TODO: conflicts
    }
}