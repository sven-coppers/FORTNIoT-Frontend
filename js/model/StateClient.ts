class StateClient {
    mainController: IoTController;
    stateFuture: [];
    stateHistory: [];
    private historyLoaded: boolean;
    private futureLoaded: boolean;

    constructor(mainController: IoTController) {
        this.mainController = mainController;
        this.stateFuture = [];
        this.stateHistory = [];

        this.historyLoaded = false;
        this.futureLoaded = false;
    }

    public refresh() {
        this.historyLoaded = false;
        this.futureLoaded = false;

        this.loadStateHistory();
        this.loadStateFuture();
    }

    setIoTState(hassioStates) {
        let oThis = this;

        $.each(oThis.mainController.devices, function(identifier: string, device: Device) {
            if(hassioStates[identifier] != null) {
                device.setState(hassioStates[identifier], null);
            }
        });
    }

    private loadStateHistory() {
        let oThis = this;
        $("#reload").addClass("disabled");

        $.ajax({
            url:            "http://localhost:8080/intelligibleIoT/api/states/history",
            type:           "GET",
        }).done(function (data) {
            oThis.stateHistory = data;
            oThis.historyLoaded = true;
            oThis.checkLoadingCompleted();
        });
    }

    drawStateChangeHistory(changes) {
        for(let i = changes.length - 1; i >= 0; i--) {
            this.mainController.devices[changes[i]["entity_id"]].addStateHistoryItem(changes[i]);
        }
    }

    private loadStateFuture() {
        let oThis = this;
        $("#reload").addClass("disabled");

        $.ajax({
            url:            "http://localhost:8080/intelligibleIoT/api/states/future",
            type:           "GET",
        }).done(function (data) {
            oThis.stateFuture = data;
            oThis.futureLoaded = true;
            oThis.checkLoadingCompleted();
        });
    }

    drawStateChangeFuture(changes) {
        for(let i = changes.length - 1; i >= 0; i--) {
            this.mainController.devices[changes[i]["entity_id"]].addStateFutureItem(changes[i]);
        }
    }

    private checkLoadingCompleted() {
        if(this.historyLoaded && this.futureLoaded) {
            this.mainController.stateClientCompleted();
        } else if(!this.historyLoaded) {
            //console.log("waiting for history states");
        } else if(!this.futureLoaded) {
            //console.log("waiting for future states");
        }
    }

    getAllStates() {
        let timeData = [];

        timeData = timeData.concat(this.stateHistory);
        timeData = timeData.concat(this.stateFuture);

        return timeData;
    }

    getStatesHistory() {
        return this.stateHistory;
    }

    public simulateFuture(deviceID: string, futureEnabled: boolean) {
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
    }
}