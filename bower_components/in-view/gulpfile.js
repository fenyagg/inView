(function(){
    'use strict';

	var gulp 		= require('gulp'),
		uglify 		= require('gulp-uglifyjs'),
		rename 		= require('gulp-rename');

	gulp.task("bild", function () {
		gulp.src('inView.js')
			.pipe(uglify())
			.pipe(rename({suffix: '.min'}))
			.pipe(gulp.dest("./"));
	});
})();