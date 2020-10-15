class StateClient {
    private mainController: IoTController;
    private stateHistory: [];

    constructor(mainController: IoTController) {
        this.mainController = mainController;
        this.stateHistory = [];
    }

    public loadStateHistory() {
        let oThis = this;
        $("#reload").addClass("disabled");

        $.ajax({
            url:            this.mainController.API_URL + (this.mainController.isRemote() ? "states_history.json" : "states/history/"),
            type:           "GET",
        }).done(function (data) {
            oThis.stateHistory = data;
            oThis.mainController.pastStatesLoaded();
        });
    }

    drawStateChangeHistory(changes) {
        for(let i = changes.length - 1; i >= 0; i--) {
            this.mainController.devices[changes[i]["entity_id"]].addStateHistoryItem(changes[i]);
        }
    }

    drawStateChangeFuture(changes) {
        for(let i = changes.length - 1; i >= 0; i--) {
            this.mainController.devices[changes[i]["entity_id"]].addStateFutureItem(changes[i]);
        }
    }

    getStatesHistory() {
        return this.stateHistory;
    }

  /*  public simulateFuture(deviceID: string, futureEnabled: boolean) {
        let oThis = this;

        let ruleSettings = {};
        ruleSettings[deviceID] = futureEnabled;

        $.ajax({
            url:            "http://localhost:8080/intelligibleIoT/api/states/future/simulate",
            type:           "POST",
            data: JSON.stringify({ states: [], rules: ruleSettings }),
            contentType: "application/json; charset=utf-8",
            dataType: "json",
        }).done(function (data) {
            oThis.mainController.showFeedforward(data["states"], data["executions"]);
        });
    } */

    combineStateHistoryAndFuture(stateFuture): {} {
        let combinedStates: any = {};

        for(let deviceID in this.stateHistory) {
            combinedStates[deviceID] = [];
            combinedStates[deviceID] = combinedStates[deviceID].concat(this.stateHistory[deviceID]);
            combinedStates[deviceID] = combinedStates[deviceID].concat(stateFuture[deviceID]);
        }

        return combinedStates;
    }
}