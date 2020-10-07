declare var vis;


$(document).ready(function() {
    new IoTController();
});

class IoTController {
    timeline: Timeline;
    eventsClient: EventsClient;
    stateClient: StateClient;
    ruleClient: RuleClient;
    deviceClient: DeviceClient;
    configClient: ConfigClient;
    conflictClient: ConflictClient;
    futureClient: FutureClient;
    public API_URL: string;

    private remote: boolean;

    public devices: any = {};

    constructor() {
        let oThis = this;
        this.remote = window.location.href.indexOf("research.edm.uhasselt.be") != -1;

        if(this.remote) {
            this.API_URL = "https://research.edm.uhasselt.be/~scoppers/iot/cache/";
        } else {
            this.API_URL = "http://localhost:8080/intelligibleIoT/api/";
        }

        let url = new URL(window.location.href);
        let useCase = url.searchParams.get("c");

        if(useCase != null) {
        }

        this.initClients();
        this.timeline = new Timeline(this, this.ruleClient, this.stateClient, this.deviceClient, this.configClient,this.conflictClient,this.futureClient);

        $("#reload").click(function() {
            oThis.refreshContext();
            return false;
        });

        $(".copy").click(function () {
            let identifier = $(this).closest(".device").find(".code").attr("id");
            //$(this).closest(".device").find(".code").text().sel;
            let textBox = (<HTMLInputElement>document.getElementById(identifier));
            /* Select the text field */
            textBox.select();

            /* Copy the text inside the text field */
            document.execCommand("copy");
        });

        let source = new EventSource("http://localhost:8080/intelligibleIoT/api/states/stream");
        source.onmessage = function(event) {
            if(event.data == "Scenario Changed") {
                oThis.timeline.refreshSetup();
            } else {
                oThis.refreshContext();
            }
        };

        $("#rules_checkbox").click(function() {
            oThis.timeline.setAllRulesVisible($(this).is(":checked"));
          //  $(".timeline_device.rule").slideToggle();
        });

        $("#devices_checkbox").click(function() {
            oThis.timeline.setAllDevicesVisible($(this).is(":checked"));
        });

        $("#back_button").click(function() {
            oThis.timeline.clearSelection(false);
            $(this).addClass("hidden");
        });

        $("#events_without_changes").click(function() {
            $(".event_item.without_changes").toggleClass("hidden", !$(this).is(":checked"));
        });
    }

    isRemote(): boolean {
        return this.remote;
    }

    initClients() {
       // this.eventsClient = new EventsClient(this);
        this.stateClient = new StateClient(this);
        this.ruleClient = new RuleClient(this);
        this.deviceClient = new DeviceClient(this);
        this.configClient = new ConfigClient(this);
        this.conflictClient = new ConflictClient(this);
        this.futureClient = new FutureClient(this);

        $(".timeline_device_attributes").toggle();
    }




    // Small refresh: states, rule executions, conflicts
    refreshContext() {
        $("#reload").addClass("disabled");
        $(".history").empty();
        $(".future").empty();
        this.stateClient.loadStateHistory();

          //  this.stateClient.refresh();
         //   this.configClient.refresh();
         //   this.conflictClient.refresh();
          //  this.futureClient.refresh();
    }

    pastStatesLoaded() {
        this.futureClient.refresh();
    }

    futureLoaded(future: any) {
        let allStates = [];

        allStates = allStates.concat(this.stateClient.stateHistory);
        allStates = allStates.concat(future.futureStates);

        $(".devices_column").removeClass("hidden");
        $("#connection_error").remove();
        $("#reload").removeClass("disabled");
        $(".timeline_wrapper").removeClass("hidden");

        if(this.timeline != null) {
            this.timeline.redraw(allStates, future.executions, future.conflicts, false);
        }
    }

    showFeedforward(alternativeFutureStates, alternativeFutureExecutions) {
      //  let originalStates = this.stateClient.getAllStates(); // TODO
        let originalExecutions = this.futureClient.getFuture().executions();
        let originalConflicts = this.conflictClient.getConflicts();

        let alternativeStates = [];
        alternativeStates = alternativeStates.concat(this.stateClient.getStatesHistory());
        alternativeStates = alternativeStates.concat(alternativeFutureStates);

        let alternativeExecutions = [];
        alternativeExecutions = alternativeExecutions.concat(this.ruleClient.getExecutionsHistory());
        alternativeExecutions = alternativeExecutions.concat(alternativeFutureExecutions);

        let alternativeConflicts = [];
        // TODO find alternative conflicts

     //   this.timeline.showFeedforward(originalStates, alternativeStates, originalExecutions, alternativeExecutions, originalConflicts, alternativeConflicts);
    }

    updateDevices(data) {
        this.timeline.updateDevices(data);
    }

    updateRules(data) {
        this.timeline.updateRules(data);
    }
}