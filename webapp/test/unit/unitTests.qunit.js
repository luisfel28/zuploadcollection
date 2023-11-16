/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comfidelidademundial/zre_fatint_uploads/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
