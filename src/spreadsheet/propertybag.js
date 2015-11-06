(function(f, define){
    define([ "../kendo.core" ], f);
})(function(){

(function(kendo) {
    if (kendo.support.browser.msie && kendo.support.browser.version < 9) {
        return;
    }

    var $ = kendo.jQuery;

    var Property = kendo.Class.extend({
        init: function(list) {
            this.list = list;
        },

        get: function(index) {
            return this.parse(this.list.value(index, index));
        },

        set: function(start, end, value) {
            if (value === undefined) {
                value = end;
                end = start;
            }

            this.list.value(start, end, value);
        },

        parse: function(value) {
            return value;
        },

        copy: function(start, end, dst) {
            this.list.copy(start, end, dst);
        },

        iterator: function(start, end) {
            return this.list.iterator(start, end);
        }
    });

    var JsonProperty = Property.extend({
        set: function(start, end, value) {
            this.list.value(start, end, JSON.stringify(value));
        },

        parse: function(value) {
            return JSON.parse(value);
        }
    });

    var ValueProperty = Property.extend({
        init: function(values, formats, validations) {
            Property.prototype.init.call(this, values);

            this.validations = validations;
            this.formats = formats;
        },

        set: function(start, end, value) {
            //TODO: RESET VALIDATION AS WELL?
            if (value instanceof Date) {
                value = kendo.spreadsheet.dateToNumber(value);
                this.formats.value(start, end, toExcelFormat(kendo.culture().calendar.patterns.d));
            }

            this.list.value(start, end, value);
        }
    });

    function toExcelFormat(format) {
        return format.replace(/M/g, "m").replace(/'/g, '"').replace(/tt/, "am/pm");
    }

    kendo.spreadsheet.PropertyBag = kendo.Class.extend({
        specs: [
            { property: ValueProperty, name: "value", value: null, sortable: true, serializable: true, depends: "format" },
            { property: Property, name: "format", value: null, sortable: true, serializable: true },
            { property: Property, name: "formula", value: null, sortable: true, serializable: true },
            { property: Property, name: "background", value: null, sortable: true, serializable: true },
            { property: JsonProperty, name: "borderBottom", value: null, sortable: false, serializable: true },
            { property: JsonProperty, name: "borderRight", value: null, sortable: false, serializable: true },
            { property: JsonProperty, name: "borderLeft", value: null, sortable: false, serializable: true },
            { property: JsonProperty, name: "borderTop", value: null, sortable: false, serializable: true },
            { property: Property, name: "color", value: null, sortable: true, serializable: true },
            { property: Property, name: "fontFamily", value: null, sortable: true, serializable: true },
            { property: Property, name: "underline", value: null, sortable: true, serializable: true },
            { property: Property, name: "fontSize", value: null, sortable: true, serializable: true },
            { property: Property, name: "italic", value: null, sortable: true, serializable: true },
            { property: Property, name: "bold", value: null, sortable: true, serializable: true },
            { property: Property, name: "textAlign", value: null, sortable: true, serializable: true },
            { property: Property, name: "verticalAlign", value: null, sortable: true, serializable: true },
            { property: Property, name: "wrap", value: null, sortable: true, serializable: true },
            { property: Property, name: "validation", value: null, sortable: false, serializable: true },
            { property: Property, name: "disabled", value: null, sortable: false, serializable: true }
        ],

        init: function(cellCount) {
            this.properties = {};

            this.lists = {};

            this.specs.forEach(function(spec) {
               this.lists[spec.name] = new kendo.spreadsheet.SparseRangeList(0, cellCount, spec.value);
            }, this);

            this.specs.forEach(function(spec) {
                this.properties[spec.name] = new spec.property(this.lists[spec.name], this.lists[spec.depends]);
            }, this);
        },

        getState: function() {
            var state = {};

            this.specs.forEach(function(spec) {
               state[spec.name] = this.lists[spec.name].getState();
            }, this);

            return state;
        },

        setState: function(state) {
            this.specs.forEach(function(spec) {
                this.lists[spec.name].setState(state[spec.name]);
            }, this);
        },

        get: function(name, index) {
            if (index === undefined) {
                return this.lists[name];
            }

            return this.properties[name].get(index);
        },

        set: function(name, start, end, value) {
            this.properties[name].set(start, end, value);
        },

        fromJSON: function(index, value) {
            for (var si = 0; si < this.specs.length; si++) {
                var spec = this.specs[si];

                if (spec.serializable) {
                    if (value[spec.name] !== undefined) {
                        this.set(spec.name, index, index, value[spec.name], false);
                    }
                }
            }
        },

        copy: function(sourceStart, sourceEnd, targetStart) {
            this.specs.forEach(function(spec) {
                this.properties[spec.name].copy(sourceStart, sourceEnd, targetStart);
            }, this);
        },

        iterator: function(name, start, end) {
            return this.properties[name].iterator(start, end);
        },

        sortable: function() {
            return this.specs.filter(function(spec) { return spec.sortable; })
                              .map(function(spec) {
                                return this.lists[spec.name];
                              }, this);
        },

        iterators: function(start, end) {
            var specs = this.specs.filter(function(spec) {
                return spec.serializable;
            });

            return specs.map(function(spec) {
                var iterator = this.iterator(spec.name, start, end);

                return {
                    name: spec.name,
                    value: spec.value,
                    at: function (index) {
                        return spec.property.fn.parse(iterator.at(index));
                    }
                };
            }, this);
        },

        forEach: function(start, end, callback) {
            var iterators = this.iterators(start, end);

            for (var index = start; index <= end; index++) {
                var values = {};

                for (var i = 0; i < iterators.length; i++) {
                    var iterator = iterators[i];
                    var value = iterator.at(index);

                    if (value !== iterator.value) {
                        values[iterator.name] = value;
                    }
                }

                callback(values);
            }
        },

        forEachProperty: function(callback) {
            for (var name in this.properties) {
                callback(this.properties[name]);
            }
        }
    });

    kendo.spreadsheet.ALL_PROPERTIES = $.map(kendo.spreadsheet.PropertyBag.prototype.specs, function(spec) {
        return spec.name;
    });

})(window.kendo);

}, typeof define == 'function' && define.amd ? define : function(a1, a2, a3){ (a3 || a2)(); });
