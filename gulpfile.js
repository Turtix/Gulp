//引入gulp模块
const gulp = require('gulp');
const eslint = require('gulp-eslint');
const babel = require('gulp-babel');
const browserify = require('gulp-browserify');
const rename = require("gulp-rename");
const less = require('gulp-less');
const path = require('path');
const livereload = require('gulp-livereload');
const connect = require('gulp-connect');
const open = require("open");
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const LessPluginAutoPrefix = require('less-plugin-autoprefix');  //加前缀  处理兼容性问题(flex)
const autoprefix = new LessPluginAutoPrefix({browsers: ["cover 99.5% ", "not dead"]});

const  cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');

//定义任务
gulp.task('eslint', function() {
    // 将你的任务的任务代码放在这
    return gulp.src(['./src/js/*.js'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(livereload())
});

// 语法转换成es5
gulp.task('babel', () =>
    // 读取所有js文件
    gulp.src('src/js/*.js')
    // 进行语法转换
        .pipe(babel({
            presets: ['@babel/preset-env']
        }))
        // 输出出去
        .pipe(gulp.dest('build/js'))
        .pipe(livereload())
);

//commonjs转换成浏览器可以用的语法
gulp.task('browserify', () => {
     return gulp.src('build/js/app.js')  
     .pipe(browserify())  
     .pipe(rename('built.js'))
     .pipe(gulp.dest('./build/js'))
     .pipe(livereload())
 });

//压缩js代码.
gulp.task('uglify', function() {
    return gulp.src('./build/js/built.js')
        .pipe(uglify())    //压缩
        .pipe(rename('dist.min.js'))
        .pipe(gulp.dest('./dist/js/'))
});

//编译less
gulp.task('less', function () {
    return gulp.src('./src/less/*.less')
        .pipe(less(
            /*{
                        paths: [ path.join(__dirname, 'src/less', 'content.less') ]
                    }*/
        ))
        .pipe(gulp.dest('./build/css'))
        .pipe(livereload())
});

//压缩css代码.
gulp.task('css', function () {
    return gulp.src('./src/less/*.less')
        .pipe(less({
            plugins: [autoprefix] //自动扩展样式的兼容性前缀
        }))  //将less文件转换成css文件
        .pipe(concat('dist.min.css'))  //合并css文件
        .pipe(cleanCSS({compatibility: 'ie8'}))  //压缩css文件
        .pipe(gulp.dest('./dist/css'))
});

//压缩html任务
gulp.task('html', function() {
    return gulp.src('index.html')
        .pipe(htmlmin({collapseWhitespace: true, removeComments: true}))
        .pipe(gulp.dest('dist'))
});


//自动化  --->自动编译 --->浏览器自动刷新 --->浏览器自动打开
gulp.task('watch', function() {
    livereload.listen();

    //在gulp.watch中配置服务器的选项
    connect.server({
        name: 'Dev App', //可以省略
        root : ['build'], //提供服务的根路径
        livereload : true, //是否实时刷新
        port : 3000 //开启端口号
    });
    // 自动开启链接
    open('http://localhost:3000');

    gulp.watch('src/less/*.less', gulp.series('less'));
    gulp.watch('src/js/*.js', gulp.series('js-dev'));
});

//生产环境  编译js-->编译less--->自动化检测.
gulp.task('js-dev', gulp.series('eslint', 'babel', 'browserify'));  //顺序执行
// gulp.task('default', gulp.parallel('eslint', 'babel', 'browserify'));  //并行执行
gulp.task('build', gulp.parallel('js-dev', 'less'));
gulp.task('start', gulp.series('build', 'watch'));  //自动监听

//开发环境  编译js-->压缩js-->生成css并压缩--->压缩html
gulp.task('js-prod', gulp.series('js-dev', 'uglify'));  //顺序执行
gulp.task('prod', gulp.parallel('js-prod', 'css', 'html'));  //压缩
