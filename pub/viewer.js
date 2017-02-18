(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/*
 * Copyright 2013 Art Compiler LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
"use strict"
/*
  ASSERTS AND MESSAGES

  We use the 'assert()' function to trap invalid states of all kinds. External
  messages are distinguished from internal messages by a numeric prefix that
  indicates the error code associated with the message. For example, the
  following two asserts implement an internal and external assert, respectively.

     assert(false, "This code is broken.");
     assert(false, "1001: Invalid user input.");

  To aid in the writing of external messages, we keep them in a single global
  table named 'messages'. Each module adds to this table its own messages
  with an expression such as

     messages[1001] = "Invalid user input.";

  These messages are accessed with the 'message' function as such

     message(1001);

  Calling 'assert' with 'message' looks like

     assert(x != y, message(1001));

  ALLOCATING ERROR CODES

  In order to avoid error code conflicts, each module claims a range of values
  that is not already taken by the modules in the same system. A module claims
  a range of codes by calling the function reserveCodeRange() like this:

     reserveCodeRange(1000, 1999, "mymodule");

  If the requested code range has any values that are already reserved, then
  an assertion is raised.

  USAGE

  In general, only allocate message codes for external asserts. For internal
  asserts, it is sufficient to simply inline the message text in the assert
  expression.

  It is good to write an assert for every undefined state, regardless of whether
  it is the result of external input or not. Asserts can then be externalized if
  and when they it is clear that they are the result of external input.

  A client module can override the messages provided by the libraries it uses by
  simply redefining those messages after the defining library is loaded. That is,
  the client can copy and past the statements of the form

     messages[1001] = "Invalid user input.";

  and provide new text for the message.

     messages[1001] = "Syntax error.";

  In the same way different sets of messages can be overridden for the purpose
  of localization.

*/

;
Object.defineProperty(exports, "__esModule", {
  value: true
});
var location = "";
var messages = {};
var reservedCodes = [];
var ASSERT = true;
var assert = (function () {
  return !ASSERT ? function () {} : function (val, str) {
    if (str === void 0) {
      str = "failed!";
    }
    if (!val) {
      var err = new Error(str);
      err.location = location;
      throw err;
    }
  };
})();

var message = function message(errorCode, args) {
  var str = messages[errorCode];
  if (args) {
    args.forEach(function (arg, i) {
      str = str.replace("%" + (i + 1), arg);
    });
  }
  return errorCode + ": " + str;
};

var reserveCodeRange = function reserveCodeRange(first, last, moduleName) {
  assert(first <= last, "Invalid code range");
  var noConflict = reservedCodes.every(function (range) {
    return last < range.first || first > range.last;
  });
  assert(noConflict, "Conflicting request for error code range");
  reservedCodes.push({ first: first, last: last, name: moduleName });
};

var setLocation = function setLocation(location) {
  //assert(location, "Empty location");
  location = loc;
};

var clearLocation = function clearLocation() {
  location = null;
};

var setCounter = function setCounter(n, message) {
  count = n;
  countMessage = message ? message : "ERROR count exceeded";
};

var checkCounter = function checkCounter() {
  if (typeof count !== "number" || isNaN(count)) {
    assert(false, "ERROR counter not set");
    return;
  }
  assert(count--, countMessage);
};

exports.assert = assert;
exports.message = message;
exports.messages = messages;
exports.reserveCodeRange = reserveCodeRange;

},{}],2:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

