# VSCode extension for [Red](https://www.red-lang.org/)

An extension with rich support for the [Red language](https://www.red-lang.org/), with features including the following and more:

* hint all syntax errors
* auto completion
* goto definition
* navigate to any symbol definition
* hover to view signatures
* Interpret or compile Red source file

## Quick Start

### 1. Install the extension
### 2. Install [Red](http://www.red-lang.org/p/download.html)

**Note**:

* For Windows user, need to run ```red.exe --cli```
* latest automated build version should be installed for `0.4.x`, and this extension not worked with last stable version

![download](https://raw.githubusercontent.com/red/VScode-extension/0.4.1/images/download.png)

### 3. Turn on/off the intelligence feature

You can turn on/off the intelligence feature in the **User or Workspace Settings file (settings.json)** as follows.

For Example, turn off it:

```
"red.intelligence": false
```
That's all. 

If you want to compile the source file, do the following settings.

---

### Specify the full path of the red toolchain

For compiling Red source file, you need to configure the path to the Red toolchain in the **User or Workspace Settings file (settings.json)** as follows.

  ```
  "red.redPath": "/home/user1/tools/red-latest"
  ```

For Windows user: `c:/work/red/red.exe` or `c:\\work\\red\\red.exe` or `c:\work\red\red.exe` will all be accepted.

### Specify the output folder

You can also configure the directory for output files of the compiler. The current work space (project) directory is used by default.

(**Note**: If no work space directory, the output files are in the same folder as the Red source file.)


  ```
  "red.buildDir": "/home/user1/debug"
  ```


If you are using Linux and prefer to use the Windows version of Red through Wine until GUI support is available for Linux, you can point `red.redPath` to a small [shell script](https://github.com/red/red/wiki/Visual-Studio-Code-Plugin#running-red-through-wine-on-linux).

## Shortcuts

| Key                       | Command                           | Command id         |
| :------------------------ | --------------------------------- | ------------------ |
| <kbd>F6</kbd>             | Interpret Current Red File        | red.interpret      |
| <kbd>Ctrl+F6</kbd>        | Interpret Current Red File(GUI)   | red.interpretGUI   |
| <kbd>F7</kbd>             | Compile Current Red File          | red.compile        |
| <kbd>Ctrl+K Ctrl+M</kbd>  | Show Red Command Menu             | red.commandMenu    |

## Configurations

The following Visual Studio Code settings are available for the Red extension.  These can be set in user preferences or workspace settings.

```javascript
{
    // Path to Red toolchain
    "red.redPath": "",

    // Directory to put compiling result of Red Source file.
    "red.buildDir": "",

    // Whether to enable or disable intelligence.
    "red.intelligence": true
}
```

The following commands are available for the Red extension. These can be associated with keyboard shortcuts via the `keybindings.json` file.
* To configure keyboard shortcuts the way you want, go to the menu under **File > Preferences > Keyboard Shortcuts**. (**Code > Preferences > Keyboard Shortcuts** on Mac)

```javascript
[
    { "key": "f6",                    "command": "red.interpret" },
    { "key": "ctrl+f6",               "command": "red.interpretGUI" },
    { "key": "f7",                    "command": "red.compile" },
    { "key": "ctrl+k ctrl+m",         "command": "red.commandMenu" },
]
```

## Feature Screenshots

* diagnostics

![Image of Completions](https://raw.githubusercontent.com/red/VScode-extension/0.4.1/images/diagnostics.gif)

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
