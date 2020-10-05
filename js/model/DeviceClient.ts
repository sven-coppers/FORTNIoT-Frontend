class DeviceClient {
    mainController: IoTController;

    constructor(mainController: IoTController) {
        this.mainController = mainController;
    }

    public refresh() {
        this.refreshDevices();
    }

    private refreshDevices() {
        let oThis = this;

        $.ajax({
            url: this.mainController.API_URL + (this.mainController.isRemote() ? "devices.json" : "devices"),
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
            url: this.mainController.API_URL + (this.mainController.isRemote() ? "devices.json" : "devices"),
            type: "GET",
            headers: {
                Accept: "application/json; charset=utf-8" // FORCE THE JSON VERSION
            }
        }).done(function (data) {
            timeline.initializeDevices(data);
        });
    }
}