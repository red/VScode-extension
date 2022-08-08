# VSCode extensions for [Red Programming language](https://www.red-lang.org/)

An extension with rich support for the [Red Programming language](https://www.red-lang.org/), with features including the following and more:

* auto completion
* goto definition
* navigate to any symbol definition
* hover to view signatures
* Interpret or compile Red source file

## Settings

### Set the Red binaries

To enable features like IntelliSense, you need to configure the path to the [Red binaries](https://www.red-lang.org/p/download.html) in the `Settings`.

There are two ways to do it. Details are as follows.

---
**NOTE**

Restart the VS Code to take effect after changing the `Settings`.

---

### 1. Set the search path of the red binaries

Download the [Red binaries](https://www.red-lang.org/p/download.html) to a local folder, then set the `red.redDir` to it. The plugin will use the latest one according to the filename. 

```
"red.redDir": "D:/Tools/Red/"
```

### 2. Set the full path of the red binaries

If you want to use a specified version of Red binaries, use the following settings:

```
"red.redPath": "/home/user1/tools/red"
"red.redViewPath": "/home/user1/tools/red-view"
"red.redToolChainPath": "/home/user1/tools/red-toolchain"
```

### Set the output folder

You can also configure the directory for output files of the compiler. The current work space (project) directory is used by default.

(**Note**: If no work space directory, the output files are in the same folder as the Red source file.)


```
"red.buildDir": "/home/user1/debug"
```

### Turn off the IntelliSense

In case that you don't like this fancy feature. ;)

```
"red.intelligence": false
```

## Shortcuts

| Key                       | Command                           | Command id         |
| :------------------------ | --------------------------------- | ------------------ |
| <kbd>F6</kbd>             | Interpret Current Red File        | red.interpret      |
| <kbd>Ctrl+F6</kbd>        | Interpret Current Red File(GUI)   | red.interpretGUI   |
| <kbd>F7</kbd>             | Compile Current Red File          | red.compile        |
| <kbd>Ctrl+K Ctrl+M</kbd>  | Show Red Command Menu             | red.commandMenu    |


The following commands are available for the Red extension. These can be associated with keyboard shortcuts via the `keybindings.json` file.
* To configure keyboard shortcuts the way you want, go to the menu under **File > Preferences > Keyboard Shortcuts**. (**Code > Preferences > Keyboard Shortcuts** on Mac)

```javascript
[
    { "key": "f6",                    "command": "red.interpret" },
    { "key": "ctrl+f6",               "command": "red.interpretGUI" },
    { "key": "f7",                    "command": "red.compile" },
    { "key": "unset",                 "command": "red.compileReleaseGUI" },
    { "key": "unset",                 "command": "red.compileReleaseCLI" },
    { "key": "unset",                 "command": "red.clear" },
    { "key": "unset",                 "command": "red.update" },
    { "key": "ctrl+k ctrl+m",         "command": "red.commandMenu" },
]
```

## Feature Screenshots

* auto completion

![Image of Completions](https://raw.githubusercontent.com/red/VScode-extension/0.4.1/images/completion.gif)

* goto definition

![Image of Goto Definition](https://raw.githubusercontent.com/red/VScode-extension/0.4.1/images/goto-definition.gif)

* navigate to any symbol definition

![Image of Goto Definition](https://raw.githubusercontent.com/red/VScode-extension/0.4.1/images/goto-symbols.gif)

* hover to view signatures

![Image of Goto Definition](https://raw.githubusercontent.com/red/VScode-extension/0.4.1/images/hover.gif)

* Interpret or compile Red source file

![Image of Red Command Menu](https://raw.githubusercontent.com/red/VScode-extension/0.4.1/images/redmenu.gif)


## [Issues, Feature Requests and Contributions](https://github.com/red/VScode-extension/issues)

* Contributions are always welcome. Fork it, modify it and create a pull request.
  + Details on contributing can be found [here](https://github.com/red/VScode-extension/wiki/Contribution) 
* Any and all feedback is appreciated and welcome.
  * Please feel free to [add suggestions here](https://github.com/red/VScode-extension/issues)

## Source

[Github](https://github.com/red/VScode-extension)
​                
## License

[BSL-1.0](https://raw.githubusercontent.com/red/VScode-extension/master/LICENSE)
