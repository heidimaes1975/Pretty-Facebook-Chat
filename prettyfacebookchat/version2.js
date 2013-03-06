/*
    Pretty Facebook Chat
    Chrome Extensions for improve facebook chat
    Copyright (C) 2013  Luca Rainone <luca.rainone@gmail.com>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var o = new Rain1Overlay('content'),
	dom = new Rain1Overlay.DOM()
	;


var $window = $(window),
	$document = $(document),
	selectors = {
		chatWindow: {
			container   : '#fbDockChatTabs',
			self        : '#fbDockChatTabs>div',
			selfWindow  : '.fbNubFlyout.fbDockChatTabFlyout',
			selfMenu    : '.mls.rfloat',
			selfBody    : '.fbNubFlyoutBody.scrollable',
			selfTitlebar: '.fbNubFlyoutTitlebar',
			selfHeader  : '.fbNubFlyoutHeader',
			selfOuter   : '.fbNubFlyoutOuter'
		},
		extra : {
			dock : '.fbDockWrapper .fbDock:first'
		}
	},
	// init config
	config = {
		pfc_active           : 1,
		pfc_add_rotate       : 0,
		pfc_shadow           : 5,
		pfc_shadow3d         : [0,0,6],
		pfc_size             : 400,
		pfc_font             : 11,
		pfc_fontfamily       : "",
		pfc_favorites_smiles : {},
		pfc_font_color       : '#333',
		pfc_theme            : ''
	},
	
	animation = '(0.680, -0.550, 0.265, 1.550)';




function addFont(fontName) {
	$('head').append("<link href='https://fonts.googleapis.com/css?family="+fontName+"' rel='stylesheet' type='text/css'>");
}



CAN_DRAG = true;
function pfcAddIcon() {
	if($( selectors.extra.dock ).length>0) {
		var title_on = "pretty facebook chat drag ON";
		var title_off = "pretty facebook chat drag OFF";
		if(CAN_DRAG) {
			var title = title_on;
		}else {
			var title = title_off;
		}
		var $mypfc = $('<div class="fbNub"><a data-hover="tooltip" title="'+title+'" href="#" class="pfc_dock fbNubButton"><i style="background-image:url(\''+chrome.extension.getURL('img/chat_16x16.png')+'\')"</i></a></div>');
		
		if(CAN_DRAG) {
			
			$(this).find(".pfc_dock i").css({
				'background-image':'url("'+chrome.extension.getURL('img/chat_16x16.png')+'")'
			});
			$(this).find('.pfc_dock').attr("title",title_on);
		}else {

			$(this).find(".pfc_dock i").css({
				'background-image':'url("'+chrome.extension.getURL('img/chat_16x16_off.png')+'")'
			});
			$(this).find('.pfc_dock').attr("title",title_off);
		}
		
		$mypfc.click(function() {
			var $this = $(this);
			CAN_DRAG = CAN_DRAG==true? false : true;
			localStorage.setItem("pfc_active",CAN_DRAG);
			if(CAN_DRAG) {
				
				$this.find(".pfc_dock i").css({
					'background-image':'url("'+chrome.extension.getURL('img/chat_16x16.png')+'")'
				});
				_pfc_start();
				$this.find('.pfc_dock').attr("title",title_on);
			}else {

				$this.find(".pfc_dock i").css({
					'background-image':'url("'+chrome.extension.getURL('img/chat_16x16_off.png')+'")'
				});
				$this.find('.pfc_dock').attr("title",title_off);
			}
		});
		$( selectors.extra.dock ).append($mypfc);
	
	}else {
		setTimeout(pfcAddIcon,1000);
	}
}

/**
 * public
 * @param color
 */
function changeFontColor(c) {
	config.pfc_font_color = c;

	$( selectors.chatWindow.self ).each(function() {
		$(this).css("color",c);
	});
}
/**
 * public change theme
 * @param theme
 */
function changeTheme(theme) {
	$(selectors.chatWindow.self).Temify(theme);

	config.pfc_theme = theme;
}

/**
 * public 
 * 
 */ 
function changeFont(f) {
	config.pfc_font = f;
	$(selectors.chatWindow.selfWindow).each(function() {
		var $me     = $(this);
		var classes = $me.attr("class");
		classes = classes.replace(/fontbig[0-9]*/i,"").replace("  "," ");
		$me.attr("class",classes);
		$me.addClass("fontbig"+f);
	});
}
function changeFontFamily(f) {
	config.pfc_fontfamily = f;
	$('head').append("<link href='https://fonts.googleapis.com/css?family="+f+"' rel='stylesheet' type='text/css'>");
	$('#fbDockChat .fbDockChatTabFlyout').each(function() {
		$(this).css("font-family",f);
	});
}
/**
* public change shadow
*/
function changeShadow(f,top,left) {
	console.log(f+", " + top +", "+left);
	$(selectors.chatWindow.selfWindow).css({
		'box-shadow'        : top+'px ' +left+'px '+f+'px #333'
	});
}

// themes
$.fn.Temify = function(theme) {
	var className = $(this).find(selectors.chatWindow.selfWindow).attr("class") || "";
	var classNames = className.split(" ");
	for(var i = 0; i<classNames.length; i++) {
		if(classNames[i].substr(0,10) == 'pfc_theme_') {
			$(selectors.chatWindow.selfWindow).removeClass(classNames[i]);
			break;
		}
	}
	if(theme != '') {
		$(this).find(selectors.chatWindow.selfWindow).addClass('pfc_theme_'+theme);
	}
}

function init() {
	// prettify existent windows
	$(selectors.chatWindow.self)
		.DraggableAndResizable(selectors, config, animation)
		.Emoticonize(selectors,config)
		.Temify(config.pfc_theme);
	
	// listen to DOM modification
	dom.observeNodes(selectors.chatWindow.container , function(modifications)  {
		for(var i = 0; i < modifications.length; i++) {
			if(modifications[i].addedNodes.length > 0) {
				$(modifications[i].addedNodes)
					.DraggableAndResizable( selectors, config, animation )
					.Emoticonize(selectors,config)
					.Temify(config.pfc_theme);
			}
		}
	});
	pfcAddIcon();
	changeShadow(config.pfc_shadow3d[2],config.pfc_shadow3d[0],config.pfc_shadow3d[1]);
};
$(function() {
	init();
});


