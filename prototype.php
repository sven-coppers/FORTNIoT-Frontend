<?php
$scenarios = array("training", "television", "temperature", "weather", "security", "conflicts");
$predictionsOn = (!empty($_GET) && isset($_GET["predictions"]));
$selectedScenario = (!empty($_GET) && isset($_GET["scenario"]) && in_array($_GET["scenario"], $scenarios)) ? $_GET["scenario"] : $scenarios[0];
$forceRemote = (!empty($_GET) && isset($_GET["remote"]));
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>FORTNIoT</title>

        <!-- General Styling -->
        <link href="//unpkg.com/vis-timeline@7.4.0/styles/vis-timeline-graph2d.min.css" rel="stylesheet" type="text/css" />
        <link type="text/css" rel="stylesheet" href="style/reset.css">
       <link type="text/css" rel="stylesheet" href="style/frame.css">
        <link type="text/css" rel="stylesheet" href="style/general.css">
        <link type="text/css" rel="stylesheet" href="style/visualisation.css">
        <link type="text/css" rel="stylesheet" href="style/rules.css">
        <link rel="shortcut icon" href="favicon.ico" type="image/x-icon" />
    </head>
    <body>
    <div class="header">
        <div class="header_content">
            <h1>FORTNIoT - FortClash</h1>
            <p>To make additional predictions about the future of a smart home, FORTNIoT collects information about the future and simulates trigger-condition-action rules. These predictions help inhabitants understand how their smart home will behave and give them more appropriate trust.
                FortClash is able to detect conflicts in future predictions, and gives inhabitants the unique opportunity to resolve them before they occur.</p>
            <p class="contact">
                <a href="mailto:sven.coppers@uhasselt.be">Sven Coppers</a><sup>1,2</sup>,
                <a href="mailto:davy.vanacken@uhasselt.be">Davy Vanacken</a><sup>1,2</sup>,
                <a href="mailto:kris.luyten@uhasselt.be">Kris Luyten</a><sup>1,2</sup>
            </p>
            <p class="contact">
                Publications:
                <a href="https://dl.acm.org/doi/10.1145/3432225"><img class="icon" src="img/pdf.png" /> IMWUT 2020</a>
                <!-- <a href="http://researcharchive.wintec.ac.nz/7211/1/FMIS%202019%20informal%20v2.pdf#page=57"><img class="icon" src="test/img/pdf.png" /> FMIS '19</a> -->
            </p>
            <div class="logos">
                <sup>1</sup><a href="https://www.uhasselt.be/edm"><img class="logo" src="img/uhasselt-edm.png" /></a>
                <sup>2</sup><a href="https://www.uhasselt.be/edm"><img class="logo" src="img/fm.png" /></a>
            </div>

        </div>
        <div class="controls">
            <form method="get" action="">
                <label for="scenario">Choose a scenario:</label>
                <select name="scenario" id="scenario" onChange="this.form.submit()">
                    <?php
                        foreach ($scenarios as $scenario) {
                            $selected = $selectedScenario == $scenario ? "selected" : "";
                            echo '<option ' .  $selected . ' >' . $scenario . '</option>';
                        }
                    ?>
                </select>

             <label for="predictions">Make additional predictions:</label>
                <input onChange="this.form.submit()" type="checkbox" name="predictions" id="predictions" <?php echo  $predictionsOn ? 'checked=\"checked\"' : ""  ?> />
                <label id="remote_label" for="remote">Remote:</label>
                <input onChange="this.form.submit()" type="checkbox" name="remote" id="remote" <?php echo  $forceRemote ? 'checked=\"checked\"' : ""  ?> />
            </form>
            <!-- <span id="version">Version B</span>
            <span id="question"></span>
            <a href="" id="reload">&#x21bb;</a>-->
        </div>
    </div>
    <div id="iot">


        <p id="connection_error">Connecting to the IoT Server.</p>
        <div class="clearfix"></div>
        <div class="timeline_wrapper hidden">
        </div>
        <div class="clearfix"></div>

        <div class="clearfix"></div>
    </div>

    </body>
    <!-- Libraries -->
    <script type="text/javascript" src="https://unpkg.com/vis-timeline@7.4.0/standalone/umd/vis-timeline-graph2d.min.js"></script>
    <!--  <script type="text/javascript" src="https://unpkg.com/moment@2.29.0/min/moment.min.js"></script>-->
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>


    <script src="js/demo.js"></script>

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
    <script src="js/model/FutureClient.js"></script>

    <script src="js/timeline/components/TimelineComponent.js"></script>
    <script src="js/timeline/components/StateComponent.js"></script>
    <script src="js/timeline/components/EventComponent.js"></script>
    <script src="js/timeline/components/GraphComponent.js"></script>

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
    <script src="js/timeline/components/devicecomponents/RulesComponent.js"></script>

    <script src="js/timeline/devices/BusStopTimeline.js"></script>
    <script src="js/timeline/devices/CalendarTimeline.js"></script>
    <script src="js/timeline/devices/HueTimeline.js"></script>
    <script src="js/timeline/devices/BusStopTimeline.js"></script>
    <script src="js/timeline/devices/IoTButtonTimeline.js"></script>
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