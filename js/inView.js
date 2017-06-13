;(function () {
	"use strict";

	/*
	* Helpers
	* */
	var ifDefined = function (a) {
		return typeof a !== 'undefined' && a !== null;
	};

	window.inView = function ($el, params) {
		if ( !ifDefined($el) || $.type($el)!== "object" || !$el.length) { console.warn('inView: $el not valid: '+$el); return {};}

		var params = params || {},
			self = this;

		self.$el = $el;
		self.inView = undefined;
		self.countViews = 0;
		self.params = $.extend({
			minHeightPercent: 0,
			minWidthPercent: 0,
			once: false,
			lazyLoad: true,
			onInView: function () {},
			offInView: function () {}
		}, params);

		self.checkInView = function () {
				if (self.params.once && !!self.countViews) return;

				var elementBounds = {
					offsetTop: self.$el.offset().top,
					offsetLeft: self.$el.offset().left,
					outerHeight: self.$el.outerHeight(),
					outerWidth: self.$el.outerWidth(),
				};

				//сколько видно по высоте
				self.inViewHeight = 0;
				self.inViewHeightPercent = 0;
				self.inViewY = (window.scrollY + window.innerHeight > elementBounds.offsetTop) && (window.scrollY < elementBounds.offsetTop + elementBounds.outerHeight);
				if (self.inViewY) {
					var topCoord = window.scrollY > elementBounds.offsetTop ? window.scrollY : elementBounds.offsetTop;
					var botCoord = window.scrollY + window.innerHeight < elementBounds.offsetTop + elementBounds.outerHeight ? (window.scrollY + window.innerHeight) : (elementBounds.offsetTop + elementBounds.outerHeight);

					self.inViewHeight = botCoord - topCoord;
					self.inViewHeightPercent = self.inViewHeight/elementBounds.outerHeight*100;
				}

				//сколько видно по ширине
				self.inViewWidth = 0;
				self.inViewWidthPercent = 0;
				self.inViewX = (window.scrollX + window.innerWidth > elementBounds.offsetLeft) && (window.scrollX < elementBounds.offsetLeft + elementBounds.outerWidth);
				if (self.inViewX) {
					var leftCoord = window.scrollX > elementBounds.offsetLeft ? window.scrollX : elementBounds.offsetLeft;
					var rightCoord = window.scrollX + window.innerWidth < elementBounds.offsetLeft + elementBounds.outerWidth ? (window.scrollX + window.innerWidth) : (elementBounds.offsetLeft + elementBounds.outerWidth);

					self.inViewWidth = rightCoord - leftCoord;
					self.inViewWidthPercent = self.inViewWidth/elementBounds.outerWidth*100;
				}

				self.inView = (self.inViewHeightPercent > self.params.minHeightPercent) && (self.inViewWidthPercent > self.params.minWidthPercent);

				if (self.inView){
					self.params.onInView(self);
					self.$el.trigger('inView');

					self.countViews++;
				} else {
					self.params.offInView(self);
					self.$el.trigger('offView');
				}
		};

		//init
		(function () {
			self.checkInView();
			$(window).on('resize scroll load', self.checkInView);
		}());

		$.fn.inView = function(){

		};


	};


})();