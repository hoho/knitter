/*!
 * knitter v0.0.0, https://github.com/hoho/knitter
 * (c) 2015 Marat Abdullin, MIT license
 */
(function(window, document) {
    'use strict';

    var nextId = 1,
        knitters = {},
        requestAnimationFrame = window.requestAnimationFrame || setTimeout,
        style;

    window.Knitter = function(node1, node2) {
        if (!(node1 instanceof Node)) { node1 = document.querySelector(node1); }
        if (!(node2 instanceof Node)) { node2 = document.querySelector(node2); }

        if ((node1 instanceof Node) && (node2 instanceof Node)) {
            var knitter = document.createElement('div');
            knitter.className = 'Knitter';
            document.body.appendChild(knitter);
            requestAnimationFrame(function() {
                setKnitterPosition.apply(null, (knitters[nextId++] = [knitter, node1, node2]));
            }, 0);
        }
    };

    window.addEventListener('resize', function() {
        requestAnimationFrame(function() {
            for (var id in knitters) {
                setKnitterPosition.apply(null, knitters[id]);
            }
        }, 0);
    });

    style = document.createElement('style');
    style.innerHTML = '.Knitter{background:#000;display:none;height:3px;position:absolute;-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0}.Knitter:after,.Knitter:before{border-bottom:5px solid transparent;border-top:5px solid transparent;content:\'\';height:1px;margin:-4px 0 0;position:absolute;width:1px}.Knitter:before{border-right:10px solid #000;margin-left:-3px}.Knitter:after{border-left:10px solid #000;right:-3px}';
    document.head.appendChild(style);


    function setKnitterPosition(knitter, node1, node2) {
        var r1 = node1.getBoundingClientRect(),
            r2 = node2.getBoundingClientRect(),

            // Shortcuts for a better minification.
            r1left = r1.left,
            r1right = r1.right,
            r1top = r1.top,
            r1bottom = r1.bottom,
            r2left = r2.left,
            r2right = r2.right,
            r2top = r2.top,
            r2bottom = r2.bottom,
            scrollX = window.scrollX,
            scrollY = window.scrollY,

            x1 = scrollX + r1left + ((r1right - r1left) / 2),
            y1 = scrollY + r1top + ((r1bottom - r1top) / 2),
            x2 = scrollX + r2left + ((r2right - r2left) / 2),
            y2 = scrollY + r2top + ((r2bottom - r2top) / 2),

            tmp;

        if (x1 > x2) {
            tmp = x2; x2 = x1; x1 = tmp;
            tmp = y2; y2 = y1; y1 = tmp;
            tmp = r2left; r2left = r1left; r1left = tmp;
            tmp = r2right; r2right = r1right; r1right = tmp;
            tmp = r2top; r2top = r1top; r1top = tmp;
            tmp = r2bottom; r2bottom = r1bottom; r1bottom = tmp;
        }

        var tan = (y2 - y1) / (x2 - x1),
            angle = Math.atan(tan),
            width = Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))),
            sin = (y2 - y1) / width,
            cos = (x2 - x1) / width;

        if (r1right < r2left &&
            (r1bottom > r2top || (r2left - r1right > r2top - r1bottom)) &&
            (r2bottom > r1top || (r2left - r1right > r1top - r2bottom)))
        {
            tmp = (r1right - r1left) / 2;
            width -= tmp / cos;
            x1 += tmp + 3 * cos;
            y1 += tmp * tan;
            tmp = (r2right - r2left) / 2;
            width -= tmp / cos;
        } else if (r1bottom < r2top) {
            tmp = (r1bottom - r1top) / 2;
            width -= tmp / sin;
            y1 += tmp + 3 * sin;
            x1 += tmp * (1 / tan);
            tmp = (r2bottom - r2top) / 2;
            width -= tmp / sin;
        } else if (r2bottom < r1top) {
            tmp = (r2bottom - r2top) / 2;
            width += tmp / sin;
            y1 -= (tmp - 3 * sin);
            x1 -= tmp * (1 / tan);
            tmp = (r1bottom - r1top) / 2;
            width += tmp / sin;
        } else {
            // node1 and node2 intersect.
            width = 0;
        }

        width = Math.round(width) - 6;
        tmp = 'transform:' + 'rotate(' + angle + 'rad);';
        knitter.style.cssText = width > 0 ?
            'display:block;' +
            'left:' + Math.round(x1) + 'px;' +
            'top:' + Math.round(y1) + 'px;' +
            'width:' + width + 'px;' +
            '-webkit-' + tmp +
            '-ms-' + tmp +
            tmp
            :
            'display:none;';
    }
})(window, document);
