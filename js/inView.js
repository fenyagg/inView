;(function () {
	"use strict";

	/*
	* Helpers
	* */
	var ifDefined = function (a) {
		return typeof a !== 'undefined' && a !== null;
	};

	window.inView = function (selector, params) {
		if (!ifDefined(selector)) { console.warn("Undefined selector"); return {};}

		var params = params || {},
			self = this;

		self.selector = selector;
		self.params = $.extend({
			minHeightPercent: 0,
			minWidthPercent: 0,
			once: false,
			lazyLoad: true,
			onInView: function () {},
			offInView: function () {}
		}, params);
		self.getElement = function () {
			return $.type(self.selector) === "string" ? $(self.selector) : self.selector;
		};

		self.checkInView = function () {
			var $elements = self.getElement();
			if (!ifDefined($elements) || $elements.length) return;

			$elements.each(function (index, item) {
				var $el = $(item);
				var elInView;
				if (self.params.once && !!$el.data("countViews")) return;

				var elementBounds = {
					offsetTop: $el.offset().top,
					offsetLeft: $el.offset().left,
					outerHeight: $el.outerHeight(),
					outerWidth: $el.outerWidth(),
				};

				//считаем сколько видно по высоте
				self.inViewHeight = 0;
				self.inViewHeightPercent = 0;
				self.inViewY = (window.scrollY + window.innerHeight > elementBounds.offsetTop) && (window.scrollY < elementBounds.offsetTop + elementBounds.outerHeight);
				if (self.inViewY) {
					var topCoord = window.scrollY > elementBounds.offsetTop ? window.scrollY : elementBounds.offsetTop;
					var botCoord = window.scrollY + window.innerHeight < elementBounds.offsetTop + elementBounds.outerHeight ? (window.scrollY + window.innerHeight) : (elementBounds.offsetTop + elementBounds.outerHeight);

					self.inViewHeight = botCoord - topCoord;
					self.inViewHeightPercent = self.inViewHeight/elementBounds.outerHeight*100;
				}

				//считаем сколько видно по ширине
				self.inViewWidth = 0;
				self.inViewWidthPercent = 0;
				self.inViewX = (window.scrollX + window.innerWidth > elementBounds.offsetLeft) && (window.scrollX < elementBounds.offsetLeft + elementBounds.outerWidth);
				if (self.inViewX) {
					var leftCoord = window.scrollX > elementBounds.offsetLeft ? window.scrollX : elementBounds.offsetLeft;
					var rightCoord = window.scrollX + window.innerWidth < elementBounds.offsetLeft + elementBounds.outerWidth ? (window.scrollX + window.innerWidth) : (elementBounds.offsetLeft + elementBounds.outerWidth);

					self.inViewWidth = rightCoord - leftCoord;
					self.inViewWidthPercent = self.inViewWidth/elementBounds.outerWidth*100;
				}

				elInView = (self.inViewHeightPercent - self.params.minHeightPercent) > 0 && (self.inViewWidthPercent - self.params.minWidthPercent) > 0;

				if (elInView){
					self.params.onInView($el, self);
					$el.trigger('inView');

					// lazyload
					if (self.params.lazyLoad && $el.data("lazyload")) {
						if ($el.prop("tagName") == 'IMG')
							$el.attr("src", $el.data("lazyload"))
						else
							$el.css('background-image','url('+$el.data("lazyload")+')')
					}

					$el.data("countViews", +$el.data("countViews")+1);
				} else {
					self.params.offInView($el, self);
					$el.trigger('offView');
				}
			});


		};

		//init
		(function () {
			self.checkInView();
			$(window).on('scroll load', self.checkInView);
		}());

		$.fn.inView = function(){

		};


	};


})();