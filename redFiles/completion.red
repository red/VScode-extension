Red [
	Title:   "Red Auto-Completion for Visual Studio Code"
	Author:  "Xie Qingtian"
	File: 	 %completion.red
	Tabs:	 4
	Rights:  "Copyright (C) 2016 Xie Qingtian. All rights reserved."
]

do %json.red

write-response: func [response][ 
	write-stdout append response "^/"
]

serialize-completions: function [completions id][
	blk: make block! length? completions
	type: first completions
	completions: next completions

	foreach name completions [
		desp: ""
		sym-type: "variable"
		switch/default type [
			word [
				w: to word! name
				if any-function? get/any w [
					desp: fetch-help :w
				]
				sym-type: "builtin"
			]
			file [name: form name]
		][
			desp: "No matching values were found in the global context."
		]

		append blk make map! reduce [
			'text			name
			'type			sym-type
			'description	desp
			'rightLabel		""
		]
	]

	response: make map! reduce [
		'id			id
		'results	blk
	]
	json/encode response
]

;-- Use the completion function which is used by the red console
;-- TBD replace it with a sophisticated one
parse-completions: function [source line column path][
	n: -1
	until [
		str: source
		if source: find/tail source #"^/" [n: n + 1]
		any [none? source n = line]
	]
	reduce [
		'completions	red-complete-input tail copy/part str column no
		'usages			none
		'signatures		none
	]
]

parse-usages: function [source line column path /local cmpl compl1][
	n: -1
	until [
		str: source
		if source: find/tail source #"^/" [n: n + 1]
		any [none? source n = line]
	]
	cmpl: clear ""
	while  [all [str/:column <> #"^/" str/:column <> #" " str/:column <> none]][
		insert cmpl str/:column 
		column: column - 1
	]
	compl1: clear []  
	if cmpl/1 <> #"^"" [
		append compl1 cmpl
		]
	either cmpl/1 = #"%" [insert compl1 'file][insert compl1 'word]
	unless none? convert-to-int cmpl [compl1: clear []]
	reduce [
		'completions	compl1 
		'usages			none
		'signatures		none
	]
]

convert-to-int: function [a][attempt [to integer! a]]

process: function [data][
	script: first json/decode data
	lookup: script/lookup
	case [
		lookup = "usages" [parse-script: :parse-usages]
		lookup = "completions" [parse-script: :parse-completions]
		true [exit]
	]
	info: parse-script script/source script/line script/column script/path
	either 1 < length? blk: info/completions [			
		write-response serialize-completions blk script/id
	][
		write-response json/encode make map! reduce [
										'id			script/id
										'results	[
											#(
												text: ""
												type: ""
												description: {}
												rightLabel: ""
											)
										]
									]
	]
]



watch: does [
	while [true][
		attempt [process input]
	]
]

watch