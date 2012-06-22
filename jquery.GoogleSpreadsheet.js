/*
 * Copyright (c) 2012 David Kindler (davidkindler.com)
 * This is licensed under GPL (http://www.opensource.org/licenses/gpl-license.php) licenses.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
/* * 
 * @name GoogleSpreadsheet
 * @type jQuery
 * @param Object _options;
 *			key	: Google Spreadsheet ODD key.  Only public spreadsheets can be read.
 *			GS_Table_class	:	Class applied to table
 *			table_head	:	Template for table head whcih can include filter definitions.  By default all columns will be shown.  This will redefine how table heads are displayed. Opening and closing thead tags are required. For example:
 <thead><tr><th filter-type="ddl">Code</th><th >Title</th><th filter-type="ddl">Description</th></tr></thead>
 *			table_template	:	Template for table body.  This must be displayed as return function.  You can use the cell[] array to arrange cell data.  For example:
 function(cell){return '<tr><td><a target="_new" href="'+cell[2]+'">'+cell[1]+'</a></td><td>'+cell[3]+'</td><td>'+cell[4]+'</td><td>'+cell[5]+'</td></tr>'}
 *			filters:  default is true for column filtering.  Column filtering can be text or select.  Assign attribute 'filter-type=ddl' for select list in table_head.
 *			subfitlers : sets up parent/child relationship for select filters.  eg: {'3':''4'} would make column 4 a subfilter of column 3.
 *			alternateRowClassNames	:	Alternating class names for each row after filtering. Maximum of two items.
 *
 * Table is composed of thead and tbody.  By default all columns will have text filter.  
 * If you want a drop down list add "filter-type" attribute to th cell and set to ddl. eg. <th filter-type="ddl"> 
 * If you do not want column to be filtered add "filter-type" attribute to th cell and set to none. eg. <th filter-type="none"> 
 *
 * @author David Kindler (davidkindler.com)
 * @version 1.0.1
 */
