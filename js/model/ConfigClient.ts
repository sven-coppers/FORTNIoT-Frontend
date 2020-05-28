class ConfigClient {
    mainController: IoTController;

  //  public connectedToHassio: boolean;
    public predictionEngineEnabled: boolean;
    public predictionInterval: number;
    public predictionWindow: number;

    constructor(mainController: IoTController) {
        this.mainController = mainController;
      //  this.connectedToHassio = false;
        this.predictionEngineEnabled = false;
    }

 //   public isConnectedToHassio(): boolean {
 //       return this.connectedToHassio;
 //   }

    public isPredictionEngineEnabled(): boolean {
        return this.predictionEngineEnabled;
    }

    public refresh() {
      //  this.refreshConfig();
        this.refreshPredictionEngine();
    }

  /*  private refreshConfig() {
        let oThis = this;

        $.ajax({
            url: "http://localhost:8080/intelligibleIoT/api/config",
            type: "GET",
            headers: {
                Accept: "application/json; charset=utf-8" // FORCE THE JSON VERSION
            }
        }).done(function (data) {
        //    oThis.connectedToHassio = data["connected_to_hassio"];
        });
    } */

    public refreshPredictionEngine() {
        let oThis = this;

        $.ajax({
            url: this.mainController.API_URL + (this.mainController.isRemote() ? "settings.json" : "config/predictions"),
            type: "GET",
            headers: {
                Accept: "application/json; charset=utf-8" // FORCE THE JSON VERSION
            }
        }).done(function (data) {
            oThis.predictionEngineEnabled = data["predictions"];
            oThis.predictionWindow = data["tick_window_minutes"];
            oThis.predictionInterval = data["tick_interval_minutes"];
            oThis.mainController.configClientCompleted();

            if(oThis.predictionEngineEnabled) {
                $("#version").text("Version A - " + data["use_case"]);
            } else {
                $("#version").text("Version B - " + data["use_case"]); // Baseline
            }

            if(data["question"] != null) {
                $("#question").text(" - " + data["question"]);
            }
        });
    }
}