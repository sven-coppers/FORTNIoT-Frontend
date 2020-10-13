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

        $.ajax({
            url:            this.mainController.API_URL +  "future",
            type:           "GET",
        }).done(function (future) {
            oThis.future = future;
            oThis.mainController.futureLoaded(future);
        });
    }

    public simulateAlternativeFuture(extraStates: any [], suppressedStateContexts: any [], snoozedActions: any [], reEnabledActions: any []) {
        let oThis = this;

        let simulationRequest = {
            extra_states: extraStates,
            suppressed_state_contexts: suppressedStateContexts,
            snoozed_actions: snoozedActions,
            re_enabled_actions: reEnabledActions
        };

        $.ajax({
            url:            "http://localhost:8080/intelligibleIoT/api/future/simulate",
            type:           "POST",
            data: JSON.stringify(simulationRequest),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        }).done(function (alternativeFuture) {
            oThis.mainController.alternativeFutureSimulationReady(alternativeFuture);
        });
    }

    public findState(deviceID: string, date: Date) {
        for(let haystackState of this.future.futureStates) {
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
        for(let haystackState of this.future.futureStates) {
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
    public getRuleExecutionByActionContextID(actionContextID: string) {
        for(let execution of this.future.executions) {
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

    getActionExecutionByResultingContextID(conflictedStateContextID: any) {
        for(let ruleExecution of this.future.executions) {
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

    /**
     *
     * @param stateClient
     * @param future the (alternative) future to get the predicted states from
     */
    getAllStates(stateClient: StateClient, future: any) {
        let allStates = [];

        allStates = allStates.concat(stateClient.stateHistory);
        allStates = allStates.concat(future.futureStates);

        return allStates;
    }

}