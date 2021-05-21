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
            oThis.addAnchorTime(data);
            oThis.mainController.pastStatesLoaded();
        });
    }

    private addAnchorTime(data) {
        for(let entity in data) {
            for(let entityState of data[entity]) {
                entityState["last_changed"] = new Date(new Date(entityState["last_changed"]).getTime() + this.mainController.getAnchorDate().getTime());
                entityState["last_updated"] = new Date(new Date(entityState["last_updated"]).getTime() + this.mainController.getAnchorDate().getTime());
            }
        }
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

    combineStateHistoryAndFuture(stateFuture): {} {
        let combinedStates: any = {};

        for(let deviceID in this.stateHistory) {
            combinedStates[deviceID] = [];
            combinedStates[deviceID] = combinedStates[deviceID].concat(this.stateHistory[deviceID]);

            if(typeof stateFuture[deviceID] !== "undefined") {
                combinedStates[deviceID] = combinedStates[deviceID].concat(stateFuture[deviceID]);
            }
        }

        return combinedStates;
    }
}