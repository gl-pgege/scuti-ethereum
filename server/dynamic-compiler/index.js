const solc0131 = require('solc-0.1.3-1')
const solc0132 = require('solc-0.1.3-2')
const solc0141 = require('solc-0.1.4-1')
const solc014 = require('solc-0.1.4')
const solc0151 = require('solc-0.1.5-1')
const solc015 = require('solc-0.1.5')
const solc0161 = require('solc-0.1.6-1')
const solc0162 = require('solc-0.1.6-2')
const solc016 = require('solc-0.1.6')
const solc0171 = require('solc-0.1.7-1')
const solc0201 = require('solc-0.2.0-1')
const solc0211 = require('solc-0.2.1-1')
const solc0222 = require('solc-0.2.2-2')
const solc0301 = require('solc-0.3.0-1')
const solc0311 = require('solc-0.3.1-1')
const solc0321 = require('solc-0.3.2-1')
const solc033 = require('solc-0.3.3')
const solc034 = require('solc-0.3.4')
const solc035 = require('solc-0.3.5')
const solc036 = require('solc-0.3.6')
// const solc040 = require('solc-0.4.0')
const solc041 = require('solc-0.4.1')
const solc042 = require('solc-0.4.2')
const solc043 = require('solc-0.4.3')
const solc044 = require('solc-0.4.4')
const solc045 = require('solc-0.4.5')
const solc046 = require('solc-0.4.6')
const solc047 = require('solc-0.4.7')
const solc048 = require('solc-0.4.8')
const solc049 = require('solc-0.4.9')
const solc0410 = require('solc-0.4.10')
const solc0411 = require('solc-0.4.11')
const solc0413 = require('solc-0.4.13')
const solc0414 = require('solc-0.4.14')
const solc0415 = require('solc-0.4.15')
const solc0416 = require('solc-0.4.16')
const solc0417 = require('solc-0.4.17')
const solc0418 = require('solc-0.4.18')
const solc0419 = require('solc-0.4.19')
const solc0420 = require('solc-0.4.20')
const solc0421 = require('solc-0.4.21')
const solc0422 = require('solc-0.4.22')
const solc0423 = require('solc-0.4.23')
const solc0424 = require('solc-0.4.24')
const solc0425 = require('solc-0.4.25')
const solc0426 = require('solc-0.4.26')
const solc050 = require('solc-0.5.0')
const solc051 = require('solc-0.5.1')
const solc052 = require('solc-0.5.2')
const solc053 = require('solc-0.5.3')
const solc054 = require('solc-0.5.4')
const solc055 = require('solc-0.5.5')
const solc056 = require('solc-0.5.6')
const solc057 = require('solc-0.5.7')
const solc058 = require('solc-0.5.8')
const solc059 = require('solc-0.5.9')
const solc0510 = require('solc-0.5.10')
const solc0511 = require('solc-0.5.11')
const solc0512 = require('solc-0.5.12')
const solc0513 = require('solc-0.5.13')
const solc0514 = require('solc-0.5.14')
const solc0515 = require('solc-0.5.15')
const solc0516 = require('solc-0.5.16')
const solc0517 = require('solc-0.5.17')
const solc060 = require('solc-0.6.0')
const solc061 = require('solc-0.6.1')
const solc062 = require('solc-0.6.2')
const solc063 = require('solc-0.6.3')
const solc064 = require('solc-0.6.4')
const solc065 = require('solc-0.6.5')
const solc066 = require('solc-0.6.6')
const solc067 = require('solc-0.6.7')
const solc068 = require('solc-0.6.8')
const solc069 = require('solc-0.6.9')
const solc0610 = require('solc-0.6.10')
const solc0611 = require('solc-0.6.11')
const solc0612 = require('solc-0.6.12')
const solc070 = require('solc-0.7.0')
const solc071 = require('solc-0.7.1')
const solc072 = require('solc-0.7.2')
const solc073 = require('solc-0.7.3')
const solc074 = require('solc-0.7.4')
const solc075 = require('solc-0.7.5')
const solc076 = require('solc-0.7.6')
const solc080 = require('solc-0.8.0')
const solc081 = require('solc-0.8.1')
const solc082 = require('solc-0.8.2')
const solc083 = require('solc-0.8.3')
const solc084 = require('solc-0.8.4')
const solc085 = require('solc-0.8.5')
const solc086 = require('solc-0.8.6')
const solc = {
'0131' : solc0131,
'0132' : solc0132,
'0141' : solc0141,
'014' : solc014,
'0151' : solc0151,
'015' : solc015,
'0161' : solc0161,
'0162' : solc0162,
'016' : solc016,
'0171' : solc0171,
'0201' : solc0201,
'0211' : solc0211,
'0222' : solc0222,
'0301' : solc0301,
'0311' : solc0311,
'0321' : solc0321,
'033' : solc033,
'034' : solc034,
'035' : solc035,
'036' : solc036,
// '040' : solc040,
'041' : solc041,
'042' : solc042,
'043' : solc043,
'044' : solc044,
'045' : solc045,
'046' : solc046,
'047' : solc047,
'048' : solc048,
'049' : solc049,
'0410' : solc0410,
'0411' : solc0411,
'0413' : solc0413,
'0414' : solc0414,
'0415' : solc0415,
'0416' : solc0416,
'0417' : solc0417,
'0418' : solc0418,
'0419' : solc0419,
'0420' : solc0420,
'0421' : solc0421,
'0422' : solc0422,
'0423' : solc0423,
'0424' : solc0424,
'0425' : solc0425,
'0426' : solc0426,
'050' : solc050,
'051' : solc051,
'052' : solc052,
'053' : solc053,
'054' : solc054,
'055' : solc055,
'056' : solc056,
'057' : solc057,
'058' : solc058,
'059' : solc059,
'0510' : solc0510,
'0511' : solc0511,
'0512' : solc0512,
'0513' : solc0513,
'0514' : solc0514,
'0515' : solc0515,
'0516' : solc0516,
'0517' : solc0517,
'060' : solc060,
'061' : solc061,
'062' : solc062,
'063' : solc063,
'064' : solc064,
'065' : solc065,
'066' : solc066,
'067' : solc067,
'068' : solc068,
'069' : solc069,
'0610' : solc0610,
'0611' : solc0611,
'0612' : solc0612,
'070' : solc070,
'071' : solc071,
'072' : solc072,
'073' : solc073,
'074' : solc074,
'075' : solc075,
'076' : solc076,
'080' : solc080,
'081' : solc081,
'082' : solc082,
'083' : solc083,
'084' : solc084,
'085' : solc085,
'086' : solc086,
}
module.exports = solc