(function (jQuery) {
    jQuery.fn.GoogleSpreadsheet = function (options,callback) {
        defaults = {
            'GS_Table_class': 'GS_Table',
            'table_head': undefined,
            'table_template': undefined,
            'filters': true,
            'subfilters': {},
            'alternateRowClassNames': []
        }

        function isChild(obj, key) {
            for (var i in obj) {
                if (obj[i] == key) {
                    return true;
                }
            }
        }

        Array.prototype.unique = function () {
            var o = {},
                i, l = this.length,
                r = [];
            for (i = 0; i < l; i += 1) {
                o[this[i]] = this[i]
            }
            for (i in o) {
                r.push(o[i])
            }
            return r
        };
        var _options = $.extend({}, defaults, options);
        var evenRow = _options.alternateRowClassNames[0] || "",
            oddRow = _options.alternateRowClassNames[1] || "";
        return this.each(function () {
            var containerID = $(this);
            var obj, numCols;

            var filter = function (selector, query, f) {
                $(selector, obj).each(function () {
                    $(this).text().search(new RegExp(query, "i")) < 0 ? $(this).attr("data-value", 0) : $(this).attr("data-value", 1);
                    sum = 0;
                    sum += parseInt($(this).attr("data-value"));
                    $(this).siblings().each(function () {
                        sum += parseInt($(this).attr("data-value"))
                    });
                    sum < numCols ? $(this).parent(this).hide() : $(this).parent(this).show();
                });
            }; // var filter = function (selector, query, f) {
            var inputFilter = function (column) {
                $("#Col" + column, obj).empty().wrapInner('<input type="text" id="filterText' + column + '" class="filterText">');
                $("#filterText" + column, obj).keyup(function (event) {
                    filter("tbody>tr>td:nth-child(" + column + ")", $(this).val(), alternateRows)
                })
            }; //  var inputFilter = function (column) {
            var selectFilter = function (column) {
                $("#Col" + column, obj).empty().wrapInner('<select id="filterText' + column + '" class="filterText">');
                setupSelectFilter(column);
                $("#filterText" + column, obj).change(function (event) {
                    selectedTrack = $(this).val();
                    if (_options.subfilters[column]) { // This is parent filter so we need to change the subfilter
                        subfilter = _options.subfilters[column];
                        var parentfilter = $('#filterText' + subfilter, obj);
                        if (selectedTrack.length) {
                            var items = [],
                                Uoptions = [];
                            i = parseInt(column) - 1;
                            j = parseInt(subfilter) - 1;
                            $('tbody>tr').each(function () {
                                if ($(this).find('td:eq(' + i + ')').text() == selectedTrack) {
                                    str = $(this).find('td:eq(' + j + ')').attr('data-value', 1).text();
                                    items.push($.trim(str));
                                }
                            });
                            var Uitems = items.unique();
                            Uitems.unshift("");
                            $.each(Uitems, function (i, item) {
                                Uoptions.push('<option value="' + item + '">' + item + '</option>');
                            })
                            parentfilter.empty().append(Uoptions.join(""));
                        } //if (selectedTrack.length) 
                        else {
                            $('tbody tr td:nth-child(' + column + ')').attr('data-value', 1);
                            $('tbody tr td:nth-child(' + subfilter + ')').attr('data-value', 1);
                            parentfilter.empty().append('<option ></option>');
                        } //if (selectedTrack.length) 					
                    } //if (!_options.subfilters[column]) {
                    filter("tbody tr td:nth-child(" + column + ")", $(this).val(), alternateRows)
                }) //$("#filterText" + column, obj).change(function (event) {
            }; //var selectFilter = function (column) {
            var setupSelectFilter = function (column) {
                var items = [],
                    Uoptions = [];
                if (!isChild(_options.subfilters, column)) {
                    $("tbody>tr", obj).each(function () {
                        str = $.trim($(this).find("td:nth-child(" + column + ")", this).text());
                        if (str.length) {
                            items.push(str)
                        }
                    });
                    var Uitems = items.unique();
                    Uitems.unshift("");
                    $.each(Uitems, function (i, item) {
                        Uoptions.push('<option value="' + item + '">' + item + "</option>")
                    });
                    $("#filterText" + column, obj).empty().append(Uoptions.join(""))
                }
                else {
                    $("#filterText" + column, obj).empty().append('<option ></option>');
                }
            }; // var setupSelectFilter = function (column) {
            var alternateRows = function (obj) {
                if (_options.alternateRowClassNames && _options.alternateRowClassNames.length) {
                    $("tbody>tr:visible:even", obj).removeClass(oddRow).removeClass(evenRow).addClass(evenRow);
                    $("tbody tr:visible:odd", obj).removeClass(oddRow).removeClass(evenRow).addClass(oddRow)
                }
            }; // var alternateRows = function (obj) {
            var ColumnFilter = function () {                
				obj = $(containerID).find('table').first();
                if (_options.filters) {
					numCols = obj.find("tr")[0].cells.length;
	
					$("thead", obj).append('<tr class="filterColumns" />');
					for (i = 1; i <= numCols; i++) {
						$(".filterColumns", obj).append('<td id="Col' + i + '">')
					}
					for (i = 0; i <= numCols; i++) {
						if ($("thead th:eq(" + i + ")", obj).attr("filter-type") != "none") {
							($("thead th:eq(" + i + ")", obj).attr("filter-type") == "ddl") ? selectFilter(i + 1) : inputFilter(i + 1)
						}
					}
					  $("tbody tr td", obj).attr("data-value", 1);
					}
                alternateRows(obj);				
            } //var ColumnFilter = function() {
            var parsedata = function (retdata, rows, columns) {
                var Rows = [];
                var row = [];
                var cell = [];
                rowCount = 0;
                for (var j = 1; j <= rows; j++) {
                    rowCount++;
                    for (var i = 1; i <= columns; i++) {
                        cell[i] = (typeof retdata[j][i] != "undefined" ? retdata[j][i] : '');
                        if (!_options.table_template || !_options.table_head) {
                            row.push('<td>' + cell[i] + '</td>');
                        } // if (!_options.table_template  || !_options.table_head) { 	   
                    } //for (var i=1; i<=columns; i++) {
                    if (_options.table_template && _options.table_head) {
                        if (rowCount == 1) {
                            Rows.push(_options.table_head);
                        } else {
                            Rows.push(_options.table_template(cell));
                        }
                    } else {
                        if (rowCount == 1) {
                            Rows.push('<thead><tr>' + row.join("") + '</tr></thead>');
                        } else {
                            Rows.push('<tr style="display:table-row;">' + row.join("") + '</tr>')
                        }
                    }
                    var row = [];
                } // for (var j=1; j<rows; j++) {	
                $('<table/>', {
                    html: Rows.join('')
                }).attr({
                    'class': _options.GS_Table_class
                }).appendTo(containerID);
            }
            if (_options.key) {
                jQuery.getJSON('http://spreadsheets.google.com/feeds/cells/' + _options.key + '/od6/public/basic?alt=json-in-script&callback=?', function (data) {
                    var rows = 0;
                    var columns = 0;
                    var entryidRC = /.*\/R(\d*)C(\d*)/;
                    var retdata = [];
                    var index = data.feed.entry.length;
                    for (l = 0; l < index; l++) {
                        var entry = data.feed.entry[l];
                        var id = entry.id.$t;
                        var m = entryidRC.exec(id);
                        var R, C;
                        if (m != null) {
                            R = parseInt(m[1]);
                            C = parseInt(m[2]);
                        }
                        var row = retdata[R];
                        if (typeof(row) == 'undefined') retdata[R] = [];
                        retdata[R][C] = entry.content.$t;
                        rows = Math.max(rows, R);
                        columns = Math.max(columns, C);
                    }
                    parsedata(retdata, rows, columns);                  
				    ColumnFilter();
					if (typeof callback == 'function') { // make sure the callback is a function
						callback.call(this); // brings the scope to the callback
					}
                });
            } else {
                alert("No Google Spreadsheet key");
            }
        }); //return this.each(function() {
    } //$.fn.GoogleSpreadsheet = function(_options) {
})(jQuery); //(function($){