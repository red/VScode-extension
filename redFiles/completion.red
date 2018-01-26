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
		switch type [
			word [
				w: to word! name
				if any-function? get/any w [
					desp: fetch-help :w
				]
				sym-type: "builtin"
			]
			file [name: form name]
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
parse-script: function [source line column path][
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

process: function [data][
	script: first json/decode data
	lookup: script/lookup

	info: parse-script script/source script/line script/column script/path

	switch/default lookup [
		"arguments" []
		"usages"	[]
	][													;-- lookup: completions
		if 1 < length? blk: info/completions [
			write-response serialize-completions blk script/id
		]
	]
]

watch: does [
	while [true][
		attempt [process input]
	]
]

watch