/* -*- Mode: js; js-indent-level: 2; indent-tabs-mode: nil; tab-width: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */
/* Copyright (c) 2015, Jeff Dyer, Art Compiler LLC */
// This product includes color specifications and designs developed by Cynthia Brewer (http://colorbrewer.org/).
window.gcexports.viewer = function () {
  function update(el, obj, src, pool) {
    obj = JSON.parse(obj);
    obj = [].concat(obj); // We need an array at the root.
    var data = void 0,
        str = void 0;
    var graphs = []; //array of graph objects, rather than a single object full of arrays.
    if (obj.error && obj.error.length > 0) {
      str = "ERROR";
    } else {
      data = {
        tree: obj,
        expanded: ["all"],
        collapsed: []
      };
      if (!(data instanceof Array)) {
        data = [data];
      } //edge case for a single object because the parser likes to unwrap arrays.
    }
    data.forEach(function (element, index, array) {
      if ((typeof element === "undefined" ? "undefined" : _typeof(element)) === "object" && element.tree && typeof element.tree === "string") {
        element.tree = JSON.parse(element.tree);
      }
      graphs = element;
    });
    if (!graphs.height) {
      graphs.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      graphs.height -= 100;
    }
    if (!graphs.width) {
      graphs.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      graphs.width -= 20;
    }
    //partition looks for children arrays starting from root and positions and scales based on number of children and their values.
    function styles(selection, these) {
      these.forEach(function (p) {
        selection.style(p.key, p.val);
      });
    };
    function getWidth(str) {
      var unit = 1;
      var begin = str.indexOf("width=") + 7; // width="
      str = str.substring(begin);
      var end = str.indexOf("px");
      if (end < 0) {
        end = str.indexOf("ex");
        unit = 6;
      }
      str = str.substring(0, end);
      return +str * unit;
    };
    function getHeight(str) {
      var unit = 1;
      var begin = str.indexOf("height") + 8; // height="
      str = str.substring(begin);
      var end = str.indexOf("px");
      if (end < 0) {
        end = str.indexOf("ex");
        unit = 6;
      }
      str = str.substring(0, end);
      return +str * unit;
    };
    var margin = { top: 0, right: 120, bottom: 0, left: 120 };
    var width = graphs.width - margin.right - margin.left;
    var height = graphs.height - margin.top - margin.bottom;
    var i = 0;
    var duration = 750;
    var svgd = d3.select(el).attr("width", graphs.width).attr("height", graphs.height);
    svgd.selectAll("g").remove(); //clear each time
    var svg = svgd.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")"); //translate if you decide margins are necessary
    var color = d3.scale.ordinal().range(graphs.color);
    var diagonal = d3.svg.diagonal().projection(function (d) {
      return [d.y, d.x];
    });
    var maxdepth = 0;
    var tree = d3.layout.tree().children(function (d) {
      //use this to check for metadata. It'll be a little slower but it beats an entire different loop.
      var ch = null;
      if (d.value !== null && _typeof(d.value) === 'object') {
        //typical case, for objects
        var temp = d3.entries(d.value);
        ch = [];
        temp.forEach(function (element, index) {
          d.title = "";
          d.link = "";
          if (element.key === '_') {
            //the designated metadata definer.
            d.title = element.value.title; //value is an object, even though 'value' may be part of it.
            d.value = element.value.value;
            d.name = element.value.name;
            d.link = element.value.link;
            d.image = element.value.image ? element.value.image.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "'") : null;
          } else {
            //add it to the array only if it isn't metadata.
            element.entry = d.entry + '.' + element.key;
            ch.push(element);
          }
        });
        d.value = isNaN(d.value) ? 1 : d.value;
      } else if (d.value && d.value.constructor === Array) {
        //note that unless this is an array OF OBJECTS it's invalid.
        ch = [];
        var temp = {
          key: null,
          value: null
        };
        d.value.forEach(function (element, index) {
          temp.key = index.toString(); //give it it's index as a name.
          temp.value = element; //technically works even if it's, say, an index of numbers (in which case they'll be leaves)
          temp.entry = d.entry + '.' + temp.key;
          ch.push(temp);
        });
        d.value = isNaN(d.value) ? 1 : d.value;
      }
      if (maxdepth < d.depth) {
        maxdepth = d.depth;
      }
      return ch;
    });
    var root = graphs.tree.constructor === Array ? d3.entries({ A: graphs.tree })[0] : d3.entries(graphs.tree)[0];
    root.entry = root.key;
    root = tree.nodes(root); //use the entry to find the appropriate root when implementing root
    tree = d3.layout.tree().size([height, width]);
    var ind = 0;
    if (!graphs.root || !root.some(function (element, index) {
      ind = index; //some ends when it's true, so.
      return element.entry === graphs.root;
    })) {
      ind = 0;
    }
    maxdepth -= root[ind].depth;
    root = root[ind];
    root.x0 = height / 2;
    root.y0 = 0;
    function traverse(d) {
      if (d.children) {
        if (graphs.expanded.some(function (element) {
          return element.startsWith(d.entry + '.') || element === d.entry;
        })) {
          d.children.forEach(traverse);
        } else {
          d._children = d.children;
          d._children.forEach(collapse);
          d.children = null;
        }
      }
    };
    function untraverse(d) {
      //loop through. If it's collapsed, stop. if it's uncollapsed, check.
      if (d.children) {
        //uncollapsed
        if (graphs.collapsed.some(function (element) {
          return element === d.entry;
        })) {
          //if it's actually the place we want.
          d._children = d.children;
          d._children.forEach(collapse);
          d.children = null;
        } else {
          d.children.forEach(untraverse);
        }
      } //otherwise this area is collapsed and doesn't need further input
    };
    function collapse(d) {
      if (d.children) {
        d._children = d.children;
        d._children.forEach(collapse);
        d.children = null;
      }
    };
    if (graphs.expanded[0] !== "all") {
      root.children.forEach(traverse);
    }
    root.children.forEach(untraverse);
    update(root);

    function update(source) {
      var nodes = tree.nodes(root).reverse();
      var links = tree.links(nodes);

      if (graphs.layout === 'fixed') {
        nodes.forEach(function (d) {
          d.y = d.depth * width / maxdepth;
        });
      }

      var node = svg.selectAll("g.node").data(nodes, function (d) {
        return d.id || (d.id = ++i);
      });

      var nodeEnter = node.enter().append("g").attr("class", "node").attr("transform", function (d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
      }).on("click", click).style("cursor", "pointer");

      nodeEnter.append("circle").attr("r", 1e-6).style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
      }).style("stroke", "steelblue").style("stroke-width", "1.5px");

      nodeEnter.append("text").attr("x", -10).attr("dy", ".35em").attr("text-anchor", "end").text(function (d) {
        return d.key;
      }).style("opacity", 1e-6).style("font", "10px sans-serif");

      nodeEnter.append("text").attr("x", 10).attr("dy", ".35em").attr("text-anchor", "start").text(function (d) {
        return d.children || d._children ? '' : d.value;
      }).style("opacity", 1e-6).style("font", "10px sans-serif");

      if (graphs.zoom) {
        nodeEnter.on("mouseover", function (d) {
          this.children[1].style.opacity = 1;
          this.children[2].style.opacity = 1;
        }).on("mouseout", function (d) {
          this.children[1].style.opacity = 1e-6;
          this.children[2].style.opacity = 1e-6;
        });
      }

      var nodeUpdate = node.transition().duration(duration).attr("transform", function (d) {
        return "translate(" + d.y + "," + d.x + ")";
      });

      nodeUpdate.select("circle").attr("r", 4.5).style("fill", function (d) {
        return d._children ? "lightsteelblue" : "#fff";
      });

      if (!graphs.zoom) {
        nodeUpdate.selectAll("text").style("opacity", 1);
      }

      var nodeExit = node.exit().transition().duration(duration).attr("transform", function (d) {
        return "translate(" + source.y + "," + source.x + ")";
      }).remove();

      nodeExit.select("circle").attr("r", 1e-6);

      nodeExit.selectAll("text").style("opacity", 1e-6);

      var link = svg.selectAll("path.link").data(links, function (d) {
        return d.target.id;
      });

      link.enter().insert("path", "g").attr("class", "link").attr("d", function (d) {
        var o = { x: source.x0, y: source.y0 };
        return diagonal({ source: o, target: o });
      }).style("fill-opacity", 0).style("stroke", "#ccc").style("stroke-width", "1.5px");

      link.transition().duration(duration).attr("d", diagonal);

      link.exit().transition().duration(duration).attr("d", function (d) {
        var o = { x: source.x, y: source.y };
        return diagonal({ source: o, target: o });
      }).remove();

      nodes.forEach(function (d) {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    };

    function click(d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    };
  }
  function capture(el) {
    var mySVG = $(el).html();
    return mySVG;
  }
  return {
    update: update,
    capture: capture
  };
}();

},{}]},{},[1,2]);
