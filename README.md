jquery---Google-Spreadsheet
===========================

jquery plugin to manage Google Spreadsheet 

This plugin will retrieve the first sheet of data from a public Google Spreadsheet and display the data in a table format with filters. 
Minimum requirement is the public key of the spreadsheet which you can obtain by going to File -> Publish to the web in the Google Doc.



By default all columns will be displayed. The first row of the table will be used as the header of the table and all columns will be text filtered.


Options:

key - Google Spreadsheet ODD key. Only public spreadsheets can be read. *Required

GS_Table_class :  Class applied to table

table_head :	Template for table head whcih can include filter definitions. By default all columns will be shown. This will redefine how table heads are displayed. Opening and closing thead tags are required. For example:
<thead><tr><th filter-type="ddl">Code</th><th >Title</th><th filter-type="ddl">Description</th></tr></thead>
ddl denotes "drop down list".


  table_template :	Template for table body. This must be displayed as return function. You can use the cell[] array to arrange cell data. For example:
  function(cell){return '<tr><td><a target="_new" href="'+cell[2]+'">'+cell[1]+'</a></td><td>'+cell[3]+'</td><td>'+cell[4]+'</td><td>'+cell[5]+'</td></tr>'}
  Note: table_head works in conjunction with table_template.


filters: default is true for column filtering. Column filtering can be text or select. Assign attribute 'filter-type=ddl' for select list in table_head.

subfitlers : sets up parent/child relationship for select filters. eg: {'3':''4'} would make column 4 a subfilter of column 3.

alternateRowClassNames :	Alternating class names for each row after filtering. Maximum of two items.



Additional comments:

A callback function can be assigned in order to perform post processing needs. For example, it can be used to remove a indicator/progress bar.

Classes and elements IDs are assigned which can be used to further style the table.


 .filterColumns : class used for row of filters
 
 #Colnum (eg. #Col1, Col2...): Element ID assigned to each table column. One based index.
 
 #filterTextnum (eg. #filterText1, #filterText2...)	: Element ID assigned to each filter.
 
 .filterText: Class assigned to each filter.

Visit the Demo page which will illustrate the use and provide examples of features.

