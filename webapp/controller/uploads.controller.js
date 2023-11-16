sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
	"sap/m/Dialog",
    "sap/m/library",
    "sap/m/Button",
    "sap/m/Text",
    "sap/ui/core/util/Export", 
    "sap/ui/core/util/ExportTypeCSV",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/m/PDFViewer",
    "sap/ui/core/Fragment"        
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, MessageBox, Dialog, mobileLibrary, Button, Text, Export, ExportTypeCSV, Spreadsheet, exportLibrary, Filter, FilterOperator, PDFViewer, Fragment) {
        "use strict";
        var oModel,
            vGUID,
            vPnlUp,
            vPnlLog,
            vTab,
            vBtnUp,
            vPage,
            vCarregados,
            vShowRef;

        var cFiles;

        var EdmType = exportLibrary.EdmType;

        return Controller.extend("com.fidelidademundial.zrefatintuploads.controller.uploads", {
            onInit: function () {
                this.getView().byId("UploadCollection").setUploadUrl("/sap/opu/odata/SAP/ZRE_GW_FAT_INT_UPLOADS_SRV/ZENT_UPLOADSet");
                oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZRE_GW_FAT_INT_UPLOADS_SRV",false);
                this.getView().setModel(oModel);

                vPnlUp  = this.getView().byId("PnlUpload");
                vPnlLog = this.getView().byId("PnlLog");
                vTab    = this.getView().byId("UpTab");
                vBtnUp  = this.byId("BtnUp");
                vPage   = this.byId("page");

            },

            onChange: function (oEvent) {

                vCarregados = 0;
                
                var oUploadCollection = oEvent.getSource();

                // Header Token
                oModel.refreshSecurityToken();
                var oHeaders = oModel.oHeaders;
                var sToken = oHeaders['x-csrf-token'];
                var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                name: "x-csrf-token",
                value: sToken

                });

                oUploadCollection.addHeaderParameter(oCustomerHeaderToken);         
                
                // GUID OPERACIONAL
                vGUID = globalThis.crypto.randomUUID();

                //debugger;

            },

            onBeforeUploadStarts: function (oEvent) {

                var vSlug =  vGUID + "|" + oEvent.getParameter("fileName");   

                // Header Slug
                var oCustomerHeaderSlug = new sap.m.UploadCollectionParameter({
                    name: "slug",
                    value: vSlug
                });
                oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);


                setTimeout(function () {
                    // MessageToast.show("Event beforeUploadStarts triggered");
                }, 4000);

            },

            onUploadComplete: function (oEvent) {

                vCarregados++;
                
                var sUploadedFileName = oEvent.getParameter("files")[0].fileName;

                setTimeout(function () {
                    var oUploadCollection = this.byId("UploadCollection");

                    for (var i = 0; i < oUploadCollection.getItems().length; i++) {
                        if (oUploadCollection.getItems()[i].getFileName() === sUploadedFileName) {
                            oUploadCollection.removeItem(oUploadCollection.getItems()[i]);
                            break;
                        }



                    }

                    // delay the success message in order to see other messages before
                    // MessageToast.show("Event uploadComplete triggered");
                }.bind(this), 8000);
                
                // Só carregará a tabela no último registro
                if ( cFiles == vCarregados )
                {
                this.CarregaTab(oEvent);   
                }

            },

            onStartUpload: function (oEvent) {

                var DialogType = mobileLibrary.DialogType,
                    ButtonType = mobileLibrary.ButtonType;

                if (!this.oApproveDialog) {
                    this.oApproveDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Confirmação",
                        content: new Text({ text: "Seguir com o upload dos ficheiros selecionados?" }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "Continuar",
                            press: function () {

///////////////////////////////////////////////                                    

                var oUploadCollection       = this.byId("UploadCollection");
                cFiles = oUploadCollection.getItems().length;
                var uploadInfo = cFiles + " ficheiro(s)";
                var vFilename;

                if (cFiles > 0) {
                    oUploadCollection.upload();
                    MessageToast.show("Carregados (" + uploadInfo + ")");
                    this.oApproveDialog.close();
                }

                //this.CarregaTab(oEvent);    

///////////////////////////////////////////////                                    

                        }.bind(this)
                    }),
                    endButton: new Button({
                        text: "Cancelar",
                        press: function () {
                            this.oApproveDialog.close();
                        }.bind(this)
                    })
                });
            }                        

            this.oApproveDialog.open();

            },

            MostraUp: function () {
                vPnlUp.setProperty("visible", true);
                vPnlLog.setProperty("visible", false);
                vBtnUp.setProperty("visible", true);
                vPage.setShowNavButton(false);
            },

            MostraLog: function () {
                vPnlUp.setProperty("visible", false);
                vPnlLog.setProperty("visible", true);
                vBtnUp.setProperty("visible", false);
                vPage.setShowNavButton(true);
            },

            CarregaTab: function (oEvent) {

                this.MostraLog();

                var oTemplateLog = new sap.m.ColumnListItem({
                    cells: [
                        new sap.ui.core.Icon({
                            src : {
                                path: "Type",
                                formatter: function(Type){
                                    if (Type==="S"){return "sap-icon://accept";}
                                    else{return "sap-icon://error";};
                                }
                            },
                            color : {
                                path: "Type",
                                formatter: function(Type){
                                    if (Type==="S"){return "Positive";}
                                    else{return "Negative";};
                                }
                            }
                        }),                        
/*                         new sap.m.Text({
                            text: "{Filetype}"
                        }), 
                        new sap.m.Text({
                            text: "{Filename}",
                            icon: "sap-icon://pdf-attachment"
                        }),*/
                        new sap.m.Text({
                            text: "{InvRefNum}"
                        }),                        
                        new sap.m.Button({
                            text: "{Filename}",
                            //icon: "sap-icon://pdf-attachment",
                            icon: {
                                parts: [ { path: "Filetype" } ],
                                formatter: function(Filetype){
                                    if (Filetype==="PDF"){return "sap-icon://pdf-attachment" }
                                    else {return "sap-icon://excel-attachment" };
                                    }
                                }
                            ,
/*                             text: {
                                parts: [ { path: "Type" }, { path: "Filename" } ],
                                formatter: function(Type, Filename){
                                    if (Type==="S"){return Filename }
                                    else {return "" };
                                    }
                                }
                            ,
                            icon: {
                                path: "Type",
                                formatter: function(Type){
                                    if (Type==="S"){return "sap-icon://pdf-attachment"}
                                    else {return "" };
                                }
                            },  */      
                            enabled: {
                                parts: [ { path: "Type" } ],
                                formatter: function(Type){
                                    if (Type==="S"){return true }
                                    else {return false };
                                    }
                                }
                            ,               
                            type: {
                                parts: [ { path: "Type" }, { path: "Filetype" } ],
                                formatter: function(Type, Filetype){
                                    if (Type==="S" && Filetype==="PDF"){return "Negative" }
                                    if (Type==="S" && Filetype==="XLSX"){return "Success" }
                                    else {return "Ghost" };
                                    }
                                }
                            ,                                                                
                            press: function (oEvent) 
                            { 
                                this.CallAction(oEvent) 
                            }.bind(this)
                        }),
                        new sap.m.Text({
                            text: "{Message}"
                        })
                    ]
                });

               var oModelCampos = this.getView().getModel();
               var oFilters = [];
               
               var oTabFilter = new sap.ui.model.Filter("Zreguid",sap.ui.model.FilterOperator.EQ,vGUID);
               oFilters.push(oTabFilter);	

                vTab.bindItems({
                path: "/ZENT_UPLOADLOGSet", 
                sorter: {
                    path: 'InvRefNum',
                    descending: false
                },                
                filters: oFilters, 
                template:oTemplateLog
                });
                

            },

            CallAction: function (evt) {
                //debugger;

                var vRef = this.getView().getModel().getProperty("InvRefNum", evt.getSource().getBindingContext());
                var vFiletype = this.getView().getModel().getProperty("Filetype", evt.getSource().getBindingContext());

                if ( vFiletype == "PDF" )
                {

                var oEntry = {};
                oEntry = {
                    "InvRefNum": vRef
                };

                // Create the Model for the service 
                var oModel = this.getView().getModel();

                var opdfViewer = new PDFViewer();
                this.getView().addDependent(opdfViewer);
                var sServiceURL = this.getView().getModel().sServiceUrl;
			    var sSource = sServiceURL + "/ZENT_UPLOADSet('" + vRef + "')" + "/$value" ;
                opdfViewer.setSource(sSource);
                opdfViewer.setTitle( "PDF File");
                opdfViewer.downloadPDF();          
                
                }
                else
                {

                    if(!vShowRef)
                    {
                        vShowRef = sap.ui.xmlfragment("com.fidelidademundial.zrefatintuploads.view.detail", this);
                    }

                    //debugger;

                    var vDialog = sap.ui.getCore().byId("openDialog"); 
                    vDialog.setTitle("Ref.: " + vRef);
                    

                    // Create the Model for the service 
                    var oModelFrag = new sap.ui.model.odata.ODataModel("/sap/opu/odata/SAP/ZRE_GW_FAT_INT_UPLOADS_SRV",false);

                    oModelFrag.read("/ZENT_FATINTSet('" + vRef + "')", {
                        success: function (oData, oResponse) {
                            var oODataJSONModel = new sap.ui.model.json.JSONModel();
                            oODataJSONModel.setData(oData);
                            vShowRef.setModel( oODataJSONModel, "DetalhesRef" );                            
                        },
                        error: function (oError) {
                         MessageToast.show("ERRO DE COMUNICAÇÃO");
                        }
                       });

                       vShowRef.open();
                   
                }


            },


            
            closeDialog: function () {
                vShowRef.close();
            },


            onSelectChange: function (oEvent) {
                //debugger;
                var oUploadCollection = this.byId("UploadCollection");
                oUploadCollection.setShowSeparators(oEvent.getParameters().selectedItem.getProperty("key"));
            },

            onFiltrarStatus: function (oEvent) {

                var oBinding = vTab.getBinding("items");

                var oValidatedComboBox = oEvent.getSource(),
                    sSelectedKey = oValidatedComboBox.getSelectedKey(),
                    sValue = oValidatedComboBox.getValue();
    
                    var aFilter = [];
                    
                    if (sSelectedKey) {
                    aFilter.push(new Filter("Type",sap.ui.model.FilterOperator.EQ,sSelectedKey));
                    }
    
                    oBinding.filter(aFilter);  
            },

            onFiltrarTipo: function (oEvent) {

                var oBinding = vTab.getBinding("items");

                var oValidatedComboBox = oEvent.getSource(),
                    sSelectedKey = oValidatedComboBox.getSelectedKey(),
                    sValue = oValidatedComboBox.getValue();
    
                    var aFilter = [];
              
                    if (sSelectedKey) {
                    aFilter.push(new Filter("Filetype",sap.ui.model.FilterOperator.EQ,sSelectedKey));
                    }
    
                    oBinding.filter(aFilter);    
            },

            onFiltrar: function (oEvent) {

                debugger;

                var oBinding = vTab.getBinding("items");
                var aFilter = [];

////////////////////// FILTRO STATUS ///////////////////////                
                var sStatus = this.getView().byId('CboStatus').getSelectedKey();
                if (sStatus) {
                    aFilter.push(new Filter("Type",sap.ui.model.FilterOperator.EQ,sStatus));
                }

////////////////////// FILTRO TIPO ///////////////////////                
                var sTipo = this.getView().byId('CboTipo').getSelectedKey();
                if (sTipo) {
                    aFilter.push(new Filter("Filetype",sap.ui.model.FilterOperator.EQ,sTipo));
                }

////////////////////// FILTRO REFERENCIA ///////////////////////                
                var sQuery = this.getView().byId('txtSearch').getValue();                
                //var sQuery = oEvent.getParameter("query");
          
                if (sQuery) {
                  aFilter.push(new Filter("InvRefNum",sap.ui.model.FilterOperator.EQ,sQuery));
                }

////////////////////// APLICAR FILTROS ///////////////////////                                
                oBinding.filter(aFilter);       
               
            },

            onNavButton: function () {

                this.MostraUp();
                
 /*                var oHistory = History.getInstance();
                var sPreviousHas = oHistory.GetPreviousHash();

                if ( sPreviousHas !== undefined ) {
                    window.history.go(-1);
                } else {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.NavTo("Inicio", true)
                } */

            },

            handleFicheiroTemplate: function() {
                var tab = window.open("/sap/opu/odata/SAP/ZRE_GW_FAT_INT_UPLOADS_SRV/ZENT_TEMPLATESet?$format=xlsx", '_blank');
            },

            createColumnConfig: function() {
                var aCols = [];
    
 /*                aCols.push({
                    label: 'Full name',
                    property: ['Lastname', 'Firstname'],
                    type: EdmType.String,
                    template: '{0}, {1}'
                }); */
    
/*                 aCols.push({
                    label: 'Status',
                    type: EdmType.String,
                    property: 'Type',
                    scale: 0
                }); */
    
                aCols.push({
                    label: 'Status',
                    property: 'Type',
                    type: EdmType.String
                });
    
                aCols.push({
                    label: 'Reference',
                    property: 'InvRefNum',
                    type: EdmType.String
                });

                aCols.push({
                    label: 'Ficheiro',
                    property: 'Filename',
                    type: EdmType.String
                });               
                
                aCols.push({
                    label: 'Mensagem',                    
                    property: 'Message',
                    type: EdmType.String
                });                    
    
                /* aCols.push({
                    property: 'Ficheiro',
                    type: EdmType.Date
                });
    
                aCols.push({
                    property: 'Salary',
                    type: EdmType.Number,
                    scale: 2,
                    delimiter: true
                });
    
                aCols.push({
                    property: 'Currency',
                    type: EdmType.String
                });
    
                aCols.push({
                    property: 'Active',
                    type: EdmType.Boolean,
                    trueValue: 'YES',
                    falseValue: 'NO'
                }); */
    
                return aCols;
            },

            onExport: function() {
                var aCols, oRowBinding, oSettings, oSheet, oTable;
    
                if (!this._oTable) {
                    this._oTable = this.byId("UpTab");
                }
    
                oTable = this._oTable;
                oRowBinding = oTable.getBinding("items");
                aCols = this.createColumnConfig();
    
                oSettings = {
                    workbook: {
                        columns: aCols
                        //hierarchyLevel: 'Level'
                    },
                    dataSource: oRowBinding,
                    fileName: 'UploadLog.xlsx',
                    worker: true // We need to disable worker because we are using a MockServer as OData Service
                };
    
                oSheet = new Spreadsheet(oSettings);
                oSheet.build().finally(function() {
                    oSheet.destroy();
                });
            },            

           /*  handleFicheiroModeloPress: function() {

                 var successGetExcel = function(oData, oResponse) {

                    if (oData.getExcel) {
    
                        var a = window.document.createElement('a');
    
                        var blob = new Blob([this.s2ab(atob(oData.getExcel.Val))], {
                            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                        });
                        a.href = window.URL.createObjectURL(blob);
                        a.download = 'Excel.xlsx';
    
                        // Append anchor to body.
                        document.body.appendChild(a);
                        a.click();
    
                        // Remove anchor from body
                        document.body.removeChild(a);
    
                    }
    
                };
    
                var oModelCampos = this.getView().getModel();    
                oModelCampos.callFunction("/getExcel", {
                    method: "GET",
                    success: jQuery.proxy(successGetExcel, this)
                });


 
                var mainUri = this.getOwnerComponent().getManifestEntry("/sap/opu/odata/SAP/ZRE_GW_FAT_INT_UPLOADS_SRV").uri;
                var vTemplate = window.open(mainUri + "/ZENT_TEMPLATESet/$value"); */

                // Create the Model for the service 
