class ConflictClient {
    mainController: IoTController;
    futureConflicts: any [];

    constructor(mainController: IoTController) {
        this.mainController = mainController;
        this.futureConflicts = [];
    }

    public refresh() {
        this.loadFutureConflicts();
    }

    private loadFutureConflicts() {
        let oThis = this;

        $.ajax({
            url: this.mainController.API_URL + (this.mainController.isRemote() ? "states_future.json" : "conflicts/future/"),
            type: "GET",
        }).done(function (data) {
            oThis.futureConflicts = data;
          //  oThis.mainController.conflictClientCompleted();
        });
    }

    getConflicts() {
        return this.futureConflicts;
    }


}