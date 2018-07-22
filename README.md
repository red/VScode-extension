# Red

An extension with rich support for the [Red language](https://www.red-lang.org/), with features including the following and more:

* Intellisense (autocompletion)
* Signature Help
* Interpret or compile Red source file
* Snippets

## Quick Start

* Install the extension
* If [Red](http://www.red-lang.org/p/download.html) is aleady installed (Note: For Windows user, need to run ```red.exe --cli``` first)

  You're ready to use it.

* Turn off the Auto Completion

  You can turn off the autocompletion in the **User or Workspace Settings file (settings.json)** as follows.

  ```
  "red.autocomplete": false
  ```

## Compile Red Source File

For compiling Red source file, you need to configure the path to the Red toolchain in the **User or Workspace Settings file (settings.json)** as follows.

* Specify the full path of the red toolchain

  ```
  "red.redPath": "/home/user1/tools/red-latest"
  ```

* Relative to `${workspaceRoot}`, where `${workspaceRoot}` resolves to the current work space (project) directory.

  ```
  "red.redPath": "${workspaceRoot}/toolchain/red"
  ```

You can also configure the directory for output files of the compiler. The current work space (project) directory is used by default.

(**Note**: If no work space directory, the output files are in the same folder as the Red source file.)

* Specify the full path

  ```
  "red.buildDir": "/home/user1/debug"
  ```

* Relative to `${workspaceRoot}`

  ```
  "red.buildDir": "${workspaceRoot}/build/debug"
  ```

If you are using Linux and prefer to use the Windows version of Red through Wine until GUI support is available for Linux, you can point `red.redPath` to a small [shell script](https://github.com/red/red/wiki/Visual-Studio-Code-Plugin#running-red-through-wine-on-linux).

## Shortcuts

| Key                       | Command                    | Command id      |
| :------------------------ | -------------------------- | --------------- |
| <kbd>F6</kbd>             | Interpret Current Red File | red.interpret   |
| <kbd>F7</kbd>             | Compile Current Red File   | red.compile     |
| <kbd>Ctrl+K Ctrl+M</kbd>  | Show Red Command Menu      | red.commandMenu |

## Configurations

The following Visual Studio Code settings are available for the Red extension.  These can be set in user preferences or workspace settings.

```javascript
{
    // Path to Red toolchain
    "red.redPath": "",

    // Directory to put compiling result of Red Source file.
    "red.buildDir": "",

    // Whether to enable or disable autocompletion.
    "red.autoComplete": true
}
```

The following commands are available for the Red extension. These can be associated with keyboard shortcuts via the `keybindings.json` file.
* To configure keyboard shortcuts the way you want, go to the menu under **File > Preferences > Keyboard Shortcuts**. (**Code > Preferences > Keyboard Shortcuts** on Mac)

```javascript
[
    { "key": "f6",                    "command": "red.interpret" },
    { "key": "f7",                    "command": "red.compile" },
    { "key": "ctrl+k ctrl+m",         "command": "red.commandMenu" },
    { "key": "",                      "command": "red.interpretGUI" },
    { "key": "",                      "command": "red.compileGUI" }
]
```

## [Issues, Feature Requests and Contributions](https://github.com/red/VScode-extension/issues)

* Contributions are always welcome. Fork it, modify it and create a pull request.
  + Details on contributing can be found [here](https://github.com/red/VScode-extension/wiki/Contribution) 
* Any and all feedback is appreciated and welcome.
  * Please feel free to [add suggestions here](https://github.com/red/VScode-extension/issues)

![Image of General Features](https://raw.githubusercontent.com/red/VScode-extension/master/images/general.gif)

![Image of Red Command Menu](https://raw.githubusercontent.com/red/VScode-extension/master/images/redmenu.gif)

## Source

[Github](https://github.com/red/VScode-extension)
​                
## License

[BSL-1.0](https://raw.githubusercontent.com/red/VScode-extension/master/LICENSE)