/*                 var oModelCampos = this.getView().getModel();
                var oCols = [],
                    oDescription = [];

                var oSettings, oSheet;

                oModelCampos.read("/ZENT_TEMPLATESet", {
                    success: function (odata, oResponse) {

                        for (let i = 0; i < odata.results.length; i++) {

                                var oColumn = {
                                    label: odata.results[i].Fieldname,
                                    type: EdmType.String,
                                    property: 'SampleString',
                                    width: 20
                                };

                            oCols.push(oColumn);       
                            
                            var Coluna = "'" + odata.results[i].Fieldname + "'" + " : " + odata.results[i].Reptext ;

                            var oDesc = Coluna;
                            oDescription.push(oDesc);                            

                        }

///////////////////////////////////////
oSettings = {
     workbook: {
        columns: oCols
        //hierarchyLevel: 'Level'
    },
    //dataSource: odata.results,
    dataSource: oDescription,
    fileName: 'UploadTemplate.xlsx',
    worker: false // We need to disable worker because we are using a MockServer as OData Service
};

oSheet = new Spreadsheet(oSettings);
oSheet.build().finally(function() {
    oSheet.destroy();
}); */

  /*                       var oExport = new Export({

                            exportType: new ExportTypeCSV({
                                fileExtension: "csv",
                                separatorChar: ";"
                            }),

                            models: oModelCampos,

                            rows: {
                                path: "/"
                            },
                            columns: oCols
                        });

                        oExport.saveFile(vTab).catch(function(oError) {

                        }).then(function() {
                            oExport.destroy();
                        });                
///////////////////////////////////////                        

                    }.bind(this),
                    error: function (oError) {
                        MessageToast.show(oError.value, { duration: 1500	});
                    }
                } );  
            }   */            

        });

    });
