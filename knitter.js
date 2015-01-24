/*!
 * knitter v0.1.0, https://github.com/hoho/knitter
 * (c) 2015 Marat Abdullin, MIT license
 */
(function(window, document) {
    'use strict';

    var nextId = 1,
        knitters = {},
        requestAnimationFrame = window.requestAnimationFrame || setTimeout,
        style;

    function Knitter(node1, node2, parent) {
        if (!(this instanceof Knitter)) {
            return new Knitter(node1, node2, parent);
        }

        if (!(node1 instanceof Node)) { node1 = document.querySelector(node1); }
        if (!(node2 instanceof Node)) { node2 = document.querySelector(node2); }
        if (parent && !(parent instanceof Node)) { parent = document.querySelector(parent); }

        if ((node1 instanceof Node) &&
            (node2 instanceof Node) &&
            (!parent || (parent && (parent instanceof Node))))
        {
            var self = this,
                knitter = self.node = document.createElement('div');

            self.id = nextId++;
            self.node1 = node1;
            self.node2 = node2;

            knitter.className = 'Knitter';
            (parent || document.body).appendChild(knitter);

            self.update(true);
        }
    }

    Knitter.prototype.update = function(reqFrame) {
        var self = this;
        if (reqFrame) {
            requestAnimationFrame(function() { setKnitterPosition(self); }, 0);
        } else {
            setKnitterPosition(self);
        }
    };

    Knitter.prototype.remove = function() {
        var node = this.node;
        if (node && node.parentNode) {
            node.parentNode.removeChild(node);
        }
        delete knitters[this.id];
    };

    window.Knitter = Knitter;

    window.addEventListener('resize', function() {
        requestAnimationFrame(function() {
            for (var id in knitters) {
                setKnitterPosition(knitters[id]);
            }
        }, 0);
    });

    style = document.createElement('style');
    style.innerHTML = '.Knitter{background:#000;display:none;height:2px;opacity:.4;position:absolute;-webkit-transform-origin:0 0;-ms-transform-origin:0 0;transform-origin:0 0}.Knitter:after,.Knitter:before{border-bottom:30px solid transparent;border-bottom-style:inset;border-top:30px solid transparent;border-top-style:inset;content:\'\';height:0;margin:-29px -40px 0 0;position:absolute;-webkit-transform:scale(.1);-ms-transform:scale(.1);transform:scale(.1);width:0}.Knitter:before{border-right:90px solid #000;margin-left:-43px}.Knitter:after{border-left:90px solid #000;right:-3px}';
    document.head.appendChild(style);


    function setKnitterPosition(self) {
        var node = self.node,
            node1 = self.node1,
            node2 = self.node2,
            offsetLeft = 0,
            offsetTop = 0,
            i = node,
            j;

        while (i) {
            if (i === document.body) { break; }
            i = i.parentNode;
        }

        if (!i) {
            delete knitters[self.id];
            return;
        }

        i = node;
        while (i) {
            j = i.offsetParent;
            while (i && (i.offsetParent === j)) {
                i = i.parentNode;
            }
            if (i) {
                offsetLeft += (i.offsetLeft || 0) + (i.clientLeft || 0);
                offsetTop += (i.offsetTop || 0) + (i.clientTop || 0);
                console.log(i, i.offsetTop, i.clientTop);
            }
        }

        if (!(self.id in knitters)) {
            knitters[self.id] = self;
        }

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

            p1,
            p2;

        if (x1 > x2) {
            i = x2; x2 = x1; x1 = i;
            i = y2; y2 = y1; y1 = i;
            i = r2left; r2left = r1left; r1left = i;
            i = r2right; r2right = r1right; r1right = i;
            i = r2top; r2top = r1top; r1top = i;
            i = r2bottom; r2bottom = r1bottom; r1bottom = i;
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
        for (i = 0; i < intersects1.length; i++) {
            p1 = intersects1[i];
            if ((p1[0] >= x1 - a1) &&
                (p1[0] <= x1 + a1) &&
                (p1[1] >= y1 - b1) &&
                (p1[1] <= y1 + b1))
            {
                for (j = 0; j < intersects2.length; j++) {
                    p2 = intersects2[j];
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
        i = 'transform:' + 'rotate(' + angle + 'rad);';
        node.style.cssText = width > 0 ?
            'display:block;' +
            'left:' + Math.round(begin[0] + 3 * Math.cos(angle) - offsetLeft) + 'px;' +
            'top:' + Math.round(begin[1] + 3 * Math.sin(angle) - offsetTop) + 'px;' +
            'width:' + width + 'px;' +
            '-webkit-' + i +
            '-ms-' + i +
            i
            :
            'display:none;';
    }


    function getDistance(p1, p2) {
        return Math.sqrt(Math.pow(p2[0] - p1[0], 2) + Math.pow(p2[1] - p1[1], 2));
    }
})(window, document);
