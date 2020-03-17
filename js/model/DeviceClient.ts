class DeviceClient {
    mainController: IoTController;

    historyLoaded: boolean;
    futureLoaded: boolean;

    constructor(mainController: IoTController) {
        this.mainController = mainController;
    }

    public refresh() {
        this.refreshDevices();
    }

    private refreshDevices() {
        let oThis = this;

        $.ajax({
            url: "http://localhost:8080/intelligibleIoT/api/bram/devices",
            type: "GET",
            headers: {
                Accept: "application/json; charset=utf-8" // FORCE THE JSON VERSION
            }
        }).done(function (data) {
            oThis.mainController.updateDevices(data);
        });
    }

    public loadDevices(timeline: Timeline) {
        $.ajax({
            url: "http://localhost:8080/intelligibleIoT/api/bram/devices",
            type: "GET",
            headers: {
                Accept: "application/json; charset=utf-8" // FORCE THE JSON VERSION
            }
        }).done(function (data) {
            timeline.initializeDevices(data);
        });
    }
}