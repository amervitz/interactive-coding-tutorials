## Your First C# Program

This program compiles and runs entirely in your browser. The C# tools download
when you open this tutorial. The home page and JavaScript tutorial do not load them.

`Program.cs` contains the instructions your program executes, from top to bottom.
`using System;` makes names from the System namespace available. A namespace
groups related types. `Console` is a type provided by .NET, and `WriteLine`
is a method that prints a line of text.

```csharp
using System;

Console.WriteLine("Learning C#");
Console.WriteLine("One line at a time");
```

Open the **Compilation** terminal tab to see the source file list, compiler
warnings and errors, and the compilation result and time. **Console Output**
shows output from your program. Compiler errors open the Compilation tab automatically.

You can try a syntax error to see compiler feedback with file names and line
numbers. Try `while (true) { }` to test **Stop**; your editor stays responsive.
Each run starts with fresh program state and stops after 15 seconds.

Double quotes surround a **string**, which is text. The semicolon ends the
statement. C# is case-sensitive: `Console` and `console` are different names.
Lines starting with `//` are comments and do not execute. These examples use
top-level statements, so you do not need to write a `Main` method yet.

### 🎯 Exercise: Greet C#

Change `Program.cs` so the console prints `Hello, C#!`, then run and verify.

> Edit the text inside the double quotes. Keep the punctuation around it.
