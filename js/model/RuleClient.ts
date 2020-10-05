class RuleClient {
    mainController: IoTController;
    executionFuture: any [];
    executionHistory: any [];
    executionMerged: any [];

    historyLoaded: boolean;
    futureLoaded: boolean;

    constructor(mainController: IoTController) {
        this.mainController = mainController;
        this.executionFuture = [];
        this.executionHistory = [];
        this.executionMerged = [];

        this.historyLoaded = false;
        this.futureLoaded = false;
    }

    public refresh() {
        this.historyLoaded = false;
        this.futureLoaded = false;

        this.loadExecutionHistory();
        this.loadExecutionFuture();
        this.refreshRules();
    }

    private loadExecutionHistory() {
        let oThis = this;
        $("#reload").addClass("disabled");

        $.ajax({
            url:            this.mainController.API_URL + (this.mainController.isRemote() ? "rules_history.json" : "rules/history/"),
            type:           "GET",
        }).done(function (data) {
            oThis.executionHistory = data;
            oThis.historyLoaded = true;
            oThis.checkLoadingCompleted();
        });
    }

    private loadExecutionFuture() {
        let oThis = this;
        $("#reload").addClass("disabled");

        $.ajax({
            url:            this.mainController.API_URL + (this.mainController.isRemote() ? "rules_future.json" : "rules/future/"),
            type:           "GET",
        }).done(function (data) {
            oThis.executionFuture = data;
            oThis.futureLoaded = true;
            oThis.checkLoadingCompleted();
        });
    }

    private refreshRules() {
        let oThis = this;

        $.ajax({
            url:            this.mainController.API_URL + (this.mainController.isRemote() ? "rules.json" : "rules/"),
            type:           "GET",
            headers: {
                Accept: "application/json; charset=utf-8" // FORCE THE JSON VERSION
            }
        }).done(function (data) {
          /*  for (let ruleID in data) {
                let rule = data[ruleID];
                let htmlID = ruleID.replace('.', '_') + "_enabled";
                $("#" + htmlID).prop('checked', rule["enabled"]);

                $("#" + htmlID).closest(".rule").toggle(rule["available"]);


            }*/
            oThis.mainController.updateRules(data);
        });
    }

    public loadRules(timeline: Timeline) {
        $.ajax({
            url:            this.mainController.API_URL + (this.mainController.isRemote() ? "rules.json" : "rules/"),
            type:           "GET",
            headers: {
                Accept: "application/json; charset=utf-8" // FORCE THE JSON VERSION
            }
        }).done(function (data) {
            timeline.initializeRules(data);
        });
    }

    public setRuleEnabled(ruleID: string, enabled: boolean) {
        let oThis = this;

        $.ajax({
            url:            "http://localhost:8080/intelligibleIoT/api/rules/" + ruleID + "/",
            type:           "PUT",
            data: JSON.stringify({ enabled: enabled }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        }).done(function (data) {
            oThis.mainController.refresh();
        });
    }

    public commitNewSnoozedAction(snoozedAction) {
        let oThis = this;
        $.ajax({
            url:            "http://localhost:8080/intelligibleIoT/api/overrides/snoozed_actions",
            type:           "POST",
            data: JSON.stringify(snoozedAction),
            contentType: "application/json; charset=utf-8",
            dataType: "json"
        }).done(function (data) {
            oThis.mainController.refresh();
        });
    }

    public commitRemoveSnoozedAction(snoozedActionID) {
        let oThis = this;
        $.ajax({
            url:            "http://localhost:8080/intelligibleIoT/api/overrides/snoozed_actions/" + snoozedActionID,
            type:           "DELETE"
        }).done(function (data) {
            oThis.mainController.refresh();
        });
    }

    /**
     * Get the execution that resulted in this state
     * @param actionContextID
     */
    public getRuleExecutionByActionContextID(actionContextID: string) {
        let result: string[] = [];

        for(let execution of this.executionMerged) {
            for(let actionExecution of execution["action_executions"]) {
                for(let actionContext of actionExecution["resulting_contexts"]) {
                    if(actionContext["id"] === actionContextID) {
                        result.push(execution["execution_id"]);
                    }
                }
            }
        }

        return result;
    }

    /**
     * Get the ruleExecution that contains this actionExecution
     * @param actionExecutionID
     */
    public getRuleExecutionByActionExecutionID(actionExecutionID: string) {
        for(let execution of this.executionMerged) {
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

        for(let execution of this.executionMerged) {
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
        for(let execution of this.executionMerged) {
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



    private checkLoadingCompleted() {
        if(this.historyLoaded && this.futureLoaded) {
            this.executionMerged = [];
            this.executionMerged = this.executionMerged.concat(this.executionHistory);
            this.executionMerged = this.executionMerged.concat(this.executionFuture);

            this.mainController.ruleClientCompleted();
        } else if(!this.historyLoaded) {
            //console.log("waiting for history rules");
        } else if(!this.futureLoaded) {
            //console.log("waiting for future rules");
        }
    }

    getAllExecutions() {
        return this.executionMerged;
    }

    getExecutionsHistory() {
        return this.executionHistory;
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
        for(let ruleExecution of this.executionMerged) {
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
}