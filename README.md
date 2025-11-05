# ntc-js-chn

ntc.js 的中文本地化版本，对颜色名字进行了翻译，准确度尚可，可用于个人或商业项目（请仔细核对颜色名字）。

The Chinese localized version of ntc.js. Translates the color names with OKAY accuracy and can be used for personal or commercial projects (please verify the color names again carefully).

核心组件：./ntc-chn.js

重申用法：

 import ntc from '../ntc-chn.js' //改成自己的存放位置

    var n_match  = ntc.name("#6195ED"); //输入十六进制颜色
    n_rgb        = n_match[0]; // 根据输入的十六进制颜色匹配到的有名字的最接近的颜色的RGB值(基本没用)
    n_name       = n_match[1]; // 根据输入的十六进制颜色匹配到的有名字的最接近的颜色的名字(测试用例用到)
    n_exactmatch = n_match[2]; // 精确匹配时为True，近似匹配时为False

    alert(n_match); //测试代码


在测试用例中只测试了n_name = n_match[1] 这个模块（只匹配颜色名字而不使用匹配RGB或者“是否精确匹配”功能）

包含一个 vue3 和 naive-ui 构建的测试用例(./RGBp)。需要使用时在 ./RGBp 下执行 npm install
之后使用 npm run dev来运行示例网页

LICENSE: CC0 1.0 UNIVERSAL

==============================================================

Name That Colour - JavaScript (Credit to Chirag Mehta)

Originally created by Chirag Mehta (http://chir.ag/projects/name-that-color/) is a very useful and free to use JavaScript file that allows you to feed in HTML colour codes (e.g. #FFFFFF) which will output the colour's name or at least its closest match.

It was licenced under Creative Commons licence, therefore I feel I'm within my right to modify and freely redistribute it further.

I placed comments in the index.html and ntc.js to demonstrate how these can be used.

More examples coming soon.
