/*!
 * knitter v0.0.1, https://github.com/hoho/knitter
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
    style.innerHTML = '.Knitter{background:#000;display:none;height:2px;opacity:.4;position:absolute;-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0}.Knitter:after,.Knitter:before{border-bottom:30px solid transparent;border-bottom-style:inset;border-top:30px solid transparent;border-top-style:inset;content:\'\';height:0;margin:-29px -40px 0 0;position:absolute;-webkit-transform:scale(.1);-ms-transform:scale(.1);transform:scale(.1);width:0}.Knitter:before{border-right:90px solid #000;margin-left:-43px}.Knitter:after{border-left:90px solid #000;right:-3px}';
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
            scrollX = window.pageXOffset,
            scrollY = window.pageYOffset,

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

        var a1 = (r1right - r1left) / 2,
            b1 = (r1bottom - r1top) / 2,
            a2 = (r2right - r2left) / 2,
            b2 = (r2bottom - r2top) / 2,
            k = (y2 - y1) / (x2 - x1),
            angle = Math.atan(k),

            // Intersections with each side of both squares.
            intersects1 = [
                [x1 + a1, y1 + k * a1],
                [x1 - a1, y1 - k * a1],
                [x1 + b1 / k, y1 + b1],
                [x1 - b1 / k, y1 - b1]
            ],
            intersects2 = [
                [x2 + a2, y2 + k * a2],
                [x2 - a2, y2 - k * a2],
                [x2 + b2 / k, y2 + b2],
                [x2 - b2 / k, y2 - b2]
            ],

            width,
            cur,
            begin;

        // Find two closest points on the sides.
        for (var i = 0; i < intersects1.length; i++) {
            var p1 = intersects1[i];
            if ((p1[0] >= x1 - a1) &&
                (p1[0] <= x1 + a1) &&
                (p1[1] >= y1 - b1) &&
                (p1[1] <= y1 + b1))
            {
                for (var j = 0; j < intersects2.length; j++) {
                    var p2 = intersects2[j];
                    if ((p2[0] >= x2 - a2) &&
                        (p2[0] <= x2 + a2) &&
                        (p2[1] >= y2 - b2) &&
                        (p2[1] <= y2 + b2) &&
                        // Make sure squares don't intersect.
                        ((p1[0] < x2 - a2) ||
                         (p1[0] > x2 + a2) ||
                         (p1[1] < y2 - b2) ||
                         (p1[1] > y2 + b2)))
                    {
                        cur = getDistance(p1, p2);
                        if (width === undefined || cur < width) {
                            width = cur;
                            begin = p1;
                        }
                    }
                }
            }
        }

        width = Math.round(width) - 6; // width will be NaN in case of intersection.
        tmp = 'transform:' + 'rotate(' + angle + 'rad);';
        knitter.style.cssText = width > 0 ?
            'display:block;' +
            'left:' + Math.round(begin[0] + 3 * Math.cos(angle)) + 'px;' +
            'top:' + Math.round(begin[1] + 3 * Math.sin(angle)) + 'px;' +
            'width:' + width + 'px;' +
            '-webkit-' + tmp +
            '-ms-' + tmp +
            tmp
            :
            'display:none;';
    }


    function getDistance(p1, p2) {
        return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
    }
})(window, document);
