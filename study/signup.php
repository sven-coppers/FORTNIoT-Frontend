<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Intelligible IoT</title>
    <link rel="stylesheet" href="../style/reset.css">
    <link rel="stylesheet" href="../style/survey.css">
</head>
<body>
<div class="landing_container">
    <h1>Sign up for a remote study about the Internet-of-Things</h1>
    <div class="landing">
        <h2>Purpose</h2>
        <p class="briefing">We are investigating how we can make user interfaces easier to understand.</p>

        <h2>Your task</h2>
        <p class="briefing">In this test, you will need to perform short tasks in our web-based prototypes and answer basic questions. Participation will take around <span class="highlight">15-20</span> minutes.
        </p>

        <h2>Data we will collect</h2>
        <p class="briefing">Email address: to ask follow-up questions and to validate data deletion requests<br/>
            Demographic data: gender, age, level of education and occupation to be reported anonymously<br/>
            Non-personal data: mouse events in the prototypes and answers to survey questions</p>

        <h2>Access</h2>
        <p class="briefing">Your data will only be accessible to the main contact of this study, and will be deleted after December 31st 2021. You can contact us if you want your data to be removed earlier.</p>

        <p class="briefing">Thank you for considering participation.</p>
        <p class="briefing">
            Main contact: <a href="mailto:sven.coppers@uhasselt.be">Sven Coppers</a><br />
            Responsible team: <a href="mailto:kris.luyten@uhasselt.be">prof. dr. Kris Luyten</a>
        </p>

        <div class="desktop">
            <input type="checkbox" id="agree" value="agree" /><label for="agree">I understand and give my informed consent</label>
            <p class="briefing"><a class="start_test disabled" href="start.php">Start the test!</a></p>
        </div>
        <div class="mobile">
            <p>You need to use a desktop or laptop to participate in this experiment.</p>
        </div>

        <iframe src="https://calendar.google.com/calendar/embed?height=600&amp;wkst=1&amp;bgcolor=%23ffffff&amp;ctz=Europe%2FBrussels&amp;src=c3Zlbi5jb3BwZXJzQHVoYXNzZWx0LmJl&amp;src=dWhhc3NlbHQuYmVfcjJ1MzcyMW9xam9jdTYwYmE2OGhra2RqbzhAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;src=NXFpdjQ2Y3N2aGN2NGZyYTZ0Y3ByZWFodnNAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;src=NjU0aWY0MDM4MjNkOXBkMTNxNnB1Y3ZlaDhAZ3JvdXAuY2FsZW5kYXIuZ29vZ2xlLmNvbQ&amp;src=bXRnbTg1ODlyNXFoa2dwZnVidWMyYXBhMTc5cmswMmhAaW1wb3J0LmNhbGVuZGFyLmdvb2dsZS5jb20&amp;src=ZGF2eS52YW5hY2tlbkB1aGFzc2VsdC5iZQ&amp;src=a3Jpcy5sdXl0ZW5AdWhhc3NlbHQuYmU&amp;color=%237CB342&amp;color=%2333B679&amp;color=%23D50000&amp;color=%23E4C441&amp;color=%230B8043&amp;color=%23F4511E&amp;color=%238E24AA&amp;showTz=0&amp;showTabs=0&amp;showPrint=0&amp;showDate=1&amp;showNav=1&amp;showTitle=0&amp;showCalendars=0" style="border:solid 1px #777" width="800" height="600" frameborder="0" scrolling="no"></iframe>

    </div>
    <div class="logo_container">
        <img class="logo" src="img/uhasselt.png" />
    </div>
</div>
</body>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
<script type="application/javascript">
    var testExp = new RegExp('Android|webOS|iPhone|iPad|' +
        'BlackBerry|Windows Phone|'  +
        'Opera Mini|IEMobile|Mobile' ,
        'i');

    $(document).ready(function () {
        if (testExp.test(navigator.userAgent)) {
            $(".desktop").remove();
        } else {
            $(".mobile").remove();
        }

        $(".start_test").click(function () {
            if($(this).hasClass("disabled")) return false;
        });

        $("#agree").click(function () {
            $(".start_test").toggleClass("disabled", !$(this).prop('checked'));
        });
    });
</script>
</html>