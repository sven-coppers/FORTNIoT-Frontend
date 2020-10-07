class RuleClient {
    mainController: IoTController;
    executionHistory: any [];

    constructor(mainController: IoTController) {
        this.mainController = mainController;
        this.executionHistory = [];
    }

    public refresh() {
        this.loadExecutionHistory();
       // this.loadExecutionFuture();
    }

    private loadExecutionHistory() {
        let oThis = this;
        $("#reload").addClass("disabled");

        $.ajax({
            url:            this.mainController.API_URL + (this.mainController.isRemote() ? "rules_history.json" : "rules/history/"),
            type:           "GET",
        }).done(function (data) {
            oThis.executionHistory = data;
        });
    }

   /* private loadExecutionFuture() {
        let oThis = this;
        $("#reload").addClass("disabled");

        $.ajax({
            url:            this.mainController.API_URL + (this.mainController.isRemote() ? "rules_future.json" : "rules/future/"),
            type:           "GET",
        }).done(function (data) {
            oThis.executionFuture = data;
            oThis.futureLoaded = true;
        });
    } */



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
            oThis.mainController.refreshContext();
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
            oThis.mainController.refreshContext();
        });
    }

    public commitRemoveSnoozedAction(snoozedActionID) {
        let oThis = this;
        $.ajax({
            url:            "http://localhost:8080/intelligibleIoT/api/overrides/snoozed_actions/" + snoozedActionID,
            type:           "DELETE"
        }).done(function (data) {
            oThis.mainController.refreshContext();
        });
    }

    getExecutionsHistory() {
        return this.executionHistory;
    }
}