Red [
    Title: "JSON parser"
    File: %json.red
    Author: "Nenad Rakocevic"
    License: "BSD-3 - https://github.com/red/red/blob/master/BSD-3-License.txt"
]

json: context [
	quoted-char: charset {"\/bfnrt}
	exponent:	 charset "eE"
	sign:		 charset "+-"
	digit-nz:	 charset "123456789"
	digit:		 append copy digit-nz #"0"
	hexa:		 union digit charset "ABCDEabcde"
	blank:		 charset " ^(09)^(0A)^(0D)"
	ws:			 [any blank]
	dbl-quote:	 #"^""
	s: e:		 none

	decode-str: func [start end /local new rule s][
		new: copy/part start back end					;-- exclude ending quote
		rule: [
			any [
				s: remove #"\" [
					#"b" 	(s/1: #"^H")
					| #"f"  (s/1: #"^(0C)")
					| #"n"  (s/1: #"^/")
					| #"r"  (s/1: #"^M")
					| #"t"	(s/1: #"^-")
					| #"u" 4 hexa
				]
				| skip
			]
		]
		parse new rule
		new
	]

	encode-str: func [str [string!] buffer [string!] /local start rule s][
		append buffer #"^""
		start: tail buffer
		append buffer str
		rule: [
			any [
				change #"^H"		"\b"
				| change #"^(0C)"	"\f"
				| change #"^/"		"\n"
				| change #"^M"		"\r"
				| change #"\"		"\\"
				| change #"^-"		"\t"
				| change #"^""		{\"}
				| skip
			]
		]
		parse start rule
		append buffer #"^""
	]
		
	value: [
		string	  keep (decode-str s e)
		| number  keep (load copy/part s e)
		| "true"  keep (true)
		| "false" keep (false)
		| "null"  keep (none)
		| object-rule
		| array
	]

	number: [s: opt #"-" some digit opt [dot some digit opt [exponent sign 1 3 digit]] e:]
	
	string: [dbl-quote s: any [#"\" [quoted-char | #"u" 4 hexa] | dbl-quote break | skip] e:]
	
	couple: [ws string keep (load decode-str s e) ws #":" ws value]
	
	object-rule: [
		#"{" collect set list opt [any [couple #","] couple] ws #"}"
		keep (make map! list)
	]
	
	array: [#"[" collect opt [any [ws value #","] ws value] ws #"]"]
	
	decode: function [data [string!] return: [block! object!]][
		parse data [collect any [blank | object-rule | array]]
	]

	encode-into: function [data [any-type!] buffer [string!]][
		case [
			map? data [
				append buffer #"{"
				either zero? length? data [
					append buffer #"}"
				][
					foreach [k v] body-of data [
						encode-into to word! form k buffer
						append buffer #":"
						encode-into v buffer
						append buffer #","
					]
					change back tail buffer #"}"
				]
			]
			block? data [
				append buffer #"["
				either empty? data [
					append buffer #"]"
				][
					foreach v data [
						encode-into v buffer
						append buffer #","
					]
					change back tail buffer #"]"
				]
			]
			string? data [
				encode-str data buffer
			]
			any [logic? data number? data][
				append buffer mold data
			]
			true [
				encode-into mold data buffer
			]
		]
	]

	encode: function [data return: [string!]][
		buffer: make string! 256
		encode-into data buffer
		buffer
	]
]

