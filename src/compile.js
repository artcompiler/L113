/* Copyright (c) 2018, Art Compiler LLC */
const {assert, message, messages, reserveCodeRange} = require("./assert.js");
reserveCodeRange(1000, 1999, "compile");
messages[1001] = "Node ID %1 not found in pool.";
messages[1002] = "Invalid tag in node with Node ID %1.";
messages[1003] = "No aync callback provided.";
messages[1004] = "No visitor method defined for '%1'.";

let translate = (function() {
  let nodePool;
  function translate(pool, options, resume) {
    nodePool = pool;
    return visit(pool.root, options, resume);
  }
  function error(str, nid) {
    return {
      str: str,
      nid: nid,
    };
  }
  function visit(nid, options, resume) {
    assert(typeof resume === "function", message(1003));
    // Get the node from the pool of nodes.
    let node;
    if (typeof nid === "object") {
      node = nid;
    } else {
      node = nodePool[nid];
    }
    assert(node, message(1001, [nid]));
    assert(node.tag, message(1001, [nid]));
    assert(typeof table[node.tag] === "function", message(1004, [JSON.stringify(node.tag)]));
    return table[node.tag](node, options, resume);
  }
  // BEGIN VISITOR METHODS
  let edgesNode;
  function str(node, options, resume) {
    let val = node.elts[0];
    resume([], val);
  }
  function num(node, options, resume) {
    let val = +node.elts[0];
    resume([], val);
  }
  function ident(node, options, resume) {
    let val = node.elts[0];
    resume([], val);
  }
  function bool(node, options, resume) {
    let val = node.elts[0];
    resume([], val);
  }
  function nul(node, options, resume) {
    let val = null;
    resume([], val);
  }
  function add(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      val1 = +val1.value;
      if (isNaN(val1)) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        val2 = +val2.value;
        if (isNaN(val2)) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), val1 + val2);
      });
    });
  };
  function style(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        resume([].concat(err1).concat(err2), {
          value: val1,
          style: val2,
        });
      });
    });
  };
  function type(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      let val;
      if (val1 instanceof Array) {
        val = {};
        val1.forEach(function (v) {
          let k = Object.keys(v)[0];
          val[k] = v[k];
        });
      } else {
        val = val1;
      }
      resume([].concat(err1), {
        type: val,
      });
    });
  };
  function id(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      resume([].concat(err1), {
        id: val1,
      });
    });
  };
  function required(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      resume([].concat(err1), {
        required: val1,
      });
    });
  };
  function metadata(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      let val = {};
      val1.forEach(function (v) {
        let k = Object.keys(v)[0];
        val[k] = v[k];
      });
      resume([].concat(err1), {
        metadata: val,
      });
    });
  };
  function docs(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      let val = {};
      val1.forEach(function (v) {
        let k = Object.keys(v)[0];
        val[k] = v[k];
      });
      resume([].concat(err1), {
        docs: val,
      });
    });
  };
  function object(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      let val = {};
      val1.forEach(function (v) {
        if (typeof v === "object") {
          let k = Object.keys(v)[0];
          val[k] = v[k];
        } else {
          let k = v;
          val[k] = k;
        }
      });
      resume([].concat(err1), val);
    });
  }
  function list(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "LIST",
          elts: node.elts.slice(1),
        };
        list(node, options, function (err2, val2) {
          let val = [].concat(val2);
          val.unshift(val1);
          resume([].concat(err1).concat(err2), val);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        let val = [val1];
        resume([].concat(err1), val);
      });
    } else {
      resume([], []);
    }
  }
  function binding(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        resume([].concat(err1).concat(err2), {key: val1, val: val2});
      });
    });
  }
  function record(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "RECORD",
          elts: node.elts.slice(1),
        };
        record(node, options, function (err2, val2) {
          val2[val1.key] = val1.val;
          resume([].concat(err1).concat(err2), val2);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        let val = {};
        val[val1.key] = val1.val;
        resume([].concat(err1), val);
      });
    } else {
      resume([], {});
    }
  }
  function exprs(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "EXPRS",
          elts: node.elts.slice(1),
        };
        exprs(node, options, function (err2, val2) {
          let val = [].concat(val2);
          val.unshift(val1);
          resume([].concat(err1).concat(err2), val);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        let val = [val1];
        resume([].concat(err1), val);
      });
    } else {
      resume([], []);
    }
  }
  function isObject(val) {
    return (
      val !== null &&
      typeof val === "object" &&
      !Array.isArray(val)
    );
  }
  function program(node, options, resume) {
    if (!options) {
      options = {};
    }
    visit(node.elts[0], options, function (err, val) {
      if (isObject(val[0]) && isObject(options.data)) {
        // If we have two objects, then copy val onto the given object.
        val = [Object.assign(options.data, val[0])];
      }
      // Return the value of the last expression.
      resume(err, val[val.length-1]);
    });
  }
  let table = {
    "PROG" : program,
    "EXPRS" : exprs,
    "STR": str,
    "NUM": num,
    "IDENT": ident,
    "BOOL": bool,
    "NULL": nul,
    "LIST": list,
    "RECORD": record,
    "BINDING": binding,
    "ADD" : add,
    "STYLE" : style,
    "TYPE" : type,
    "ID" : id,
    "REQUIRED" : required,
    "METADATA" : metadata,
    "DOCS" : docs,
    "OBJECT": object,
  }
  return translate;
})();
let render = (function() {
  function escapeXML(str) {
    return String(str)
      .replace(/&(?!\w+;)/g, "&amp;")
      .replace(/\n/g, " ")
      .replace(/\\/g, "\\\\")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function render(val, resume) {
    // Do some rendering here.
    resume([], val);
  }
  return render;
})();
module.exports.compiler = (function () {
  exports.compile = function compile(pool, data, resume) {
    // Compiler takes an AST in the form of a node pool and translates it into
    // an object to be rendered on the client by the viewer for this language.
    try {
      let options = {
        data: data
      };
      translate(pool, options, function (err, val) {
        if (err.length) {
          resume(err, val);
        } else {
          render(val, function (err, val) {
            resume(err, val);
          });
        }
      });
    } catch (x) {
      console.log("ERROR with code");
      console.log(x.stack);
      resume("Compiler error", {
        score: 0
      });
    }
  }
})();
