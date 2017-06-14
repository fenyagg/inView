;(function () {
	"use strict";

	/*
	* Helpers
	* */
	var ifDefined = function (a) {
		return typeof a !== 'undefined' && a !== null;
	};

	if (!ifDefined($)) console.warn("inView: Jquery is required.");

	window.inView = function ($el, params) {
		if ( !ifDefined($el) || $.type($el)!== "object" || !$el.length) { console.warn('inView: $el not valid: '+$el); return {};}

		var params = params || {},
			self = this;

		self.$el = $el;
		self.inView = undefined;
		self.countViews = 0;
		self.params = $.extend(true,
			{
			minHeightPercent: 0,
			minWidthPercent: 0,
			offset: {
				top: 0,
				bottom: 0,
				left: 0, // в планах
				right: 0 // в планах
			},
			once: true,
			onInView: function () {},
			offInView: function () {}
		}, params);

		self.checkInView = function (event) {
				if (self.params.once && !!self.countViews) return;
				var isInView;

				var elementBounds = {
					offsetTop: self.$el.offset().top,
					offsetLeft: self.$el.offset().left,
					outerHeight: self.$el.outerHeight(),
					outerWidth: self.$el.outerWidth(),
				};
				elementBounds.calcOffsetTop = elementBounds.offsetTop + self.params.offset.top;
				elementBounds.calcOffsetBot = elementBounds.offsetTop + elementBounds.outerHeight - self.params.offset.bottom;

				//сколько видно по высоте
				self.inViewHeight = 0;
				self.inViewHeightPercent = 0;
				self.inViewY = (self.params.offset.top + self.params.offset.bottom < elementBounds.outerHeight) &&
								(self.params.offset.top + self.params.offset.bottom < window.innerHeight) &&
								(window.scrollY + window.innerHeight > elementBounds.calcOffsetTop) &&
								(window.scrollY < elementBounds.calcOffsetBot);
				if (self.inViewY) {
					var topCoord = Math.max(window.scrollY, elementBounds.calcOffsetTop);
					var botCoord = Math.min(window.scrollY + window.innerHeight,elementBounds.calcOffsetBot);

					self.inViewHeight = botCoord - topCoord;
					self.inViewHeightPercent = self.inViewHeight/elementBounds.outerHeight*100;
				}

				//TODO добавить offset по ширине
				//сколько видно по ширине
				self.inViewWidth = 0;
				self.inViewWidthPercent = 0;
				self.inViewX = (window.scrollX + window.innerWidth > elementBounds.offsetLeft) && (window.scrollX < elementBounds.offsetLeft + elementBounds.outerWidth);
				if (self.inViewX) {
					var leftCoord = Math.max(window.scrollX, elementBounds.offsetLeft);
					var rightCoord = Math.min((window.scrollX + window.innerWidth), (elementBounds.offsetLeft + elementBounds.outerWidth));

					self.inViewWidth = rightCoord - leftCoord;
					self.inViewWidthPercent = self.inViewWidth/elementBounds.outerWidth*100;
				}

				isInView = (self.inViewHeightPercent > self.params.minHeightPercent) && (self.inViewWidthPercent > self.params.minWidthPercent);

				if (self.inView === isInView ) { return isInView;}
				self.inView = isInView;

				if (self.inView){
					self.params.onInView(self);
					self.$el.trigger('inView');

					self.countViews++;
				} else {
					self.params.offInView(self);
					self.$el.trigger('offView');
				}

				return isInView;
		};

		//init
		(function () {
			self.checkInView();
			$(window).on('resize scroll load', self.checkInView);
		}());
	};

	$.fn.inViewGroup = function(params){
		var params = params || {},
			$items = this,
			inViewGroup = [];
		if (!$items.length) return inViewGroup;
		$items.each(function (index, item) {
			inViewGroup.push(new inView($(item), params));
		});
		return inViewGroup;
	};
	$.fn.lazyLoadInView = function (params) {
		var params = params || {},
			$items = this,
			inViewGroup = [];
		if (!$items.length) return inViewGroup;

		params = $.extend(params, {
			'once': true,
		});

		$items.each(function (index, item) {
			$(item).on('inView', function () {
				var lazyLoadSrc = $(item).data("lazyload");
				if(!lazyLoadSrc) return;
				if ($(item).prop("tagName") == 'IMG') {
					$(item).attr("src",lazyLoadSrc);
				} else {
					$(item).css('background-image','url('+lazyLoadSrc+')')
				}
			});

			inViewGroup.push(new inView($(item), params));
		});
		return inViewGroup;
	}

})();