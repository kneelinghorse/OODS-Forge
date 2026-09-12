# Independent Subscription HC timezone reproduction

Byte-identical current Subscription/detail React HC/A requests in two independent Node processes reproduce both hashes with only TZ changed. Current built handler identifies B2. UTC yields e53138ddc4a051f5af64eaec2a68f0da6081450d94c18f9e13796eeec7f992fb (9730bytes); America/Chicago yields d77a69219501a87cef9c6b318cbdd97802f19caf1776c953b268771ac4379db7 (9713bytes), exactly the retained m05 SVG.

The SVGs contain86elements each. Axis accessibility times change7AM→12PM, plot width306→307, and related tick/mark positions move. Paint declarations and XML text nodes are unchanged. summary.json retains each attribute difference; svg.diff is readable derived output while both raw SVG files remain untouched.

Current and historical composition request schemas differ; the two current timezone requests are identical, and Chicago still reproduces the complete historical SVG. This bounded probe changed no source and ran no suite, capture or census.
