---
outline: deep
---

# sass 的基本使用

### sass 如何引入其他 sass 文件

```scss
// variable.scss
$bg-success: green;
$bg-dangerous: red;
$bg-primary: blue;

// index.scss
@use './variable.scss';
// 或者直接
@use 'variable';
// 也支持 @import 最好别用了
// @import './variable.scss';

.box {
  width: 200px;
  height: 200px;
  background-color: variable.$bg-primary;
}
```

### 为什么推荐用@use 而不是@import

```js
Sass中的@import和@use都是用于导入其他Sass文件的指令，但它们有以下区别：

作用域：@import指令会将导入的文件中的所有变量、函数、mixin等内容都导入到当前文件中，导致命名冲突的风险较大。而@use指令会创建一个新的命名空间，并将导入的文件中的内容都放在该命名空间中，避免了命名冲突的问题。

性能：@import指令在编译时将导入的文件内容都复制到当前文件中，导致编译后的文件较大，加载时间较长。而@use指令则是在运行时动态加载导入的文件内容，因此编译后的文件较小，加载时间较短。

顺序：@import指令可以在任何位置使用，而@use指令必须放在文件的顶部。

引用：@import指令可以使用相对路径或绝对路径来引用文件，而@use指令只能使用相对路径来引用文件。

总的来说，@use指令比@import指令更加灵活、安全和高效，因此在Sass 3.7及以上版本中推荐使用@use指令来导入其他文件。
```

### sass 中 mixin 和如何使用其他 sass 文件中的 mixin

```scss
// 感觉mixin就相当于一个样式函数一样，可以传参数给这个mixin， 通过@include 名字(参数) 来使用
// variable.scss
$bg-success: green;
$bg-dangerous: red;
$bg-primary: blue;

@mixin box($bcColor: red) {
  background-color: $bcColor;
  font-size: 24px;
  border: 10px solid $bg-primary;
  width: 200px;
  height: 200px;
}

// index.scss

// 可以取个别名
@use 'variable' as jianjian;

.box {
  @include jianjian.box(jianjian.$bg-dangerous);
}
```

### sass 中的继承 @extend

```scss
// 需要注意的是，@extend指令只能继承选择器的样式，不能继承属性。此外，@extend指令也可能会产生CSS代码冗余问题，因为它会重复生成选择器。因此，在使用@extend指令时，需要注意选择器的复杂度和代码的可维护性。

// variable.scss
$bg-success: green;
$bg-dangerous: red;
$bg-primary: blue;

@mixin box($bcColor: red) {
  background-color: $bcColor;
  font-size: 24px;
  border: 10px solid $bg-primary;
  width: 200px;
  height: 200px;
}

.boxClass {
  background-color: $bg-dangerous;
  font-size: 24px;
  border: 10px solid $bg-primary;
  width: 200px;
  height: 200px;
}

// index.scss
@use 'variable' as jianjian;

.box {
  @extend .boxClass;
}
```

### sass 中使用@function

```scss
@function add($a, $b) {
  @return $a + $b;
}

.element {
  width: add(100px, 20px);
}
```

### sass 如何动态设置类名字

```scss
// variable.scss
$bg-success: green;
$bg-dangerous: red;
$bg-primary: blue;

@mixin box($bcColor: red, $className: '.box1') {
  background-color: $bcColor;
  font-size: 24px;
  border: 10px solid $bg-primary;
  width: 200px;
  height: 200px;

  #{$className} {
    width: 30px;
    height: 30px;
  }
}

// index.scss
@use 'variable' as jianjian;

body {
  @include jianjian.box(jianjian.$bg-success, '.box');
}

// 以上设置后 body宽高就是200了，body下的.box就是30了
```

### 给属性加上前缀

```scss
@mixin box($property, $value, $prefixes) {
  @each $prefix in $prefixes {
    -#{$prefix}-#{$property}: $value;
  }
  #{$property}: $value;
}

.box {
  @include box(filter, grayscale(50%), moz webkit jianjian);
}
```

### sass 内置 rgba 函数

```scss
$base-color: #c6538c;
$border-dark: rgba($base-color, 0.88);

.alert {
  border: 1px solid $border-dark;
}
```

### @function 和 @mixin 的区别

```js
返回值：@function指令用于定义一个函数，可以返回一个值，而@mixin指令用于定义一个混合器，不会返回任何值。

参数：@function指令可以接受任意数量的参数，并且必须有返回值。而@mixin指令可以接受任意数量的参数，并且不需要返回值。

用法：@function指令通常用于数学计算、颜色转换等需要返回值的操作。而@mixin指令通常用于样式的重用，可以将一组样式定义为一个混合器，然后在需要使用这些样式的地方调用该混合器。

调用方式：@function指令使用函数调用语法，并且可以将函数的返回值赋值给变量。而@mixin指令使用@include指令调用，将混合器的样式插入到调用位置。

需要注意的是，@function指令和@mixin指令可以相互嵌套使用，以实现更复杂的功能。例如，在@mixin指令中可以调用@function指令来进行数学计算，并将计算结果应用于样式中。
```

### sass 中如何使用条件判断

```scss
@mixin avatar($size, $circle: false) {
  width: $size;
  height: $size;

  @if $circle {
    border-radius: $size / 2;
  } @else if $circle === 20px {
    border-radius: $size / 2;
  } @else {
  }
}

.box {
  @include avatar(30px);
}

.box2 {
  @include avatar(30, $circle: true);
}
```

### sass 中的循环遍历

#### @each xx in xxx

```scss
// 类似数组
$sizes: 30px, 40px, 50px;

@each $size in $sizes {
  .box-#{$size} {
    width: $size;
    height: $size;
    background-color: red;
    margin: 20px;
  }
}

// 类似对象
$icons: (
  'eye': '\f112',
  'start': '\f12e',
  'stop': '\f12f',
);

@each $name, $glyph in $icons {
  .icon-#{$name}:before {
    display: inline-block;
    font-family: 'Icon Font';
    content: $glyph;
  }
}
```

#### @for xx from xxx to xxxxx 或者 @for xx from xxx through xxxxx

```scss
// 以上两种唯一区别就是 to是不包括结束边界的
@for $i from 30 through 50 {
  .box-#{$i}px {
    width: #{$i}px;
    height: #{$i}px;
    background-color: green;
    margin: 20px;
  }
}
```
