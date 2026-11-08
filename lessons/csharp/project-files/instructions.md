## Project Files and Compiler Settings

A `.csproj` file describes a C# project using XML. A normal .NET SDK build
evaluates it with MSBuild, discovers source files, resolves references, and invokes
the compiler. This browser runner reads a documented subset of project settings
and applies them directly to Roslyn. It does **not** run MSBuild or restore packages.

Open `Tutorial.csproj`. `<Project Sdk="Microsoft.NET.Sdk">` identifies an
SDK-style project. Its `PropertyGroup` sets these supported options:

| Property | Meaning and supported values |
| --- | --- |
| `TargetFramework` | `net10.0`, matching the browser's bundled references and runtime. |
| `OutputType` | `Exe`, a console program with an entry point. |
| `ImplicitUsings` | `enable` or `disable`; supplies common namespace imports when enabled. |
| `Nullable` | `enable` or `disable`; enables nullable reference analysis. |
| `LangVersion` | `12.0` or `13.0`; selects C# syntax rules. |
| `TreatWarningsAsErrors` | `true` or `false`; controls whether compiler warnings prevent execution. |
| `DefineConstants` | Semicolon-separated symbols for `#if` conditional compilation. |

All edited `.cs` files are included automatically. One project file is allowed.
Conditions, imports, item groups, package/project references, custom build targets,
and other properties are rejected with an explanation in the Compilation tab.
The same ordinary project file can be used with the .NET 10 SDK locally, but
browser platform limitations still apply when running here.

`Program.cs` and `Report.cs` omit `using` directives because implicit usings are
enabled. Nullable analysis distinguishes `string` from `string?`, which may be
null; it warns about unsafe dereferences. Try disabling implicit usings to see
the resulting errors, then restore it before continuing.

### 🎯 Exercise: Configure the final report

Keep the working report code. In **Tutorial.csproj**, replace the `DEMO` constant
with **COURSE_COMPLETE**. This changes which branch of `#if` is compiled.
Keep nullable analysis, implicit usings, and warnings-as-errors enabled.
Expected output:

```text
Passing: Ada, Linus
Course complete!
```

> Edit the project setting rather than the preprocessor directives in Program.cs.
