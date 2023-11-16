/*global QUnit*/

sap.ui.define([
	"comfidelidademundial/zre_fatint_uploads/controller/uploads.controller"
], function (Controller) {
	"use strict";

	QUnit.module("uploads Controller");

	QUnit.test("I should test the uploads controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
