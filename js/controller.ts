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

    private rulesLoaded: boolean;
    private statesLoaded: boolean;
    private devicesLoaded: boolean;
    private configLoaded: boolean;

    public devices: any = {};

    constructor() {
        let oThis = this;

        this.rulesLoaded = true;
        this.statesLoaded = true;
        this.devicesLoaded = true;

        this.initClients();
        this.timeline = new Timeline(this, this.ruleClient, this.stateClient, this.deviceClient, this.configClient);

        $("#reload").click(function() {
            oThis.refresh();
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
        //    document.getElementById("hassio_events").innerHTML = event.data;
            oThis.refresh();
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

    initClients() {
       // this.eventsClient = new EventsClient(this);
        this.stateClient = new StateClient(this);
        this.ruleClient = new RuleClient(this);
        this.deviceClient = new DeviceClient(this);
        this.configClient = new ConfigClient(this);

        $(".timeline_device_attributes").toggle();
    }

    refresh() {
        if (this.statesLoaded && this.rulesLoaded) {
           //  Loading has completed before

            $("#reload").addClass("disabled");
            $(".history").empty();
            $(".future").empty();

            this.rulesLoaded = false;
            this.statesLoaded = false;
            this.devicesLoaded = false;
            this.configLoaded = false;

            this.ruleClient.refresh();
            this.stateClient.refresh();
            this.deviceClient.refresh();
            this.configClient.refresh();
        }
    }

    ruleClientCompleted() {
        this.rulesLoaded = true;
        this.checkLoadingCompleted();
    }

    stateClientCompleted() {
        this.statesLoaded = true;
        this.checkLoadingCompleted();
    }

    configClientCompleted() {
        this.configLoaded = true;
        this.checkLoadingCompleted();
    }

    checkLoadingCompleted() {
        if(this.rulesLoaded && this.statesLoaded && this.configLoaded) {
            $(".devices_column").removeClass("hidden");
            $("#connection_error").remove();
            $("#reload").removeClass("disabled");
            $(".timeline_wrapper").removeClass("hidden");

            if(this.timeline != null) {
                this.timeline.redraw(this.stateClient.getAllStates(), this.ruleClient.getAllExecutions(), false);
            }
        } else if(!this.rulesLoaded) {
            //console.log("waiting for rules");
        } else if(!this.statesLoaded) {
            //console.log("waiting for states");
        }
    }

    showFeedforward(alternativeFutureStates, alternativeFutureExecutions) {
        let originalStates = this.stateClient.getAllStates();
        let originalExecutions = this.ruleClient.getAllExecutions();

        let alternativeStates = [];
        alternativeStates = alternativeStates.concat(this.stateClient.getStatesHistory());
        alternativeStates = alternativeStates.concat(alternativeFutureStates);

        let alternativeExecutions = [];
        alternativeExecutions = alternativeExecutions.concat(this.ruleClient.getExecutionsHistory());
        alternativeExecutions = alternativeExecutions.concat(alternativeFutureExecutions);

        this.timeline.showFeedforward(originalStates, alternativeStates, originalExecutions, alternativeExecutions);
    }

    updateDevices(data) {
        this.timeline.updateDevices(data);
    }

    updateRules(data) {
        this.timeline.updateRules(data);
    }
}