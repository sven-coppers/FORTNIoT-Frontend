<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Fortune IoT</title>

        <!-- General Styling -->
        <link href="//unpkg.com/vis-timeline@latest/styles/vis-timeline-graph2d.min.css" rel="stylesheet" type="text/css" />
        <link type="text/css" rel="stylesheet" href="style/reset.css">
        <link type="text/css" rel="stylesheet" href="style/frame.css">
        <link type="text/css" rel="stylesheet" href="style/general.css">
        <link type="text/css" rel="stylesheet" href="style/visualisation.css">
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    </head>
    <body>
    <div id="iot">
        <h1>Internet-of-Things -
            <span id="version">Version B</span>
            <span id="question"></span>
            <!-- <a href="" id="reload">&#x21bb;</a>-->
        </h1>
        <p id="connection_error">Connecting to the IoT Server.</p>
        <div class="devices_column hidden">
            <img src="img/back.png" id="back_button" class="hidden" />
            <div class="filters">
                Show:
                <label><input type="checkbox" name="show" value="rules" id="rules_checkbox" checked> Rules</label>
                <label><input type="checkbox" name="show" value="states" id="devices_checkbox" checked> Devices</label>
                <label><input type="checkbox" name="show" value="events_without_changes" id="events_without_changes" checked> Executions without changes</label>
                <!-- <label><input type="checkbox" name="show" value="adaptive" id="adaptive_checkbox" checked> Only Relevant</label>-->
            </div>
            <div class="clearfix"></div>
        </div>
        <div class="clearfix"></div>
        <div class="timeline_wrapper hidden">
        </div>
        <div class="clearfix"></div>
        <!--    <div class="devices_column hidden">
                <div class="device"><h2>Sven SSE <span class="copy">Copy</span></h2><textarea class="code" rows="50" id="hassio_events"></textarea></div>
            </div> -->
        <div class="clearfix"></div>
    </div>
  <!--  <div class="rule_tooltip">
        <label><input type="checkbox" name="rule_enabled" value="rule_enabled" id="rule_enabled" checked> Rule name</label>
    </div> -->
    </body>
    <!-- Libraries -->
    <script type="text/javascript" src="https://unpkg.com/vis-timeline@latest/standalone/umd/vis-timeline-graph2d.min.js"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>

    <!-- Helpers -->
    <script src="js/helpers/array.js"></script>
    <script src="js/helpers/string.js"></script>
    <script src="js/helpers/logger.js"></script>
    <script src="js/helpers/time.js"></script>

    <!-- Use Case Scripting -->
    <script src="js/timeline/DeviceTimeline.js"></script>

    <script src="js/model/EventsClient.js"></script>
    <script src="js/model/RuleClient.js"></script>
    <script src="js/model/StateClient.js"></script>
    <script src="js/model/DeviceClient.js"></script>
    <script src="js/model/ConfigClient.js"></script>
    <script src="js/model/ConflictClient.js"></script>

    <script src="js/timeline/components/TimelineComponent.js"></script>
    <script src="js/timeline/components/StateComponent.js"></script>
    <script src="js/timeline/components/EventComponent.js"></script>
    <script src="js/timeline/components/GraphComponent.js"></script>

    <script src="js/timeline/components/subcomponents/AxisComponent.js"></script>
    <script src="js/timeline/components/subcomponents/ColorComponent.js"></script>
    <script src="js/timeline/components/subcomponents/ContinuousGraphComponent.js"></script>
    <script src="js/timeline/components/subcomponents/DiscreteGraphComponent.js"></script>
    <script src="js/timeline/components/subcomponents/MotionComponent.js"></script>

    <script src="js/timeline/components/devicecomponents/BusPassageComponent.js"></script>
    <script src="js/timeline/components/devicecomponents/CalendarComponent.js"></script>
    <script src="js/timeline/components/devicecomponents/WeatherStateComponent.js"></script>
    <script src="js/timeline/components/devicecomponents/SunStateComponent.js"></script>
    <script src="js/timeline/components/devicecomponents/TemperatureComponent.js"></script>
    <script src="js/timeline/components/devicecomponents/ContactComponent.js"></script>
    <script src="js/timeline/components/devicecomponents/BatteryComponent.js"></script>
    <script src="js/timeline/components/devicecomponents/DeviceTrackerComponent.js"></script>
    <script src="js/timeline/components/devicecomponents/CoordinateComponent.js"></script>
    <script src="js/timeline/components/devicecomponents/ThermostatComponent.js"></script>
    <script src="js/timeline/components/devicecomponents/WindComponent.js"></script>
    <script src="js/timeline/components/devicecomponents/ActionComponent.js"></script>
    <script src="js/timeline/components/devicecomponents/TriggerComponent.js"></script>
    <script src="js/timeline/components/devicecomponents/RulesComponent.js"></script>

    <script src="js/timeline/devices/AxisTimeline.js"></script>
    <script src="js/timeline/devices/BusStopTimeline.js"></script>
    <script src="js/timeline/devices/CalendarTimeline.js"></script>
    <script src="js/timeline/devices/HueTimeline.js"></script>
    <script src="js/timeline/devices/BusStopTimeline.js"></script>
    <script src="js/timeline/devices/IoTButtonTimeline.js"></script>
    <script src="js/timeline/devices/RuleTimeline.js"></script>
    <script src="js/timeline/devices/ImplicitRuleTimeline.js"></script>
    <script src="js/timeline/devices/SunTimeline.js"></script>
    <script src="js/timeline/devices/WeatherTimeline.js"></script>
    <script src="js/timeline/devices/MotionTimeline.js"></script>
    <script src="js/timeline/devices/OutletTimeline.js"></script>
    <script src="js/timeline/devices/ContactTimeline.js"></script>
    <script src="js/timeline/devices/BatteryTimeline.js"></script>
    <script src="js/timeline/devices/TemperatureTimeline.js"></script>
    <script src="js/timeline/devices/DeviceTrackerTimeline.js"></script>
    <script src="js/timeline/devices/AccelerationTimeline.js"></script>
    <script src="js/timeline/devices/CoordinateTimeline.js"></script>
    <script src="js/timeline/devices/HeaterTimeline.js"></script>
    <script src="js/timeline/devices/AircoTimeline.js"></script>
    <script src="js/timeline/devices/MoonTimeline.js"></script>
    <script src="js/timeline/devices/PersonTimeline.js"></script>
    <script src="js/timeline/devices/PersonCounterTimeline.js"></script>
    <script src="js/timeline/devices/GenericDeviceTimeline.js"></script>
    <script src="js/timeline/devices/ThermostatTimeline.js"></script>
    <script src="js/timeline/devices/WindTimeline.js"></script>
    <script src="js/timeline/devices/RulesTimeline.js"></script>

    <script src="js/timeline/Timeline.js"></script>
    <script src="js/controller.js"></script>
</html>