using System.Reflection;
using System.Diagnostics;
using System.Runtime.InteropServices.JavaScript;
using System.Runtime.Versioning;
using System.Text;
using System.Text.Json;
using Microsoft.CodeAnalysis;
using Microsoft.CodeAnalysis.CSharp;

[SupportedOSPlatform("browser")]
public static partial class Compiler
{
    public static void Main() { }

    private static readonly MetadataReference[] References = typeof(Compiler).Assembly
        .GetManifestResourceNames().Where(name => name.StartsWith("refs."))
        .Select(name => {
            using var stream = typeof(Compiler).Assembly.GetManifestResourceStream(name)!;
            return MetadataReference.CreateFromStream(stream);
        }).ToArray();

    [JSImport("write", "tutorial")]
    internal static partial void Write(string text, string level);

    [JSImport("compilation", "tutorial")]
    internal static partial void CompilationOutput(string text, string level);

    [JSExport]
    public static async Task Run(string filesJson)
    {
        Console.SetOut(new OutputWriter("log"));
        Console.SetError(new OutputWriter("error"));
        var compiled = false;
        try
        {
            var files = JsonSerializer.Deserialize<Dictionary<string, string>>(filesJson)!;
            var timer = Stopwatch.StartNew();
            var project = LessonProject.Read(files);
            if (project.FileName != null)
                CompilationOutput($"Project: {project.FileName} (browser-supported settings; no MSBuild or package restore)", "info");
            var sources = files.Where(file => file.Key.EndsWith(".cs", StringComparison.Ordinal)).ToArray();
            CompilationOutput($"Compiling {sources.Length} C# source file(s)…", "info");
            foreach (var file in sources) CompilationOutput($"  {file.Key}", "log");
            var trees = sources.Select(file => CSharpSyntaxTree.ParseText(file.Value,
                project.ParseOptions, path: file.Key)).ToList();
            if (project.ImplicitUsings)
                trees.Add(CSharpSyntaxTree.ParseText("global using System; global using System.Collections.Generic; global using System.IO; global using System.Linq; global using System.Net.Http; global using System.Threading; global using System.Threading.Tasks;",
                    project.ParseOptions, path: "obj/ImplicitUsings.g.cs"));
            var compilation = CSharpCompilation.Create("Lesson_" + Guid.NewGuid().ToString("N"),
                trees, References, project.CompilationOptions);
            using var image = new MemoryStream();
            var result = compilation.Emit(image);
            foreach (var diagnostic in result.Diagnostics.Where(d => d.Severity is DiagnosticSeverity.Error or DiagnosticSeverity.Warning))
                CompilationOutput(diagnostic.ToString(), diagnostic.Severity == DiagnosticSeverity.Error ? "error" : "warn");
            var errors = result.Diagnostics.Count(d => d.Severity == DiagnosticSeverity.Error);
            var warnings = result.Diagnostics.Count(d => d.Severity == DiagnosticSeverity.Warning);
            CompilationOutput($"Compilation {(result.Success ? "succeeded" : "failed")}: {errors} error(s), {warnings} warning(s) ({timer.ElapsedMilliseconds} ms).",
                result.Success ? "success" : "error");
            if (!result.Success) return;
            compiled = true;
            var assembly = Assembly.Load(image.ToArray());
            // Reflection's EntryPoint is a synchronous wrapper for async Main.
            // Invoke the original Roslyn entry method so Task continuations can
            // yield to the worker event loop instead of blocking a WASM monitor.
            var symbol = compilation.GetEntryPoint(default)!;
            var entry = assembly.EntryPoint!.DeclaringType!
                .GetMethods(BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic)
                .Single(method => method.Name == symbol.MetadataName &&
                    method.GetParameters().Length == symbol.Parameters.Length &&
                    method.GetParameters().All(parameter => parameter.ParameterType == typeof(string[])));
            var returned = entry.Invoke(null, entry.GetParameters().Length == 0 ? null : new object[] { Array.Empty<string>() });
            if (returned is Task task) await task;
        }
        catch (Exception exception)
        {
            var error = exception is TargetInvocationException { InnerException: not null } wrapper ? wrapper.InnerException : exception;
            var message = $"{error!.GetType().Name}: {error.Message}";
            if (compiled) Write(message, "error");
            else CompilationOutput(message, "error");
        }
        finally
        {
            Console.Out.Flush();
            Console.Error.Flush();
        }
    }

    private sealed class OutputWriter(string level) : TextWriter
    {
        private readonly StringBuilder buffer = new();
        public override Encoding Encoding => Encoding.UTF8;
        public override void Write(char value)
        {
            if (value == '\n') { Compiler.Write(buffer.ToString().TrimEnd('\r'), level); buffer.Clear(); }
            else { buffer.Append(value); if (buffer.Length >= 4096) Flush(); }
        }
        public override void Write(string? value) { if (value != null) foreach (var character in value) Write(character); }
        public override void Flush() { if (buffer.Length > 0) { Compiler.Write(buffer.ToString(), level); buffer.Clear(); } }
    }
}
