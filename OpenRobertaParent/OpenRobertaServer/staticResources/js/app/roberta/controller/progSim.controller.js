define([ 'exports', 'message', 'log', 'util', 'simulation.simulation', 'guiState.controller', 'program.controller', 'program.model', 'blocks', 'jquery',
        'jquery-validate', 'blocks-msg' ], function(exports, MSG, LOG, UTIL, SIM, GUISTATE_C, PROG_C, PROGRAM, Blockly, $) {

    var blocklyWorkspace;
    /**
     * 
     */
    function init() {
        blocklyWorkspace = GUISTATE_C.getBlocklyWorkspace();
        //initView();
        initEvents();
        // LOG.sim('init sim view');
    }
    exports.init = init;

    function initEvents() {
        $('#progSim').off('click touchend');
        $('#progSim').on('click touchend', function(event) {
            toggleSim();
            return false;
        });

        $('#simRobotModal').removeClass("modal-backdrop");
        $('#simControl').onWrap('click', function(event) {
            if ($('#simControl').hasClass('typcn-media-play-outline')) {
                Blockly.hideChaff();
                var xmlProgram = Blockly.Xml.workspaceToDom(blocklyWorkspace);
                var xmlTextProgram = Blockly.Xml.domToText(xmlProgram);

                var isNamedConfig = !GUISTATE_C.isConfigurationStandard() && !GUISTATE_C.isConfigurationAnonymous();
                var configName = isNamedConfig ? GUISTATE_C.getConfigurationName() : undefined;
                var xmlConfigText = GUISTATE_C.isConfigurationAnonymous() ? GUISTATE_C.getConfigurationXML() : undefined;

                var language = GUISTATE_C.getLanguage();

                PROGRAM.runInSim(GUISTATE_C.getProgramName(), configName, xmlTextProgram, xmlConfigText, language, function(result) {
                    if (result.rc == "ok") {
                        MSG.displayMessage("MESSAGE_EDIT_START", "TOAST", GUISTATE_C.getProgramName());
                        $('#simControl').addClass('typcn-media-stop').removeClass('typcn-media-play-outline');
                        $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_STOP_TOOLTIP);
                        SIM.init(result.javaScriptProgram, false, GUISTATE_C.getRobotGroup());
                        setTimeout(function() {
                            SIM.setPause(false);
                        }, 500);
                    } else {
                        MSG.displayInformation(result, "", result.message, "");
                    }
                    PROG_C.reloadProgram(result);
                });
            } else {
                $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
                $('#simControl').attr('data-original-title', Blockly.Msg.MENU_SIM_START_TOOLTIP);
                SIM.stopProgram();
            }
        });
        $('#simImport').onWrap('click', function(event) {
            SIM.importImage();
        }, 'simImport clicked');

        $('#simButtonsCollapse').collapse({
            'toggle' : false
        });
        $('#simRobotModal').removeClass("modal-backdrop");

        $('.simInfo').onWrap('click', function(event) {
            SIM.setInfo();
            $("#simButtonsCollapse").collapse('hide');
        }, 'simInfo clicked');

        $('#simRobot').on('click', function(event) {
            $("#simRobotModal").modal("toggle");
            var robot = GUISTATE_C.getRobot();
            var position = $("#simDiv").position();
            position.top += 12;
            if (robot == 'calliope' || robot == 'microbit') {
                position.left = $("#blocklyDiv").width() + 12;
                $("#simRobotModal").css({
                    top : position.top,
                    left : position.left
                });
            } else {
                position.left += 48;
                $("#simRobotModal").css({
                    top : position.top,
                    left : position.left
                });
            }
            $('#simRobotModal').draggable();
            $("#simButtonsCollapse").collapse('hide');
        });

        $('#simValues').onWrap('click', function(event) {
            $("#simValuesModal").modal("toggle");
            var position = $("#simDiv").position();
            position.top += 12;
            $("#simValuesModal").css({
                top : position.top,
                right : 12,
                left : 'initial',
                bottom : 'inherit'
            });
            $('#simValuesModal').draggable();

            $("#simButtonsCollapse").collapse('hide');
        }, 'simValues clicked');

        $('#simResetPose').onWrap('click', function(event) {
            SIM.resetPose();
        }, 'simResetPose clicked');
    }

    function toggleSim() {
        Blockly.hideChaff();
        if ($('#simDiv').hasClass('rightActive')) {
            SIM.cancel();
            $(".sim").addClass('hide');
            $("#simButtonsCollapse").collapse('hide');
            $('.blocklyToolboxDiv').css('display', 'inherit');
            $('#simControl').addClass('typcn-media-play-outline').removeClass('typcn-media-stop');
            Blockly.svgResize(blocklyWorkspace);
            $('#progSim').animate({
                right : '0px',
            }, {
                duration : 750
            });
            $('#blocklyDiv').animate({
                width : '100%'
            }, {
                duration : 750,
                start : function() {
                    $(".modal").modal("hide");
                },
                step : function() {
                    $(window).resize();
                    Blockly.svgResize(blocklyWorkspace);
                },
                done : function() {
                    $('#blocklyDiv').removeClass('rightActive');
                    $('#simDiv').removeClass('rightActive');
                    $('#menuSim').parent().addClass('disabled');
                    $('.nav > li > ul > .robotType').removeClass('disabled');
                    $('.' + GUISTATE_C.getRobot()).addClass('disabled');
                    $(window).resize();
                    Blockly.svgResize(blocklyWorkspace);
                    $('#sliderDiv').hide();
                    $('#progSim').removeClass('shifted');
                }
            });
        } else {
            //LOG.info('run ' + GUISTATE_C.getProgramName() + 'in simulation');
            var xmlProgram = Blockly.Xml.workspaceToDom(blocklyWorkspace);
            var xmlTextProgram = Blockly.Xml.domToText(xmlProgram);

            var isNamedConfig = !GUISTATE_C.isConfigurationStandard() && !GUISTATE_C.isConfigurationAnonymous();
            var configName = isNamedConfig ? GUISTATE_C.getConfigurationName() : undefined;
            var xmlConfigText = GUISTATE_C.isConfigurationAnonymous() ? GUISTATE_C.getConfigurationXML() : undefined;

            var language = GUISTATE_C.getLanguage();

            PROGRAM.runInSim(GUISTATE_C.getProgramName(), configName, xmlTextProgram, xmlConfigText, language, function(result) {
                if (result.rc == "ok") {
                    //                    MSG.displayMessage("MESSAGE_EDIT_START", "TOAST", GUISTATE_C.getProgramName());
                    SIM.init(result.javaScriptProgram, true, GUISTATE_C.getRobotGroup());
                    $(".sim").removeClass('hide');
                    $('#blocklyDiv').addClass('rightActive');
                    $('#simDiv').addClass('rightActive');
                    $('#simButtonsCollapse').collapse({
                        'toggle' : false
                    });
                    var width;
                    var smallScreen = $('#device-size').find('div:visible').first().attr('id') == 'xs';
                    if (smallScreen) {
                        width = 52;
                    } else {
                        width = $('#blocklyDiv').width() * 0.3;
                    }
                    $('#progSim').animate({
                        right : $('#blocklyDiv').width() - width + 4,
                    }, {
                        duration : 750
                    });
                    $('#blocklyDiv').animate({
                        width : width
                    }, {
                        duration : 750,
                        step : function() {
                            $(window).resize();
                            Blockly.svgResize(blocklyWorkspace);
                        },
                        done : function() {
                            if (smallScreen) {
                                $('.blocklyToolboxDiv').css('display', 'none');
                            }
                            $('#sliderDiv').css({
                                'left' : width - 10
                            });
                            $('#sliderDiv').show();
                            $('#progSim').addClass('shifted');
                            $(window).resize();
                            Blockly.svgResize(blocklyWorkspace);
                        }
                    });
                } else {
                    MSG.displayInformation(result, "", result.message, "");
                }
                PROG_C.reloadProgram(result);
            });
        }
    }
});
